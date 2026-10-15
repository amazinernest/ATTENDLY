import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { generateStudentPin } from "@/lib/importers";

const studentActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("add"),
    matricNumber: z.string().min(2),
    fullName: z.string().min(2),
    email: z.string().email().optional().or(z.literal("")),
    department: z.string().optional(),
    level: z.string().optional(),
    studentPin: z.string().optional(),
  }),
  z.object({
    action: z.literal("update"),
    studentId: z.string(),
    fullName: z.string().min(2),
    email: z.string().email().optional().or(z.literal("")),
    department: z.string().optional(),
    level: z.string().optional(),
    studentPin: z.string().optional(),
  }),
  z.object({
    action: z.literal("withdraw"),
    studentId: z.string(),
    reason: z.string().optional(),
  }),
  z.object({
    action: z.literal("re-enroll"),
    studentId: z.string(),
  }),
]);

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
    const result = studentActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    if (data.action === "add") {
      const cleanMatric = data.matricNumber.trim().toUpperCase();
      const cleanName = data.fullName.trim();
      const cleanEmail = data.email ? data.email.trim().toLowerCase() : null;

      const student = await prisma.student.upsert({
        where: { matricNumber: cleanMatric },
        create: {
          matricNumber: cleanMatric,
          fullName: cleanName,
          email: cleanEmail,
          department: data.department?.trim() || null,
          level: data.level?.trim() || null,
          studentPin: data.studentPin?.trim() || generateStudentPin(),
        },
        update: {
          fullName: cleanName,
          email: cleanEmail || undefined,
          department: data.department?.trim() || undefined,
          level: data.level?.trim() || undefined,
        },
      });

      await prisma.courseEnrolment.upsert({
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
          status: "ACTIVE",
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          courseId: course.id,
          action: "STUDENT_ADDED_MANUALLY",
          details: JSON.stringify({ matricNumber: cleanMatric, fullName: cleanName }),
        },
      });

      return NextResponse.json({ success: true, student });
    }

    if (data.action === "update") {
      const student = await prisma.student.update({
        where: { id: data.studentId },
        data: {
          fullName: data.fullName.trim(),
          email: data.email ? data.email.trim().toLowerCase() : null,
          department: data.department?.trim() || null,
          level: data.level?.trim() || null,
          studentPin: data.studentPin?.trim() || undefined,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          courseId: course.id,
          action: "STUDENT_UPDATED",
          details: JSON.stringify({ studentId: student.id, matricNumber: student.matricNumber }),
        },
      });

      return NextResponse.json({ success: true, student });
    }

    if (data.action === "withdraw") {
      // Mark enrolment WITHDRAWN, never delete historical records
      await prisma.courseEnrolment.update({
        where: {
          courseId_studentId: {
            courseId: course.id,
            studentId: data.studentId,
          },
        },
        data: {
          status: "WITHDRAWN",
          withdrawnAt: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          courseId: course.id,
          action: "STUDENT_WITHDRAWN",
          details: JSON.stringify({ studentId: data.studentId, reason: data.reason }),
        },
      });

      return NextResponse.json({ success: true, message: "Student withdrawn from course." });
    }

    if (data.action === "re-enroll") {
      await prisma.courseEnrolment.update({
        where: {
          courseId_studentId: {
            courseId: course.id,
            studentId: data.studentId,
          },
        },
        data: {
          status: "ACTIVE",
          withdrawnAt: null,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          courseId: course.id,
          action: "STUDENT_REENROLLED",
          details: JSON.stringify({ studentId: data.studentId }),
        },
      });

      return NextResponse.json({ success: true, message: "Student re-enrolled in course." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("[Student Action Error]:", error);
    return NextResponse.json(
      { error: "Failed to process student action." },
      { status: 500 }
    );
  }
}
