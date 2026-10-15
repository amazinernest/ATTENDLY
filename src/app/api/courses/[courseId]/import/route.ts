import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { parseClassListFile } from "@/lib/importers";

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

    // Strict tenant ownership verification
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrolments: {
          where: { status: "ACTIVE" },
          include: { student: { select: { matricNumber: true } } },
        },
      },
    });

    if (!course || course.lecturerId !== user.id) {
      return NextResponse.json(
        { error: "Course not found or access denied." },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Limit file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the file safely
    const parsed = await parseClassListFile(buffer, file.name);

    if (!parsed.success && parsed.validRows.length === 0) {
      return NextResponse.json(
        {
          error: "Could not extract student records from file.",
          details: parsed.invalidRows,
        },
        { status: 422 }
      );
    }

    // Identify which students are already enrolled in this course
    const existingMatrics = new Set(
      course.enrolments.map((e) => e.student.matricNumber.toUpperCase())
    );

    const validRowsWithStatus = parsed.validRows.map((row) => ({
      ...row,
      isAlreadyEnrolled: existingMatrics.has(row.matricNumber.toUpperCase()),
    }));

    return NextResponse.json({
      success: true,
      fileName: file.name,
      totalExtracted: parsed.totalExtracted,
      validRows: validRowsWithStatus,
      invalidRows: parsed.invalidRows,
      detectedColumns: parsed.detectedColumns,
    });
  } catch (error) {
    console.error("[Import Preview Error]:", error);
    return NextResponse.json(
      { error: "Failed to process class list file." },
      { status: 500 }
    );
  }
}
