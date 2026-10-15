import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { calculateCourseAttendance } from "@/lib/reports";
import { generateCoursePdfReport } from "@/lib/reports/pdf";

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
    const buffer = await generateCoursePdfReport(reportData);

    const safeCourseCode = reportData.course.code.replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeSession = reportData.course.session.replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeSemester = reportData.course.semester.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${safeCourseCode}_${safeSession}_${safeSemester}_Report.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("[PDF Export Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF attendance report." },
      { status: 500 }
    );
  }
}
