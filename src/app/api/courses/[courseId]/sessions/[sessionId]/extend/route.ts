import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";

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
    const additionalMinutes = parseInt(body.minutes || "10", 10);

    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { course: true },
    });

    if (!session || session.course.lecturerId !== user.id) {
      return NextResponse.json({ error: "Session not found or unauthorized." }, { status: 404 });
    }

    const currentExpiry = new Date(session.expiresAt).getTime();
    const newExpiry = new Date(Math.max(currentExpiry, Date.now()) + additionalMinutes * 60 * 1000);

    const updated = await prisma.attendanceSession.update({
      where: { id: sessionId },
      data: {
        expiresAt: newExpiry,
        status: "OPEN", // Reopen if expired
      },
    });

    return NextResponse.json({
      success: true,
      message: `Session extended by ${additionalMinutes} minutes.`,
      expiresAt: updated.expiresAt,
    });
  } catch (error) {
    console.error("[Extend Session Error]:", error);
    return NextResponse.json({ error: "Failed to extend session." }, { status: 500 });
  }
}
