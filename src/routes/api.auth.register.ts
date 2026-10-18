import { z } from "zod";
import crypto from "crypto";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sessionStorage } from "@/lib/session.server";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { applySecurityHeaders } from "@/lib/security-headers";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().email("Please provide a valid institutional email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().optional(),
    institution: z.string().max(150).optional(),
    department: z.string().max(100).optional(),
    agreeTerms: z.boolean().optional(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return applySecurityHeaders(Response.json({ error: "Method not allowed" }, { status: 405 }));
  }

  // Rate limit registration: max 12 attempts per hour per IP to block bot farms
  const clientIp = getClientIp(request);
  const ipLimit = checkRateLimit(`register:ip:${clientIp}`, {
    maxRequests: 12,
    windowMs: 60 * 60 * 1000,
  });

  if (!ipLimit.success) {
    return applySecurityHeaders(
      Response.json(
        { error: "Too many registration attempts. Please wait an hour before trying again." },
        {
          status: 429,
          headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
        }
      )
    );
  }

  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError =
        fieldErrors.confirmPassword?.[0] ||
        fieldErrors.password?.[0] ||
        fieldErrors.email?.[0] ||
        fieldErrors.fullName?.[0] ||
        "Please check your input details and try again.";

      return applySecurityHeaders(
        Response.json(
          { error: firstError, details: fieldErrors },
          { status: 400 }
        )
      );
    }

    const { fullName, email, password, institution, department } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return applySecurityHeaders(
        Response.json(
          { error: "An account with this email address already exists. Please sign in instead." },
          { status: 409 }
        )
      );
    }

    const passwordHash = await hashPassword(password);

    // If SMTP is not configured or in development mode, automatically verify email
    const isSmtpConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    );
    const shouldAutoVerify = !isSmtpConfigured || process.env.NODE_ENV !== "production";

    const user = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        passwordHash,
        institution: institution || null,
        department: department || null,
        isEmailVerified: shouldAutoVerify,
        timeZone: "Africa/Lagos",
      },
    });

    if (!shouldAutoVerify) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.emailVerificationToken.create({
        data: {
          token: rawToken,
          userId: user.id,
          expiresAt,
        },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:5173";
      const verificationLink = `${appUrl}/verify-email?token=${rawToken}`;

      try {
        await sendVerificationEmail(user.email, rawToken);
      } catch (emailError) {
        console.error("[Email Dispatch Error]:", emailError);
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
            isEmailVerified: user.isEmailVerified,
          },
          requiresVerification: !shouldAutoVerify,
        },
        {
          status: 201,
          headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
          },
        }
      )
    );
  } catch (error: any) {
    console.error("[Register Action Error]:", error);
    if (error?.code === "P2002") {
      return applySecurityHeaders(
        Response.json(
          { error: "An account with this email address already exists. Please sign in instead." },
          { status: 409 }
        )
      );
    }
    const message =
      process.env.NODE_ENV !== "production" && error?.message
        ? `Registration error: ${error.message}`
        : "Registration failed due to a server error. Please try again.";
    return applySecurityHeaders(Response.json({ error: message }, { status: 500 }));
  }
}
