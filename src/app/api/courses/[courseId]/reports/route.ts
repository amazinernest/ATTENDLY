import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { calculateCourseAttendance } from "@/lib/reports";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const reportData = await calculateCourseAttendance(courseId, user.id);

    return NextResponse.json({ success: true, report: reportData });
  } catch (error: any) {
    console.error("[Report Calculation Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate course attendance records." },
      { status: 500 }
    );
  }
}
