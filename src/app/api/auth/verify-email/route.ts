import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid or missing token" }, { status: 400 });
    }

    const verificationRecord = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification token." },
        { status: 400 }
      );
    }

    if (verificationRecord.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { id: verificationRecord.id } });
      return NextResponse.json(
        { error: "Verification token has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: verificationRecord.userId },
      data: { isEmailVerified: true },
    });

    // Delete used token
    await prisma.emailVerificationToken.delete({
      where: { id: verificationRecord.id },
    });

    // Log the user in directly
    const sessionToken = await createSessionToken({
      userId: verificationRecord.user.id,
      email: verificationRecord.user.email,
      fullName: verificationRecord.user.fullName,
    });
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! Redirecting to your dashboard...",
    });
  } catch (error) {
    console.error("[Verify Email Error]:", error);
    return NextResponse.json(
      { error: "Failed to verify email. Please try again." },
      { status: 500 }
    );
  }
}
