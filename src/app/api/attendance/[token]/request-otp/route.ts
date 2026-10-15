import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import prisma from "@/lib/db";
import { sendStudentOtpEmail } from "@/lib/email";

const requestOtpSchema = z.object({
  matricNumber: z.string().min(2),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();
    const result = requestOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Matriculation number is required" }, { status: 400 });
    }

    const cleanMatric = result.data.matricNumber.trim().toUpperCase();

    const session = await prisma.attendanceSession.findUnique({
      where: { token },
      include: {
        course: { select: { id: true, code: true } },
      },
    });

    if (!session || session.status !== "OPEN" || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Attendance session is not active." }, { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: { matricNumber: cleanMatric },
      include: {
        enrolments: {
          where: { courseId: session.courseId, status: "ACTIVE" },
        },
      },
    });

    if (!student || student.enrolments.length === 0) {
      return NextResponse.json(
        { error: "Matriculation number is not enrolled in this course." },
        { status: 404 }
      );
    }

    if (!student.email) {
      return NextResponse.json(
        {
          error: "No registered institutional email found for this student. Please contact your lecturer to mark attendance manually or verify via PIN.",
        },
        { status: 400 }
      );
    }

    // Generate 6-digit numeric OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(rawOtp).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any pending unverified OTPs for this student/session
    await prisma.studentVerificationOTP.deleteMany({
      where: {
        sessionId: session.id,
        studentId: student.id,
        verifiedAt: null,
      },
    });

    await prisma.studentVerificationOTP.create({
      data: {
        sessionId: session.id,
        studentId: student.id,
        email: student.email,
        otpHash,
        expiresAt,
      },
    });

    // Send email
    await sendStudentOtpEmail(student.email, rawOtp, session.course.code);

    // Mask student email for privacy: e.g. "a***e@uni.edu.ng"
    const [namePart, domainPart] = student.email.split("@");
    const maskedName =
      namePart.length <= 2
        ? namePart[0] + "*"
        : namePart[0] + "*".repeat(namePart.length - 2) + namePart[namePart.length - 1];
    const maskedEmail = `${maskedName}@${domainPart}`;

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${maskedEmail}`,
      maskedEmail,
      devOtp: process.env.NODE_ENV !== "production" ? rawOtp : undefined,
    });
  } catch (error) {
    console.error("[Request OTP Error]:", error);
    return NextResponse.json(
      { error: "Failed to dispatch verification code." },
      { status: 500 }
    );
  }
}
