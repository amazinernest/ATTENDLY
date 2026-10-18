import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { z } from "zod";
import * as XLSX from "xlsx";
import crypto from "crypto";
import prisma from "@/lib/db";
import { getUser } from "@/lib/session.server";
import { formatDateTime } from "@/lib/utils";
import { hashPassword, verifyPassword } from "@/lib/auth";
import {
  createAttendanceSession,
  closeAttendanceSession,
  generateQrCodeDataUrl,
} from "@/lib/attendance";
import { generateStudentPin, parseClassListFile } from "@/lib/importers";
import { calculateCourseAttendance } from "@/lib/reports";
import { generateCourseExcelReport } from "@/lib/reports/excel";
import { generateCoursePdfReport } from "@/lib/reports/pdf";
import { sendStudentOtpEmail } from "@/lib/email";

// ==========================================
// Schemas
// ==========================================

const courseSchema = z.object({
  code: z.string().min(2, "Course code is required").max(30),
  title: z.string().min(3, "Course title is required").max(200),
  department: z.string().max(100).optional(),
  faculty: z.string().max(100).optional(),
  session: z.string().min(4, "Academic session is required").max(30),
  semester: z.string().min(2, "Semester is required").max(50),
  classGroup: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
  expectedSessions: z.number().int().positive().optional().nullable(),
  attendanceThreshold: z.number().min(1).max(100).default(75.0),
});

const courseUpdateSchema = z.object({
  code: z.string().min(2, "Course code is required").max(30).optional(),
  title: z.string().min(3, "Course title is required").max(200).optional(),
  department: z.string().max(100).optional().nullable(),
  faculty: z.string().max(100).optional().nullable(),
  session: z.string().min(4, "Academic session is required").max(30).optional(),
  semester: z.string().min(2, "Semester is required").max(50).optional(),
  classGroup: z.string().max(50).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  expectedSessions: z.number().int().positive().optional().nullable(),
  attendanceThreshold: z.number().min(1).max(100).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});

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

const sessionSchema = z.object({
  topic: z.string().max(200).optional(),
  durationMinutes: z.number().int().min(5).max(300).default(30),
  sessionPin: z.string().max(10).optional(),
  verificationMethod: z.enum(["EMAIL_OTP", "STUDENT_PIN", "OPEN_CHECKIN"]).default("STUDENT_PIN"),
  allowLateCheckin: z.boolean().default(false),
});

const overrideSchema = z.object({
  enrolmentId: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "EXCUSED", "LATE"]),
  reason: z.string().min(3, "A valid reason for manual attendance correction is mandatory"),
});

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

const requestOtpSchema = z.object({
  matricNumber: z.string().min(2),
});

const checkInSchema = z.object({
  matricNumber: z.string().min(2, "Matriculation number is required"),
  sessionPin: z.string().optional(),
  studentPin: z.string().optional(),
  otpCode: z.string().optional(),
  deviceId: z.string().optional(),
});

