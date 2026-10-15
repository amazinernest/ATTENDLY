import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { searchParams } = new URL(req.url);
    const matric = searchParams.get("matric");

    if (!matric || matric.trim().length < 2) {
      return NextResponse.json(
        { error: "Matriculation number is required" },
        { status: 400 }
      );
    }

    const cleanMatric = matric.trim().toUpperCase().replace(/\\/g, "/");

    // 1. Find session
    const session = await prisma.attendanceSession.findUnique({
      where: { token },
      select: {
        id: true,
        courseId: true,
        status: true,
        expiresAt: true,
        sessionPin: true,
        verificationMethod: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isClosed = session.status === "CLOSED" || session.expiresAt < new Date();

    // 2. Find student by matriculation number enrolled in this course
    let student = await prisma.student.findUnique({
      where: { matricNumber: cleanMatric },
      include: {
        enrolments: {
          where: {
            courseId: session.courseId,
            status: "ACTIVE",
          },
          include: {
            records: {
              where: { sessionId: session.id },
            },
          },
        },
      },
    });

    if (!student || student.enrolments.length === 0) {
      student = await prisma.student.findFirst({
        where: {
          matricNumber: { equals: cleanMatric, mode: "insensitive" },
        },
        include: {
          enrolments: {
            where: {
              courseId: session.courseId,
              status: "ACTIVE",
            },
            include: {
              records: {
                where: { sessionId: session.id },
              },
            },
          },
        },
      });
    }

    if (!student || student.enrolments.length === 0) {
      return NextResponse.json({
        found: false,
        matricNumber: cleanMatric,
        message: "Not enrolled in this course",
      });
    }

    const enrolment = student.enrolments[0];
    const existingRecord = enrolment.records[0];
    const alreadyRecorded = !!existingRecord;

    return NextResponse.json({
      found: true,
      student: {
        id: student.id,
        fullName: student.fullName,
        matricNumber: student.matricNumber,
        department: student.department,
        hasStudentPin: !!student.studentPin,
        devStudentPin: process.env.NODE_ENV === "development" ? student.studentPin : undefined,
      },
      alreadyRecorded,
      checkInTime: alreadyRecorded ? existingRecord.checkInTime : null,
      formattedCheckInTime: alreadyRecorded ? formatDateTime(existingRecord.checkInTime) : null,
      sessionStatus: isClosed ? "CLOSED" : "OPEN",
    });
  } catch (error) {
    console.error("[Student Lookup Error]:", error);
    return NextResponse.json(
      { error: "Failed to look up student." },
      { status: 500 }
    );
  }
}
