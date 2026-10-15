import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";

const overrideSchema = z.object({
  enrolmentId: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "EXCUSED", "LATE"]),
  reason: z.string().min(3, "A valid reason for manual attendance correction is mandatory"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; sessionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, sessionId } = await params;
    const body = await req.json();
    const result = overrideSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { enrolmentId, status, reason } = result.data;

    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { course: true },
    });

    if (!session || session.course.lecturerId !== user.id) {
      return NextResponse.json({ error: "Session not found or access denied." }, { status: 404 });
    }

    const enrolment = await prisma.courseEnrolment.findUnique({
      where: { id: enrolmentId },
      include: { student: true },
    });

    if (!enrolment || enrolment.courseId !== session.courseId) {
      return NextResponse.json({ error: "Enrolment record not found." }, { status: 404 });
    }

    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        sessionId_enrolmentId: {
          sessionId: session.id,
          enrolmentId: enrolment.id,
        },
      },
    });

    const previousStatus = existingRecord ? existingRecord.status : "NONE";

    // Upsert the attendance record with manual override metadata
    const record = await prisma.attendanceRecord.upsert({
      where: {
        sessionId_enrolmentId: {
          sessionId: session.id,
          enrolmentId: enrolment.id,
        },
      },
      create: {
        sessionId: session.id,
        enrolmentId: enrolment.id,
        status,
        verificationMethod: session.verificationMethod,
        verificationStatus: "MANUAL_OVERRIDE",
        checkInTime: new Date(),
        isManualOverride: true,
        overrideReason: reason.trim(),
        overrideByLecturerId: user.id,
      },
      update: {
        status,
        verificationStatus: "MANUAL_OVERRIDE",
        isManualOverride: true,
        overrideReason: reason.trim(),
        overrideByLecturerId: user.id,
      },
    });

    // Write persistent audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        courseId: session.courseId,
        sessionId: session.id,
        action: "MANUAL_ATTENDANCE_OVERRIDE",
        details: JSON.stringify({
          studentId: enrolment.studentId,
          matricNumber: enrolment.student.matricNumber,
          studentName: enrolment.student.fullName,
          previousStatus,
          newStatus: status,
          reason: reason.trim(),
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Manual attendance recorded for ${enrolment.student.fullName} as ${status}.`,
      record,
    });
  } catch (error) {
    console.error("[Manual Override Error]:", error);
    return NextResponse.json(
      { error: "Failed to apply manual attendance override." },
      { status: 500 }
    );
  }
}