const settingsSchema = z.object({
  fullName: z.string().min(2).max(100),
  institution: z.string().max(150).optional(),
  department: z.string().max(100).optional(),
  timeZone: z.string().default("Africa/Lagos"),
  defaultThreshold: z.number().min(1).max(100).default(75.0),
  defaultSessionDuration: z.number().int().min(5).max(300).default(30),
  defaultVerificationMethod: z.enum(["STUDENT_PIN", "EMAIL_OTP", "OPEN_CHECKIN"]).default("STUDENT_PIN"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional().or(z.literal("")),
});

// ==========================================
// GET Loader Handler
// ==========================================

export async function loader({ request, params }: LoaderFunctionArgs) {
  const path = (params["*"] || "").replace(/^\/+|\/+$/g, "");
  const parts = path.split("/");

  // 1. GET /api/courses
  if (parts.length === 1 && parts[0] === "courses") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
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

    return Response.json({ courses });
  }

  // 1b. GET /api/courses/:courseId
  if (parts.length === 2 && parts[0] === "courses") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = parts[1];
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            enrolments: { where: { status: "ACTIVE" } },
            attendanceSessions: true,
          },
        },
      },
    });

    if (!course || course.lecturerId !== user.id) {
      return Response.json({ error: "Course not found or unauthorized" }, { status: 404 });
    }

    return Response.json({ course });
  }

  // 2. GET /api/courses/template/excel
  if (parts.length === 3 && parts[0] === "courses" && parts[1] === "template" && parts[2] === "excel") {
    const wb = XLSX.utils.book_new();
    const headers = [
      ["Matriculation Number", "Full Name", "Institutional Email", "Department", "Level"],
      ["CSC/2024/001", "Surname Firstname", "student@university.edu.ng", "Computer Science", "200"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    ws["!cols"] = [
      { wch: 25 },
      { wch: 30 },
      { wch: 35 },
      { wch: 25 },
      { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Class List Template");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="ClassMark_Class_List_Template.xlsx"',
      },
    });
  }

  // 3. GET /api/courses/:courseId/sessions/:sessionId
  if (parts.length === 4 && parts[0] === "courses" && parts[2] === "sessions") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = parts[1];
    const sessionId = parts[3];

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.lecturerId !== user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 404 });
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
      return Response.json({ error: "Session not found." }, { status: 404 });
    }

    const activeEnrolments = await prisma.courseEnrolment.findMany({
      where: { courseId: course.id, status: "ACTIVE" },
      include: { student: true },
      orderBy: { student: { matricNumber: "asc" } },
    });

    const url = new URL(request.url);
    const appUrl = `${url.protocol}//${url.host}`;
    const qrTargetUrl = session.sessionPin
      ? `${appUrl}/attendance/${session.token}?pin=${encodeURIComponent(session.sessionPin)}`
      : `${appUrl}/attendance/${session.token}`;
    const checkInUrl = `${appUrl}/attendance/${session.token}`;
    const qrCodeDataUrl = await generateQrCodeDataUrl(qrTargetUrl);

    return Response.json({
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
  }

  // 4. GET /api/courses/:courseId/reports
  if (parts.length === 3 && parts[0] === "courses" && parts[2] === "reports") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = parts[1];
    try {
      const reportData = await calculateCourseAttendance(courseId, user.id);
      return Response.json({ success: true, report: reportData });
    } catch (err: any) {
      const status = err.message?.includes("unauthorized") || err.message?.includes("not found") ? 404 : 500;
      return Response.json(
        { error: err.message || "Failed to calculate course attendance records." },
        { status }
      );
    }
  }

  // 5. GET /api/courses/:courseId/reports/excel
  if (parts.length === 4 && parts[0] === "courses" && parts[2] === "reports" && parts[3] === "excel") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = parts[1];
    try {
      const reportData = await calculateCourseAttendance(courseId, user.id);
      const buffer = await generateCourseExcelReport(reportData);
      const safeCourseCode = reportData.course.code.replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeSession = reportData.course.session.replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeSemester = reportData.course.semester.replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${safeCourseCode}_${safeSession}_${safeSemester}_Attendance.xlsx`;

      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store, max-age=0",
        },
      });
    } catch (err: any) {
      const status = err.message?.includes("unauthorized") || err.message?.includes("not found") ? 404 : 500;
      return Response.json(
        { error: err.message || "Failed to generate Excel attendance report." },
        { status }
      );
    }
  }

  // 6. GET /api/courses/:courseId/reports/pdf
  if (parts.length === 4 && parts[0] === "courses" && parts[2] === "reports" && parts[3] === "pdf") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = parts[1];
    try {
      const reportData = await calculateCourseAttendance(courseId, user.id);
      const buffer = await generateCoursePdfReport(reportData);
      const safeCourseCode = reportData.course.code.replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeSession = reportData.course.session.replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeSemester = reportData.course.semester.replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${safeCourseCode}_${safeSession}_${safeSemester}_Report.pdf`;

      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store, max-age=0",
        },
      });
    } catch (err: any) {
      const status = err.message?.includes("unauthorized") || err.message?.includes("not found") ? 404 : 500;
      return Response.json(
        { error: err.message || "Failed to generate PDF attendance report." },
        { status }
      );
    }
  }

  // 7. GET /api/attendance/:token
  if (parts.length === 2 && parts[0] === "attendance") {
    const token = parts[1];
    const session = await prisma.attendanceSession.findUnique({
      where: { token },
      include: {
        course: {
          select: {
            code: true,
            title: true,
            session: true,
            semester: true,
            lecturer: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return Response.json(
        { error: "Attendance session not found or link is invalid." },
        { status: 404 }
      );
    }

    const isExpired = session.expiresAt < new Date();
    const isClosed = session.status === "CLOSED" || session.status === "CANCELLED" || isExpired;

    return Response.json({
      success: true,
      courseCode: session.course.code,
      courseTitle: session.course.title,
      lecturerName: session.course.lecturer?.fullName || "Course Lecturer",
      academicSession: session.course.session,
      semester: session.course.semester,
      topic: session.topic || "Lecture Attendance",
      status: isClosed ? "CLOSED" : "OPEN",
      verificationMethod: session.verificationMethod,
      requiresInClassPin: !!session.sessionPin,
      expiresAt: session.expiresAt,
    });
  }

  // 8. GET /api/attendance/:token/lookup
  if (parts.length === 3 && parts[0] === "attendance" && parts[2] === "lookup") {
    const token = parts[1];
    const url = new URL(request.url);
    const matric = url.searchParams.get("matric");

    if (!matric || matric.trim().length < 2) {
      return Response.json({ error: "Matriculation number is required" }, { status: 400 });
    }

    const cleanMatric = matric.trim().toUpperCase().replace(/\\/g, "/");

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
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const isClosed = session.status === "CLOSED" || session.expiresAt < new Date();

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
      return Response.json({
        found: false,
        matricNumber: cleanMatric,
        message: "Not enrolled in this course",
      });
    }

    const enrolment = student.enrolments[0];
    const existingRecord = enrolment.records[0];
    const alreadyRecorded = !!existingRecord;

    return Response.json({
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
  }

  return Response.json({ error: "Not Found" }, { status: 404 });
}

// ==========================================
// POST / Action Handler
// ==========================================

export async function action({ request, params }: ActionFunctionArgs) {
  const path = (params["*"] || "").replace(/^\/+|\/+$/g, "");
  const parts = path.split("/");

  // 1. POST /api/courses
  if (parts.length === 1 && parts[0] === "courses") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const body = await request.json();
      const result = courseSchema.safeParse(body);
      if (!result.success) {
        return Response.json(
          { error: "Validation failed", details: result.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const data = result.data;
      const normalizedCode = data.code.trim().toUpperCase();

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
        return Response.json(
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

      return Response.json({ success: true, course }, { status: 201 });
    } catch (err) {
      console.error("[Create Course Error]:", err);
      return Response.json({ error: "Failed to create course." }, { status: 500 });
    }
  }

  // 1b. PUT / PATCH / DELETE /api/courses/:courseId (or POST /api/courses/:courseId/delete)
  if (
    (parts.length === 2 && parts[0] === "courses") ||
    (parts.length === 3 && parts[0] === "courses" && parts[2] === "delete")
  ) {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = parts[1];
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.lecturerId !== user.id) {
      return Response.json({ error: "Course not found or access denied." }, { status: 404 });
    }

    // Check if it's a deletion request (DELETE method or /delete route)
    const isExplicitDeleteRoute = parts.length === 3 && parts[2] === "delete";
    let isDeleteAction = request.method === "DELETE" || isExplicitDeleteRoute;

    let body: any = {};
    if (request.method !== "GET") {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    }

    if (body.action === "delete" || body._method === "DELETE") {
      isDeleteAction = true;
    }

    // Handle DELETE
    if (isDeleteAction) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "COURSE_DELETED",
            details: JSON.stringify({
              courseId: course.id,
              code: course.code,
              title: course.title,
              session: course.session,
              semester: course.semester,
            }),
          },
        });

        await prisma.course.delete({
          where: { id: courseId },
        });

        return Response.json({
          success: true,
          message: `Course ${course.code} has been successfully deleted.`,
        });
      } catch (err) {
        console.error("[Delete Course Error]:", err);
        return Response.json({ error: "Failed to delete course." }, { status: 500 });
      }
    }

    // Handle UPDATE (PUT / PATCH / POST)
    try {
      const result = courseUpdateSchema.safeParse(body);
      if (!result.success) {
        return Response.json(
          { error: "Validation failed", details: result.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const data = result.data;
      const targetCode = data.code !== undefined ? data.code.trim().toUpperCase() : course.code;
      const targetSession = data.session !== undefined ? data.session.trim() : course.session;
      const targetSemester = data.semester !== undefined ? data.semester.trim() : course.semester;

      // Uniqueness check across other courses for this lecturer
      if (
        targetCode !== course.code ||
        targetSession !== course.session ||
        targetSemester !== course.semester
      ) {
        const duplicate = await prisma.course.findUnique({
          where: {
            lecturerId_code_session_semester: {
              lecturerId: user.id,
              code: targetCode,
              session: targetSession,
              semester: targetSemester,
            },
          },
        });

        if (duplicate && duplicate.id !== course.id) {
          return Response.json(
            {
              error: `A course with code ${targetCode} already exists for academic session ${targetSession} (${targetSemester}).`,
            },
            { status: 409 }
          );
        }
      }

      const updateData: {
        code?: string;
        title?: string;
        department?: string | null;
        faculty?: string | null;
        session?: string;
        semester?: string;
        classGroup?: string | null;
        description?: string | null;
        expectedSessions?: number | null;
        attendanceThreshold?: number;
        status?: "ACTIVE" | "ARCHIVED";
      } = {};

      if (data.code !== undefined) updateData.code = targetCode;
      if (data.title !== undefined) updateData.title = data.title.trim();
      if (data.department !== undefined) updateData.department = data.department?.trim() || null;
      if (data.faculty !== undefined) updateData.faculty = data.faculty?.trim() || null;
      if (data.session !== undefined) updateData.session = targetSession;
      if (data.semester !== undefined) updateData.semester = targetSemester;
      if (data.classGroup !== undefined) updateData.classGroup = data.classGroup?.trim() || null;
      if (data.description !== undefined) updateData.description = data.description?.trim() || null;
      if (data.expectedSessions !== undefined) updateData.expectedSessions = data.expectedSessions;
      if (data.attendanceThreshold !== undefined) updateData.attendanceThreshold = data.attendanceThreshold;
      if (data.status !== undefined) updateData.status = data.status;

      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: updateData,
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          courseId: course.id,
          action: "COURSE_UPDATED",
          details: JSON.stringify({ changes: updateData }),
        },
      });

      return Response.json({
        success: true,
        course: updatedCourse,
        message: `Course ${updatedCourse.code} updated successfully.`,
      });
    } catch (err) {
      console.error("[Update Course Error]:", err);
      return Response.json({ error: "Failed to update course." }, { status: 500 });
    }
  }

  // 2. POST /api/courses/:courseId/students
  if (parts.length === 3 && parts[0] === "courses" && parts[2] === "students") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = parts[1];
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.lecturerId !== user.id) {
      return Response.json({ error: "Course not found or access denied." }, { status: 404 });
    }

    try {
      const body = await request.json();
      const result = studentActionSchema.safeParse(body);
      if (!result.success) {
        return Response.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
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

        return Response.json({ success: true, student });
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

        return Response.json({ success: true, student });
      }

      if (data.action === "withdraw") {
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

        return Response.json({ success: true, message: "Student withdrawn from course." });
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

        return Response.json({ success: true, message: "Student re-enrolled in course." });
      }

      return Response.json({ error: "Invalid action." }, { status: 400 });
    } catch (err) {
      console.error("[Student Action Error]:", err);
      return Response.json({ error: "Failed to process student action." }, { status: 500 });
    }
  }

  // 3. POST /api/courses/:courseId/sessions
  if (parts.length === 3 && parts[0] === "courses" && parts[2] === "sessions") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = parts[1];
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.lecturerId !== user.id) {
      return Response.json({ error: "Course not found or access denied." }, { status: 404 });
    }

    try {
      const body = await request.json();
      const result = sessionSchema.safeParse(body);
      if (!result.success) {
        return Response.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
      }

      const session = await createAttendanceSession({
        courseId: course.id,
        topic: result.data.topic,
        durationMinutes: result.data.durationMinutes,
        sessionPin: result.data.sessionPin,
        verificationMethod: result.data.verificationMethod,
        allowLateCheckin: result.data.allowLateCheckin,
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          courseId: course.id,
          sessionId: session.id,
          action: "SESSION_STARTED",
          details: JSON.stringify({
            topic: session.topic,
            durationMinutes: result.data.durationMinutes,
            verificationMethod: session.verificationMethod,
          }),
        },
      });

      return Response.json({ success: true, session }, { status: 201 });
    } catch (err) {
      console.error("[Create Session Error]:", err);
      return Response.json({ error: "Failed to initiate attendance session." }, { status: 500 });
    }
  }

  // 4. POST /api/courses/:courseId/sessions/:sessionId/close
  if (parts.length === 5 && parts[0] === "courses" && parts[2] === "sessions" && parts[4] === "close") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = parts[3];
    try {
      const closed = await closeAttendanceSession(sessionId, user.id);
      return Response.json({
        success: true,
        message: "Attendance session closed successfully.",
        session: closed,
      });
    } catch (err: any) {
      console.error("[Close Session Error]:", err);
      return Response.json({ error: err.message || "Failed to close attendance session." }, { status: 500 });
    }
  }

  // 5. POST /api/courses/:courseId/sessions/:sessionId/extend
  if (parts.length === 5 && parts[0] === "courses" && parts[2] === "sessions" && parts[4] === "extend") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = parts[3];
    try {
      const body = await request.json();
      const additionalMinutes = parseInt(body.minutes || "10", 10);

      const session = await prisma.attendanceSession.findUnique({
        where: { id: sessionId },
        include: { course: true },
      });

      if (!session || session.course.lecturerId !== user.id) {
        return Response.json({ error: "Session not found or unauthorized." }, { status: 404 });
      }

      const currentExpiry = new Date(session.expiresAt).getTime();
      const newExpiry = new Date(Math.max(currentExpiry, Date.now()) + additionalMinutes * 60 * 1000);

      const updated = await prisma.attendanceSession.update({
        where: { id: sessionId },
        data: {
          expiresAt: newExpiry,
          status: "OPEN",
        },
      });

      return Response.json({
        success: true,
        message: `Session extended by ${additionalMinutes} minutes.`,
        expiresAt: updated.expiresAt,
      });
    } catch (err) {
      console.error("[Extend Session Error]:", err);
      return Response.json({ error: "Failed to extend session." }, { status: 500 });
    }
  }

  // 6. POST /api/courses/:courseId/sessions/:sessionId/override
  if (parts.length === 5 && parts[0] === "courses" && parts[2] === "sessions" && parts[4] === "override") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = parts[1];
    const sessionId = parts[3];
    try {
      const body = await request.json();
      const result = overrideSchema.safeParse(body);
      if (!result.success) {
        return Response.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
      }

      const { enrolmentId, status, reason } = result.data;
      const session = await prisma.attendanceSession.findUnique({
        where: { id: sessionId },
        include: { course: true },
      });

      if (!session || session.course.lecturerId !== user.id) {
        return Response.json({ error: "Session not found or access denied." }, { status: 404 });
      }

      const enrolment = await prisma.courseEnrolment.findUnique({
        where: { id: enrolmentId },
        include: { student: true },
      });

      if (!enrolment || enrolment.courseId !== session.courseId) {
        return Response.json({ error: "Enrolment record not found." }, { status: 404 });
      }

      const existingRecord = await prisma.attendanceRecord.findUnique({
        where: {
          sessionId_enrolmentId: {
            sessionId: session.id,
            enrolmentId: enrolment.id,
          },
        },
      });

      const previousStatus = existingRecord ? existingRecord.status : "NONE";

      const record = await prisma.attendanceRecord.upsert({
        where: {
          sessionId_enrolmentId: {
            sessionId: session.id,
            enrolmentId: enrolment.id,
          },
        },
        create: {
          sessionId: session.id,
          enrolmentId: enrolment.id,
          status,
          verificationMethod: session.verificationMethod,
          verificationStatus: "MANUAL_OVERRIDE",
          checkInTime: new Date(),
          isManualOverride: true,
          overrideReason: reason.trim(),
          overrideByLecturerId: user.id,
        },
        update: {
          status,
          verificationStatus: "MANUAL_OVERRIDE",
          isManualOverride: true,
          overrideReason: reason.trim(),
          overrideByLecturerId: user.id,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          courseId: session.courseId,
          sessionId: session.id,
          action: "MANUAL_ATTENDANCE_OVERRIDE",
          details: JSON.stringify({
            studentId: enrolment.studentId,
            matricNumber: enrolment.student.matricNumber,
            studentName: enrolment.student.fullName,
            previousStatus,
            newStatus: status,
            reason: reason.trim(),
            timestamp: new Date().toISOString(),
          }),
        },
      });

      return Response.json({
        success: true,
        message: `Manual attendance recorded for ${enrolment.student.fullName} as ${status}.`,
        record,
      });
    } catch (err) {
      console.error("[Manual Override Error]:", err);
      return Response.json({ error: "Failed to apply manual attendance override." }, { status: 500 });
    }
  }

  // 7. POST /api/courses/:courseId/import
  if (parts.length === 3 && parts[0] === "courses" && parts[2] === "import") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = parts[1];
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
      return Response.json({ error: "Course not found or access denied." }, { status: 404 });
    }

    try {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return Response.json({ error: "No file uploaded." }, { status: 400 });
      }

      if (file.size > 10 * 1024 * 1024) {
        return Response.json({ error: "File size exceeds 10MB limit." }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const parsed = await parseClassListFile(buffer, file.name);

      if (!parsed.success && parsed.validRows.length === 0) {
        return Response.json(
          {
            error: "Could not extract student records from file.",
            details: parsed.invalidRows,
          },
          { status: 422 }
        );
      }

      const existingMatrics = new Set(
        course.enrolments.map((e) => e.student.matricNumber.toUpperCase())
      );

      const validRowsWithStatus = parsed.validRows.map((row) => ({
        ...row,
        isAlreadyEnrolled: existingMatrics.has(row.matricNumber.toUpperCase()),
      }));

      return Response.json({
        success: true,
        fileName: file.name,
        totalExtracted: parsed.totalExtracted,
        validRows: validRowsWithStatus,
        invalidRows: parsed.invalidRows,
        detectedColumns: parsed.detectedColumns,
      });
    } catch (err) {
      console.error("[Import Preview Error]:", err);
      return Response.json({ error: "Failed to process class list file." }, { status: 500 });
    }
  }

  // 8. POST /api/courses/:courseId/import/commit
  if (parts.length === 4 && parts[0] === "courses" && parts[2] === "import" && parts[3] === "commit") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = parts[1];
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.lecturerId !== user.id) {
      return Response.json({ error: "Course not found or access denied." }, { status: 404 });
    }

    try {
      const body = await request.json();
      const result = commitSchema.safeParse(body);
      if (!result.success) {
        return Response.json({ error: "Invalid student payload.", details: result.error.flatten() }, { status: 400 });
      }

      const { students, actionOnExisting } = result.data;
      if (students.length === 0) {
        return Response.json({ error: "No students provided for import." }, { status: 400 });
      }

      let addedCount = 0;
      let updatedCount = 0;

      for (const s of students) {
        const cleanMatric = s.matricNumber.trim().toUpperCase();
        const cleanName = s.fullName.trim();
        const cleanEmail = s.email ? s.email.trim().toLowerCase() : null;

        const student = await prisma.student.upsert({
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
          update:
            actionOnExisting === "update"
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

        addedCount++;
      }

      await prisma.auditLog.create({
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

      return Response.json({
        success: true,
        message: `Successfully processed ${students.length} students into roster.`,
        addedCount,
        updatedCount,
      });
    } catch (err: any) {
      console.error("[Commit Roster Error]:", err);
      const errorMessage =
        err?.message || "Failed to save student records to course roster. Please verify file format.";
      return Response.json({ error: errorMessage }, { status: 500 });
    }
  }

  // 9. POST /api/attendance/:token/request-otp
  if (parts.length === 3 && parts[0] === "attendance" && parts[2] === "request-otp") {
    const token = parts[1];
    try {
      const body = await request.json();
      const result = requestOtpSchema.safeParse(body);
      if (!result.success) {
        return Response.json({ error: "Matriculation number is required" }, { status: 400 });
      }

      const cleanMatric = result.data.matricNumber.trim().toUpperCase();
      const session = await prisma.attendanceSession.findUnique({
        where: { token },
        include: { course: { select: { id: true, code: true } } },
      });

      if (!session || session.status !== "OPEN" || session.expiresAt < new Date()) {
        return Response.json({ error: "Attendance session is not active." }, { status: 403 });
      }

      const student = await prisma.student.findUnique({
        where: { matricNumber: cleanMatric },
        include: {
          enrolments: {
            where: { courseId: session.courseId, status: "ACTIVE" },
          },
        },
      });

      if (!student || student.enrolments.length === 0) {
        return Response.json({ error: "Matriculation number is not enrolled in this course." }, { status: 404 });
      }

      if (!student.email) {
        return Response.json(
          {
            error:
              "No registered institutional email found for this student. Please contact your lecturer to mark attendance manually or verify via PIN.",
          },
          { status: 400 }
        );
      }

      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = crypto.createHash("sha256").update(rawOtp).digest("hex");
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.studentVerificationOTP.deleteMany({
        where: {
          sessionId: session.id,
          studentId: student.id,
          verifiedAt: null,
        },
      });

      await prisma.studentVerificationOTP.create({
        data: {
          sessionId: session.id,
          studentId: student.id,
          email: student.email,
          otpHash,
          expiresAt,
        },
      });

      await sendStudentOtpEmail(student.email, rawOtp, session.course.code);

      const [namePart, domainPart] = student.email.split("@");
      const maskedName =
        namePart.length <= 2
          ? namePart[0] + "*"
          : namePart[0] + "*".repeat(namePart.length - 2) + namePart[namePart.length - 1];
      const maskedEmail = `${maskedName}@${domainPart}`;

      return Response.json({
        success: true,
        message: `Verification code sent to ${maskedEmail}`,
        maskedEmail,
        devOtp: process.env.NODE_ENV !== "production" ? rawOtp : undefined,
      });
    } catch (err) {
      console.error("[Request OTP Error]:", err);
      return Response.json({ error: "Failed to dispatch verification code." }, { status: 500 });
    }
  }

  // 10. POST /api/attendance/:token/check-in
  if (parts.length === 3 && parts[0] === "attendance" && parts[2] === "check-in") {
    const token = parts[1];
    try {
      const body = await request.json();
      const result = checkInSchema.safeParse(body);
      if (!result.success) {
        return Response.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
      }

      const { matricNumber, sessionPin, studentPin, otpCode, deviceId } = result.data;
      const cleanMatric = matricNumber.trim().toUpperCase().replace(/\\/g, "/");

      const session = await prisma.attendanceSession.findUnique({
        where: { token },
        include: { course: { select: { id: true, code: true, title: true } } },
      });

      if (!session) {
        return Response.json({ error: "Attendance session does not exist or link is invalid." }, { status: 404 });
      }

      const now = new Date();
      if (session.status !== "OPEN" || session.expiresAt < now) {
        return Response.json(
          { error: "This attendance session has ended or is currently closed. Please contact your lecturer." },
          { status: 403 }
        );
      }

      if (session.sessionPin) {
        if (!sessionPin || sessionPin.trim() !== session.sessionPin.trim()) {
          return Response.json(
            { error: "Invalid in-class attendance PIN. Please check the code projected on the classroom board." },
            { status: 401 }
          );
        }
      }

      let student = await prisma.student.findUnique({
        where: { matricNumber: cleanMatric },
        include: {
          enrolments: {
            where: {
              courseId: session.courseId,
              status: "ACTIVE",
            },
          },
        },
      });

      if (!student || student.enrolments.length === 0) {
        student = await prisma.student.findFirst({
          where: { matricNumber: { equals: cleanMatric, mode: "insensitive" } },
          include: {
            enrolments: {
              where: {
                courseId: session.courseId,
                status: "ACTIVE",
              },
            },
          },
        });
      }

      if (!student || student.enrolments.length === 0) {
        return Response.json(
          { error: `Matriculation number "${cleanMatric}" is not enrolled in ${session.course.code}.` },
          { status: 404 }
        );
      }

      const enrolment = student.enrolments[0];
      const existingRecord = await prisma.attendanceRecord.findUnique({
        where: {
          sessionId_enrolmentId: {
            sessionId: session.id,
            enrolmentId: enrolment.id,
          },
        },
      });

      if (existingRecord) {
        return Response.json(
          {
            error: `Attendance already recorded for ${student.fullName} at ${formatDateTime(
              existingRecord.checkInTime
            )}. Duplicate check-ins are not permitted.`,
            alreadyRecorded: true,
            studentName: student.fullName,
            matricNumber: student.matricNumber,
            courseCode: session.course.code,
            checkInTime: existingRecord.checkInTime,
          },
          { status: 409 }
        );
      }

      if (session.verificationMethod === "STUDENT_PIN") {
        if (student.studentPin) {
          if (!studentPin || studentPin.trim() !== student.studentPin.trim()) {
            return Response.json(
              { error: "Incorrect student verification PIN. Please verify your credentials." },
              { status: 401 }
            );
          }
        }
      } else if (session.verificationMethod === "EMAIL_OTP") {
        if (!otpCode) {
          return Response.json({ error: "One-time email verification code is required." }, { status: 400 });
        }

        const otpHash = crypto.createHash("sha256").update(otpCode.trim()).digest("hex");
        const validOtp = await prisma.studentVerificationOTP.findFirst({
          where: {
            sessionId: session.id,
            studentId: student.id,
            otpHash,
            expiresAt: { gt: now },
            verifiedAt: null,
          },
        });

        if (!validOtp) {
          return Response.json({ error: "Invalid or expired one-time verification passcode." }, { status: 401 });
        }

        await prisma.studentVerificationOTP.update({
          where: { id: validOtp.id },
          data: { verifiedAt: now },
        });
      }

      // Anti-Proxy Check: Prevent buddy punching by blocking multiple check-ins from the exact same device
      if (deviceId && deviceId.trim().length > 0) {
        const deviceConflict = await prisma.attendanceRecord.findFirst({
          where: {
            sessionId: session.id,
            enrolmentId: { not: enrolment.id },
            userAgent: { contains: `[device:${deviceId.trim()}]` },
          },
          include: {
            enrolment: { include: { student: true } },
          },
        });

        if (deviceConflict) {
          return Response.json(
            {
              error: `Proxy Attendance Prevented: This device was already used to check in ${deviceConflict.enrolment.student.fullName} (${deviceConflict.enrolment.student.matricNumber}). Submitting attendance for absent students from the same phone is blocked.`,
            },
            { status: 403 }
          );
        }
      }

      const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
      const rawUserAgent = request.headers.get("user-agent") || "unknown";
      const userAgentWithDevice = deviceId && deviceId.trim().length > 0
        ? `${rawUserAgent} [device:${deviceId.trim()}]`
        : String(rawUserAgent);

      const record = await prisma.attendanceRecord.create({
        data: {
          sessionId: session.id,
          enrolmentId: enrolment.id,
          status: "PRESENT",
          verificationMethod: session.verificationMethod,
          verificationStatus: "VERIFIED",
          checkInTime: now,
          ipAddress: String(ipAddress),
          userAgent: userAgentWithDevice,
          isManualOverride: false,
        },
      });

      return Response.json({
        success: true,
        studentName: student.fullName,
        matricNumber: student.matricNumber,
        courseCode: session.course.code,
        courseTitle: session.course.title,
        checkInTime: record.checkInTime,
        message: "Attendance confirmed successfully. You have been marked PRESENT.",
      });
    } catch (err: any) {
      if (err.code === "P2002") {
        return Response.json(
          { error: "Attendance has already been recorded for this student in this session." },
          { status: 409 }
        );
      }
      console.error("[Check-In Error]:", err);
      return Response.json({ error: "Failed to confirm attendance. Please try again." }, { status: 500 });
    }
  }

  // 11. POST /api/settings
  if (parts.length === 1 && parts[0] === "settings") {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const body = await request.json();
      const result = settingsSchema.safeParse(body);
      if (!result.success) {
        return Response.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
      }

      const data = result.data;
      const updatePayload: any = {
        fullName: data.fullName.trim(),
        institution: data.institution?.trim() || null,
        department: data.department?.trim() || null,
        timeZone: data.timeZone,
        defaultThreshold: data.defaultThreshold,
        defaultSessionDuration: data.defaultSessionDuration,
        defaultVerificationMethod: data.defaultVerificationMethod,
      };

      if (data.newPassword && data.newPassword.trim().length > 0) {
        if (!data.currentPassword) {
          return Response.json({ error: "Current password is required to set a new password." }, { status: 400 });
        }

        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!dbUser) {
          return Response.json({ error: "User not found" }, { status: 404 });
        }

        const isCurrentMatch = await verifyPassword(data.currentPassword, dbUser.passwordHash);
        if (!isCurrentMatch) {
          return Response.json({ error: "Incorrect current password." }, { status: 400 });
        }

        updatePayload.passwordHash = await hashPassword(data.newPassword);
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updatePayload,
        select: {
          id: true,
          fullName: true,
          email: true,
          institution: true,
          department: true,
          timeZone: true,
          defaultThreshold: true,
          defaultSessionDuration: true,
          defaultVerificationMethod: true,
        },
      });

      return Response.json({
        success: true,
        message: "Settings updated successfully.",
        user: updatedUser,
      });
    } catch (err) {
      console.error("[Settings Update Error]:", err);
      return Response.json({ error: "Failed to update profile settings." }, { status: 500 });
    }
  }

  return Response.json({ error: "Not Found" }, { status: 404 });
}
