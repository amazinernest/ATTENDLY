import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";

const commitSchema = z.object({
  students: z.array(
    z.object({
      matricNumber: z.string().min(2),
      fullName: z.string().min(1),
      email: z.string().email().optional().or(z.literal("")),
      department: z.string().optional(),
      faculty: z.string().optional(),
      level: z.string().optional(),
      studentPin: z.string().optional(),
    })
  ),
  actionOnExisting: z.enum(["retain", "update"]).default("update"),
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
    const result = commitSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid student payload.", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { students, actionOnExisting } = result.data;
    if (students.length === 0) {
      return NextResponse.json({ error: "No students provided for import." }, { status: 400 });
    }

    let addedCount = 0;
    let updatedCount = 0;

    // Execute in transaction to maintain data integrity
    await prisma.$transaction(async (tx) => {
      for (const s of students) {
        const cleanMatric = s.matricNumber.trim().toUpperCase();
        const cleanName = s.fullName.trim();
        const cleanEmail = s.email ? s.email.trim().toLowerCase() : null;

        // 1. Upsert Student record
        const student = await tx.student.upsert({
          where: { matricNumber: cleanMatric },
          create: {
            matricNumber: cleanMatric,
            fullName: cleanName,
            email: cleanEmail,
            department: s.department?.trim() || null,
            faculty: s.faculty?.trim() || null,
            level: s.level?.trim() || null,
            studentPin: s.studentPin?.trim() || null,
          },
          update: actionOnExisting === "update"
            ? {
                fullName: cleanName,
                email: cleanEmail || undefined,
                department: s.department?.trim() || undefined,
                faculty: s.faculty?.trim() || undefined,
                level: s.level?.trim() || undefined,
                studentPin: s.studentPin?.trim() || undefined,
              }
            : {},
        });

        // 2. Upsert CourseEnrolment (NEVER deletes historical attendance records!)
        const enrolment = await tx.courseEnrolment.upsert({
          where: {
            courseId_studentId: {
              courseId: course.id,
              studentId: student.id,
            },
          },
          create: {
            courseId: course.id,
            studentId: student.id,
            status: "ACTIVE",
          },
          update: {
            status: "ACTIVE", // reactivate if previously marked withdrawn
          },
        });

        addedCount++;
      }

      // 3. Write Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          courseId: course.id,
          action: "ROSTER_IMPORTED",
          details: JSON.stringify({
            totalProcessed: students.length,
            addedCount,
            updatedCount,
            actionOnExisting,
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${students.length} students into roster.`,
      addedCount,
      updatedCount,
    });
  } catch (error) {
    console.error("[Commit Roster Error]:", error);
    return NextResponse.json(
      { error: "Failed to save student records to course roster." },
      { status: 500 }
    );
  }
}
