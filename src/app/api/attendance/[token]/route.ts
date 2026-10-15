import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const session = await prisma.attendanceSession.findUnique({
      where: { token },
      include: {
        course: {
          select: {
            code: true,
            title: true,
            session: true,
            semester: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Attendance session not found or link is invalid." },
        { status: 404 }
      );
    }

    const isExpired = session.expiresAt < new Date();
    const isClosed = session.status === "CLOSED" || session.status === "CANCELLED" || isExpired;

    return NextResponse.json({
      success: true,
      courseCode: session.course.code,
      courseTitle: session.course.title,
      academicSession: session.course.session,
      semester: session.course.semester,
      topic: session.topic || "Lecture Attendance",
      status: isClosed ? "CLOSED" : "OPEN",
      verificationMethod: session.verificationMethod,
      requiresInClassPin: !!session.sessionPin,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error("[Session Query Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session details." },
      { status: 500 }
    );
  }
}
