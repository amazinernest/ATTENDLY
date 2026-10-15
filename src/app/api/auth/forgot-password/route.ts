import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import prisma from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const email = result.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always respond with success to avoid leaking account existence (Section 4 & 6)
    if (user) {
      // Invalidate existing unused reset tokens for this user
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

      await sendPasswordResetEmail(user.email, token);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email address, password reset instructions have been sent.",
    });
  } catch (error) {
    console.error("[Forgot Password Error]:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
