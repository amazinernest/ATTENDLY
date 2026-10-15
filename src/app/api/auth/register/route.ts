import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import prisma from "@/lib/db";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid institutional email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().optional(),
  institution: z.string().max(150).optional(),
  department: z.string().max(100).optional(),
  agreeTerms: z.boolean().optional(),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError =
        fieldErrors.confirmPassword?.[0] ||
        fieldErrors.password?.[0] ||
        fieldErrors.email?.[0] ||
        fieldErrors.fullName?.[0] ||
        "Please check your input details and try again.";

      return NextResponse.json(
        { error: firstError, details: fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, email, password, institution, department } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // If SMTP is not configured or in development mode, automatically verify email
    // so the lecturer can access their workspace immediately without being blocked
    const isSmtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
    const shouldAutoVerify = !isSmtpConfigured || process.env.NODE_ENV !== "production";

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName: fullName.trim(),
        institution: institution?.trim() || null,
        department: department?.trim() || null,
        isEmailVerified: shouldAutoVerify,
      },
    });

    // Generate single-use verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Dispatch verification email (or log to server console in dev)
    await sendVerificationEmail(normalizedEmail, token);

    // Immediately establish the session cookie so user is logged in
    const sessionToken = await createSessionToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    });
    await setSessionCookie(sessionToken);

    return NextResponse.json(
      {
        success: true,
        message: "Account registered successfully! Redirecting to your dashboard...",
        autoVerified: shouldAutoVerify,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register Error]:", error);
    return NextResponse.json(
      { error: "An error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
