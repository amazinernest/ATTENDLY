import { z } from "zod";
import crypto from "crypto";
import prisma from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { applySecurityHeaders } from "@/lib/security-headers";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return applySecurityHeaders(Response.json({ error: "Method not allowed" }, { status: 405 }));
  }

  // Rate limit password reset requests: max 6 per 15 minutes per IP
  const clientIp = getClientIp(request);
  const ipLimit = checkRateLimit(`forgot-password:ip:${clientIp}`, {
    maxRequests: 6,
    windowMs: 15 * 60 * 1000,
  });

  if (!ipLimit.success) {
    return applySecurityHeaders(
      Response.json(
        { error: "Too many password reset requests. Please wait a few minutes before trying again." },
        {
          status: 429,
          headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
        }
      )
    );
  }

  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return applySecurityHeaders(
        Response.json({ error: "Please enter a valid email address." }, { status: 400 })
      );
    }

    const email = result.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

      try {
        await sendPasswordResetEmail(user.email, token);
      } catch (err) {
        console.error("[Email send error]:", err);
      }
    }

    return applySecurityHeaders(
      Response.json({
        success: true,
        message: "If an account exists with this email address, password reset instructions have been sent.",
      })
    );
  } catch (error) {
    console.error("[Forgot Password Error]:", error);
    return applySecurityHeaders(
      Response.json(
        { error: "An error occurred while processing your request." },
        { status: 500 }
      )
    );
  }
}
