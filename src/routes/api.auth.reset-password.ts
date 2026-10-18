import { z } from "zod";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { applySecurityHeaders } from "@/lib/security-headers";

const resetSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return applySecurityHeaders(Response.json({ error: "Method not allowed" }, { status: 405 }));
  }

  // Rate limit password resets: max 10 attempts per 15 minutes per IP
  const clientIp = getClientIp(request);
  const ipLimit = checkRateLimit(`reset-password:ip:${clientIp}`, {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
  });

  if (!ipLimit.success) {
    return applySecurityHeaders(
      Response.json(
        { error: "Too many password reset attempts. Please wait a few minutes." },
        {
          status: 429,
          headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
        }
      )
    );
  }

  try {
    const body = await request.json();
    const result = resetSchema.safeParse(body);

    if (!result.success) {
      return applySecurityHeaders(
        Response.json(
          { error: "Validation failed", details: result.error.flatten().fieldErrors },
          { status: 400 }
        )
      );
    }

    const { token, password } = result.data;

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.usedAt !== null) {
      return applySecurityHeaders(
        Response.json(
          { error: "This password reset link is invalid or has already been used." },
          { status: 400 }
        )
      );
    }

    if (resetRecord.expiresAt < new Date()) {
      return applySecurityHeaders(
        Response.json(
          { error: "This password reset link has expired. Please request a new one." },
          { status: 410 }
        )
      );
    }

    const newHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return applySecurityHeaders(
      Response.json({
        success: true,
        message: "Your password has been successfully reset. You may now sign in.",
      })
    );
  } catch (error) {
    console.error("[Reset Password Error]:", error);
    return applySecurityHeaders(
      Response.json(
        { error: "Failed to reset password. Please try again." },
        { status: 500 }
      )
    );
  }
}
