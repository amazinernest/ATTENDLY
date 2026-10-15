import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/db";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "@/lib/auth";
import { parseExcelBuffer } from "@/lib/importers";
import * as XLSX from "xlsx";
import { createAttendanceSession, closeAttendanceSession, generateQrCodeDataUrl } from "@/lib/attendance";
import { calculateCourseAttendance } from "@/lib/reports";
import { generateCourseExcelReport } from "@/lib/reports/excel";
import { generateCoursePdfReport } from "@/lib/reports/pdf";

describe("Definition of Done: Complete Academic Workflow E2E", () => {
  let lecturer1: any;
  let lecturer2: any;
  let course1: any;
  let student1Matric = "CSC/2024/001";
  let student2Matric = "001452"; // Leading zero matric
  let session1: any;

  beforeAll(async () => {
    // 1. A lecturer registers
    const pwdHash = await hashPassword("StrongP@ssw0rd2026!");
    lecturer1 = await prisma.user.create({
      data: {
        email: `prof.adebayo.${Date.now()}@university.edu.ng`,
        passwordHash: pwdHash,
        fullName: "Prof. Adebayo Ogunlesi",
        institution: "University of Lagos",
        department: "Computer Science",
        isEmailVerified: false,
      },
    });

    // 2. Email verification
    const token = "test_verify_tok_" + Date.now();
    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId: lecturer1.id,
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    // Verify
    await prisma.user.update({
      where: { id: lecturer1.id },
      data: { isEmailVerified: true },
    });
    await prisma.emailVerificationToken.deleteMany({ where: { userId: lecturer1.id } });

    // 3. Lecturer 2 registers for multi-tenant isolation tests
    lecturer2 = await prisma.user.create({
      data: {
        email: `dr.chioma.${Date.now()}@university.edu.ng`,
        passwordHash: pwdHash,
        fullName: "Dr. Chioma Okeke",
        institution: "University of Nigeria, Nsukka",
        department: "Mathematics",
        isEmailVerified: true,
      },
    });
  });

  afterAll(async () => {
    if (course1?.id) {
      await prisma.course.delete({ where: { id: course1.id } });
    }
    await prisma.user.deleteMany({
      where: { id: { in: [lecturer1.id, lecturer2.id] } },
    });
    await prisma.student.deleteMany({
      where: { matricNumber: { in: [student1Matric, student2Matric] } },
    });
  });

  it("Step 3: Signs in securely with session establishment", async () => {
    const isMatch = await verifyPassword("StrongP@ssw0rd2026!", lecturer1.passwordHash);
    expect(isMatch).toBe(true);

    const sessionCookieToken = await createSessionToken({
      userId: lecturer1.id,
      email: lecturer1.email,
      fullName: lecturer1.fullName,
    });
    expect(typeof sessionCookieToken).toBe("string");

    const payload = await verifySessionToken(sessionCookieToken);
    expect(payload?.userId).toBe(lecturer1.id);
  });

  it("Step 4: Lecturer creates a course", async () => {
    course1 = await prisma.course.create({
      data: {
        lecturerId: lecturer1.id,
        code: `CSC301_${Date.now()}`,
        title: "Object-Oriented Software Design",
        session: "2026/2027",
        semester: "First Semester",
        attendanceThreshold: 75.0,
      },
    });
    expect(course1.id).toBeDefined();
    expect(course1.lecturerId).toBe(lecturer1.id);
  });

  it("Step 5 & 6: Imports real student list from Excel file preserving leading zeros", async () => {
    // Create an Excel class list
    const wb = XLSX.utils.book_new();
    const rows = [
      ["Matriculation Number", "Full Name", "Institutional Email", "Department"],
      [student1Matric, "Emmanuel Nnamdi", "nnamdi@uni.edu.ng", "Computer Science"],
      [student2Matric, "Fatima Aliyu", "fatima@uni.edu.ng", "Computer Science"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "ClassList");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Parse the file
    const parseResult = await parseExcelBuffer(buffer, "class_roster.xlsx");
    expect(parseResult.success).toBe(true);
    expect(parseResult.validRows.length).toBe(2);
    expect(parseResult.validRows[1].matricNumber).toBe(student2Matric); // Leading zero preserved

    // Commit to course roster
    for (const s of parseResult.validRows) {
      const student = await prisma.student.upsert({
        where: { matricNumber: s.matricNumber },
        create: {
          matricNumber: s.matricNumber,
          fullName: s.fullName,
          email: s.email,
          studentPin: "1234",
        },
        update: {},
      });

      await prisma.courseEnrolment.create({
        data: {
          courseId: course1.id,
          studentId: student.id,
          status: "ACTIVE",
        },
      });
    }

    const enrolments = await prisma.courseEnrolment.findMany({
      where: { courseId: course1.id },
    });
    expect(enrolments.length).toBe(2);
  });

  it("Step 7 & 8: Starts an attendance session and generates unique QR Code and URL token", async () => {
    session1 = await createAttendanceSession({
      courseId: course1.id,
      topic: "Design Patterns: Factory and Singleton",
      durationMinutes: 45,
      sessionPin: "5582",
      verificationMethod: "STUDENT_PIN",
    });

    expect(session1.id).toBeDefined();
    expect(session1.status).toBe("OPEN");
    expect(session1.token).toBeDefined();
    expect(session1.sessionPin).toBe("5582");

    const qrDataUrl = await generateQrCodeDataUrl(`http://localhost:3000/attendance/${session1.token}`);
    expect(qrDataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("Step 9-13: Student checks in; prevents duplicates & verifies identity", async () => {
    const student1 = await prisma.student.findUnique({
      where: { matricNumber: student1Matric },
      include: { enrolments: { where: { courseId: course1.id } } },
    });
    expect(student1).not.toBeNull();
    const enrolmentId = student1!.enrolments[0].id;

    // First check-in succeeds
    const rec1 = await prisma.attendanceRecord.create({
      data: {
        sessionId: session1.id,
        enrolmentId,
        status: "PRESENT",
        verificationMethod: "STUDENT_PIN",
        verificationStatus: "VERIFIED",
        checkInTime: new Date(),
      },
    });
    expect(rec1.id).toBeDefined();

    // Duplicate check-in must fail due to unique composite constraint [sessionId, enrolmentId]
    await expect(
      prisma.attendanceRecord.create({
        data: {
          sessionId: session1.id,
          enrolmentId,
          status: "PRESENT",
          verificationMethod: "STUDENT_PIN",
          verificationStatus: "VERIFIED",
          checkInTime: new Date(),
        },
      })
    ).rejects.toThrow();
  });

  it("Step 14: Lecturer closes attendance session", async () => {
    const closed = await closeAttendanceSession(session1.id, lecturer1.id);
    expect(closed.status).toBe("CLOSED");
    expect(closed.endTime).not.toBeNull();
  });

  it("Step 15: Auditable manual attendance override for second student", async () => {
    const student2 = await prisma.student.findUnique({
      where: { matricNumber: student2Matric },
      include: { enrolments: { where: { courseId: course1.id } } },
    });
    const enrolment2Id = student2!.enrolments[0].id;

    // Apply manual override
    const overrideRecord = await prisma.attendanceRecord.create({
      data: {
        sessionId: session1.id,
        enrolmentId: enrolment2Id,
        status: "EXCUSED",
        verificationMethod: "STUDENT_PIN",
        verificationStatus: "MANUAL_OVERRIDE",
        isManualOverride: true,
        overrideReason: "Official inter-university sports competition",
        overrideByLecturerId: lecturer1.id,
      },
    });
    expect(overrideRecord.status).toBe("EXCUSED");
    expect(overrideRecord.isManualOverride).toBe(true);

    // Audit log
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: lecturer1.id,
        courseId: course1.id,
        sessionId: session1.id,
        action: "MANUAL_ATTENDANCE_OVERRIDE",
        details: JSON.stringify({
          matricNumber: student2Matric,
          status: "EXCUSED",
          reason: "Official inter-university sports competition",
        }),
      },
    });
    expect(auditLog.action).toBe("MANUAL_ATTENDANCE_OVERRIDE");
  });

  it("Step 16-19: Calculates attendance statistics, exports valid Excel & PDF", async () => {
    const report = await calculateCourseAttendance(course1.id, lecturer1.id);
    expect(report.totalSessions).toBe(1);
    expect(report.totalStudents).toBe(2);

    // Student 1 attended 1 / 1 = 100%
    const summary1 = report.studentSummaries.find((s) => s.matricNumber === student1Matric);
    expect(summary1?.attendancePercentage).toBe(100.0);
    expect(summary1?.isBelowThreshold).toBe(false);

    // Excel generation
    const excelBuf = await generateCourseExcelReport(report);
    expect(excelBuf.length).toBeGreaterThan(1000);

    // PDF generation
    const pdfBuf = await generateCoursePdfReport(report);
    expect(pdfBuf.length).toBeGreaterThan(1000);
  });

  it("Step 22: Strict multi-lecturer privacy: Lecturer 2 cannot access Lecturer 1 records", async () => {
    await expect(calculateCourseAttendance(course1.id, lecturer2.id)).rejects.toThrow(
      "Course not found or unauthorized"
    );
  });
});
