import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { generateQrCodeDataUrl } from "@/lib/attendance";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; sessionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, sessionId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.lecturerId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 404 });
    }

    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        records: {
          include: {
            enrolment: {
              include: {
                student: true,
              },
            },
          },
          orderBy: { checkInTime: "desc" },
        },
      },
    });

    if (!session || session.courseId !== course.id) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    // Get total active enrolled students for percentage calculations
    const activeEnrolments = await prisma.courseEnrolment.findMany({
      where: { courseId: course.id, status: "ACTIVE" },
      include: { student: true },
      orderBy: { student: { matricNumber: "asc" } },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const qrTargetUrl = session.sessionPin
      ? `${appUrl}/attendance/${session.token}?pin=${encodeURIComponent(session.sessionPin)}`
      : `${appUrl}/attendance/${session.token}`;
    const checkInUrl = `${appUrl}/attendance/${session.token}`;
    const qrCodeDataUrl = await generateQrCodeDataUrl(qrTargetUrl);

    return NextResponse.json({
      success: true,
      session,
      checkInUrl,
      qrTargetUrl,
      qrCodeDataUrl,
      totalEnrolled: activeEnrolments.length,
      presentCount: session.records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length,
      enrolledStudents: activeEnrolments.map((e) => ({
        enrolmentId: e.id,
        studentId: e.student.id,
        matricNumber: e.student.matricNumber,
        fullName: e.student.fullName,
        email: e.student.email,
      })),
    });
  } catch (error) {
    console.error("[Session Fetch Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session data." },
      { status: 500 }
    );
  }
}
