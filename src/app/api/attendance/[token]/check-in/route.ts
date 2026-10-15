import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import prisma from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

const checkInSchema = z.object({
  matricNumber: z.string().min(2, "Matriculation number is required"),
  sessionPin: z.string().optional(),
  studentPin: z.string().optional(),
  otpCode: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();
    const result = checkInSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { matricNumber, sessionPin, studentPin, otpCode } = result.data;
    const cleanMatric = matricNumber.trim().toUpperCase().replace(/\\/g, "/");

    // 1. Verify session exists and is OPEN
    const session = await prisma.attendanceSession.findUnique({
      where: { token },
      include: {
        course: { select: { id: true, code: true, title: true } },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Attendance session does not exist or link is invalid." },
        { status: 404 }
      );
    }

    const now = new Date();
    if (session.status !== "OPEN" || session.expiresAt < now) {
      return NextResponse.json(
        { error: "This attendance session has ended or is currently closed. Please contact your lecturer." },
        { status: 403 }
      );
    }

    // 2. In-class display PIN verification (if configured on session)
    if (session.sessionPin) {
      if (!sessionPin || sessionPin.trim() !== session.sessionPin.trim()) {
        return NextResponse.json(
          { error: "Invalid in-class attendance PIN. Please check the code projected on the classroom board." },
          { status: 401 }
        );
      }
    }

    // 3. Find student enrolment
    let student = await prisma.student.findUnique({
      where: { matricNumber: cleanMatric },
      include: {
        enrolments: {
          where: {
            courseId: session.courseId,
            status: "ACTIVE",
          },
        },
      },
    });

    if (!student || student.enrolments.length === 0) {
      // Case-insensitive fallback
      student = await prisma.student.findFirst({
        where: {
          matricNumber: { equals: cleanMatric, mode: "insensitive" },
        },
        include: {
          enrolments: {
            where: {
              courseId: session.courseId,
              status: "ACTIVE",
            },
          },
        },
      });
    }

    if (!student || student.enrolments.length === 0) {
      return NextResponse.json(
        { error: `Matriculation number "${cleanMatric}" is not enrolled in ${session.course.code}.` },
        { status: 404 }
      );
    }

    const enrolment = student.enrolments[0];

    // 4. Prevent duplicate check-in (Section 10 & 11)
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        sessionId_enrolmentId: {
          sessionId: session.id,
          enrolmentId: enrolment.id,
        },
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        {
          error: `Attendance already recorded for ${student.fullName} at ${formatDateTime(
            existingRecord.checkInTime
          )}. Duplicate check-ins are not permitted.`,
          alreadyRecorded: true,
          studentName: student.fullName,
          matricNumber: student.matricNumber,
          courseCode: session.course.code,
          checkInTime: existingRecord.checkInTime,
        },
        { status: 409 }
      );
    }

    // 5. Identity verification method checks
    if (session.verificationMethod === "STUDENT_PIN") {
      if (student.studentPin) {
        if (!studentPin || studentPin.trim() !== student.studentPin.trim()) {
          return NextResponse.json(
            { error: "Incorrect student verification PIN. Please verify your credentials." },
            { status: 401 }
          );
        }
      }
    } else if (session.verificationMethod === "EMAIL_OTP") {
      if (!otpCode) {
        return NextResponse.json(
          { error: "One-time email verification code is required." },
          { status: 400 }
        );
      }

      const otpHash = crypto.createHash("sha256").update(otpCode.trim()).digest("hex");
      const validOtp = await prisma.studentVerificationOTP.findFirst({
        where: {
          sessionId: session.id,
          studentId: student.id,
          otpHash,
          expiresAt: { gt: now },
          verifiedAt: null,
        },
      });

      if (!validOtp) {
        return NextResponse.json(
          { error: "Invalid or expired one-time verification passcode." },
          { status: 401 }
        );
      }

      // Mark OTP as used
      await prisma.studentVerificationOTP.update({
        where: { id: validOtp.id },
        data: { verifiedAt: now },
      });
    }

    // 6. Record authoritative attendance
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const record = await prisma.attendanceRecord.create({
      data: {
        sessionId: session.id,
        enrolmentId: enrolment.id,
        status: "PRESENT",
        verificationMethod: session.verificationMethod,
        verificationStatus: "VERIFIED",
        checkInTime: now,
        ipAddress: String(ipAddress),
        userAgent: String(userAgent),
        isManualOverride: false,
      },
    });

    return NextResponse.json({
      success: true,
      studentName: student.fullName,
      matricNumber: student.matricNumber,
      courseCode: session.course.code,
      courseTitle: session.course.title,
      checkInTime: record.checkInTime,
      message: "Attendance confirmed successfully. You have been marked PRESENT.",
    });
  } catch (error: any) {
    // Catch unique constraint race condition
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Attendance has already been recorded for this student in this session." },
        { status: 409 }
      );
    }
    console.error("[Check-In Error]:", error);
    return NextResponse.json(
      { error: "Failed to confirm attendance. Please try again." },
      { status: 500 }
    );
  }
}
