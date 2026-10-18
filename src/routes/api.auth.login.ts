import { z } from "zod";
import prisma from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { sessionStorage } from "@/lib/session.server";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rate-limit";
import { applySecurityHeaders } from "@/lib/security-headers";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return applySecurityHeaders(Response.json({ error: "Method not allowed" }, { status: 405 }));
  }

  // Rate limit by IP: max 25 attempts per 15 minutes
  const clientIp = getClientIp(request);
  const ipLimit = checkRateLimit(`login:ip:${clientIp}`, {
    maxRequests: 25,
    windowMs: 15 * 60 * 1000,
  });

  if (!ipLimit.success) {
    return applySecurityHeaders(
      Response.json(
        { error: "Too many login attempts from this network. Please wait a few minutes before trying again." },
        {
          status: 429,
          headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
        }
      )
    );
  }

  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return applySecurityHeaders(
        Response.json(
          { error: "Please provide a valid email and password" },
          { status: 400 }
        )
      );
    }

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit per account: max 6 failed attempts per 15 minutes to prevent password guessing
    const accountLimit = checkRateLimit(`login:account:${normalizedEmail}`, {
      maxRequests: 6,
      windowMs: 15 * 60 * 1000,
    });

    if (!accountLimit.success) {
      return applySecurityHeaders(
        Response.json(
          { error: "Too many failed sign-in attempts for this account. Please wait a few minutes or reset your password." },
          {
            status: 429,
            headers: { "Retry-After": String(accountLimit.retryAfterSeconds) },
          }
        )
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return applySecurityHeaders(
        Response.json(
          { error: "Invalid email or password." },
          { status: 401 }
        )
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return applySecurityHeaders(
        Response.json(
          { error: "Invalid email or password." },
          { status: 401 }
        )
      );
    }

    // Credentials verified successfully - reset account rate limit window
    resetRateLimit(`login:account:${normalizedEmail}`);

    // Auto-verify email in development or if SMTP is not configured
    if (!user.isEmailVerified) {
      const isSmtpConfigured = !!(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASSWORD
      );
      if (!isSmtpConfigured || process.env.NODE_ENV !== "production") {
        await prisma.user.update({
          where: { id: user.id },
          data: { isEmailVerified: true },
        });
      } else {
        return applySecurityHeaders(
          Response.json(
            {
              error: "Your email address is not yet verified. Please check your inbox or verification link.",
              unverified: true,
              email: user.email,
            },
            { status: 403 }
          )
        );
      }
    }

    // Set standard session cookie
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.set("userId", user.id);

    return applySecurityHeaders(
      Response.json(
        {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            institution: user.institution,
          },
        },
        {
          status: 200,
          headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
          },
        }
      )
    );
  } catch (error) {
    console.error("[Login Action Error]:", error);
    return applySecurityHeaders(
      Response.json(
        { error: "An authentication error occurred. Please try again." },
        { status: 500 }
      )
    );
  }
}
