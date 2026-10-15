import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { closeAttendanceSession } from "@/lib/attendance";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; sessionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;
    const closed = await closeAttendanceSession(sessionId, user.id);

    return NextResponse.json({
      success: true,
      message: "Attendance session closed successfully.",
      session: closed,
    });
  } catch (error: any) {
    console.error("[Close Session Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to close attendance session." },
      { status: 500 }
    );
  }
}
