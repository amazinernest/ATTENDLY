import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const courseSchema = z.object({
  code: z.string().min(2, "Course code is required").max(30),
  title: z.string().min(3, "Course title is required").max(200),
  department: z.string().max(100).optional(),
  faculty: z.string().max(100).optional(),
  session: z.string().min(4, "Academic session is required").max(30), // e.g. 2026/2027
  semester: z.string().min(2, "Semester is required").max(50), // First Semester / Second Semester
  classGroup: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
  expectedSessions: z.number().int().positive().optional().nullable(),
  attendanceThreshold: z.number().min(1).max(100).default(75.0),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courses = await prisma.course.findMany({
    where: { lecturerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          enrolments: { where: { status: "ACTIVE" } },
          attendanceSessions: true,
        },
      },
    },
  });

  return NextResponse.json({ courses });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = courseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;
    const normalizedCode = data.code.trim().toUpperCase();

    // Check duplicate course for this lecturer in this session and semester
    const existing = await prisma.course.findUnique({
      where: {
        lecturerId_code_session_semester: {
          lecturerId: user.id,
          code: normalizedCode,
          session: data.session.trim(),
          semester: data.semester.trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: `A course with code ${normalizedCode} already exists for academic session ${data.session} (${data.semester}).`,
        },
        { status: 409 }
      );
    }

    const course = await prisma.course.create({
      data: {
        lecturerId: user.id,
        code: normalizedCode,
        title: data.title.trim(),
        department: data.department?.trim() || user.department || null,
        faculty: data.faculty?.trim() || null,
        session: data.session.trim(),
        semester: data.semester.trim(),
        classGroup: data.classGroup?.trim() || null,
        description: data.description?.trim() || null,
        expectedSessions: data.expectedSessions || null,
        attendanceThreshold: data.attendanceThreshold,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error) {
    console.error("[Create Course Error]:", error);
    return NextResponse.json(
      { error: "Failed to create course. Please verify your details." },
      { status: 500 }
    );
  }
}
