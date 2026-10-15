import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { createAttendanceSession } from "@/lib/attendance";

const sessionSchema = z.object({
  topic: z.string().max(200).optional(),
  durationMinutes: z.number().int().min(5).max(300).default(30),
  sessionPin: z.string().max(10).optional(),
  verificationMethod: z.enum(["EMAIL_OTP", "STUDENT_PIN", "OPEN_CHECKIN"]).default("STUDENT_PIN"),
  allowLateCheckin: z.boolean().default(false),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.lecturerId !== user.id) {
      return NextResponse.json({ error: "Course not found or access denied." }, { status: 404 });
    }

    const body = await req.json();
    const result = sessionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const session = await createAttendanceSession({
      courseId: course.id,
      topic: result.data.topic,
      durationMinutes: result.data.durationMinutes,
      sessionPin: result.data.sessionPin,
      verificationMethod: result.data.verificationMethod,
      allowLateCheckin: result.data.allowLateCheckin,
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        courseId: course.id,
        sessionId: session.id,
        action: "SESSION_STARTED",
        details: JSON.stringify({
          topic: session.topic,
          durationMinutes: result.data.durationMinutes,
          verificationMethod: session.verificationMethod,
        }),
      },
    });

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error) {
    console.error("[Create Session Error]:", error);
    return NextResponse.json(
      { error: "Failed to initiate attendance session." },
      { status: 500 }
    );
  }
}
