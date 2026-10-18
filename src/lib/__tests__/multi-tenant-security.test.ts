import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { calculateCourseAttendance } from "@/lib/reports";
import { createAttendanceSession, closeAttendanceSession } from "@/lib/attendance";

describe("Multi-Lecturer Tenant Isolation & Security", () => {
  let lecturerAId: string;
  let lecturerBId: string;
  let courseAId: string;
  let courseBId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword("Secur3P@ssword2026");

    // Create Lecturer A
    const userA = await prisma.user.create({
      data: {
        email: `lecturer_a_${Date.now()}@uni.edu.ng`,
        passwordHash,
        fullName: "Dr. Lecturer Alpha",
        isEmailVerified: true,
      },
    });
    lecturerAId = userA.id;

    // Create Lecturer B
    const userB = await prisma.user.create({
      data: {
        email: `lecturer_b_${Date.now()}@uni.edu.ng`,
        passwordHash,
        fullName: "Prof. Lecturer Beta",
        isEmailVerified: true,
      },
    });
    lecturerBId = userB.id;

    // Create Course for Lecturer A
    const courseA = await prisma.course.create({
      data: {
        lecturerId: lecturerAId,
        code: `CSC${Math.floor(100 + Math.random() * 800)}`,
        title: "Database Systems",
        session: "2026/2027",
        semester: "First Semester",
      },
    });
    courseAId = courseA.id;

    // Create Course for Lecturer B
    const courseB = await prisma.course.create({
      data: {
        lecturerId: lecturerBId,
        code: `MTH${Math.floor(100 + Math.random() * 800)}`,
        title: "Calculus II",
        session: "2026/2027",
        semester: "First Semester",
      },
    });
    courseBId = courseB.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.course.deleteMany({
      where: { id: { in: [courseAId, courseBId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [lecturerAId, lecturerBId] } },
    });
  });

  it("prevents Lecturer B from accessing Lecturer A's course report", async () => {
    // Lecturer A accessing Course A succeeds
    const reportA = await calculateCourseAttendance(courseAId, lecturerAId);
    expect(reportA.course.id).toBe(courseAId);

    // Lecturer B attempting to access Course A must fail with unauthorized error
    await expect(calculateCourseAttendance(courseAId, lecturerBId)).rejects.toThrow(
      "Course not found or unauthorized"
    );
  });

  it("prevents Lecturer A from closing Lecturer B's attendance session", async () => {
    const sessionB = await createAttendanceSession({
      courseId: courseBId,
      topic: "Calculus Lecture 1",
      durationMinutes: 30,
      verificationMethod: "STUDENT_PIN",
    });

    // Lecturer A attempting to close Lecturer B's session must fail
    await expect(closeAttendanceSession(sessionB.id, lecturerAId)).rejects.toThrow(
      "Session not found or unauthorized"
    );

    // Lecturer B closing their own session succeeds
    const closed = await closeAttendanceSession(sessionB.id, lecturerBId);
    expect(closed.status).toBe("CLOSED");
  });

  it("prevents Lecturer B from accessing Lecturer A's course or creating sessions via API endpoints", async () => {
    const { loader, action } = await import("../../routes/api.$");
    const { sessionStorage } = await import("../session.server");

    // Establish Lecturer B's session cookie
    const sessionB = await sessionStorage.getSession();
    sessionB.set("userId", lecturerBId);
    const cookieB = await sessionStorage.commitSession(sessionB);

    // 1. Lecturer B attempting to GET Lecturer A's course must return 404
    const getCourseReq = new Request(`http://localhost/api/courses/${courseAId}`, {
      headers: { Cookie: cookieB },
    });
    const getCourseRes = await loader({
      request: getCourseReq,
      params: { "*": `courses/${courseAId}` },
      context: {},
    } as any);
    expect(getCourseRes.status).toBe(404);

    // 2. Lecturer B attempting to create a session on Lecturer A's course must return 404
    const postSessionReq = new Request(`http://localhost/api/courses/${courseAId}/sessions`, {
      method: "POST",
      headers: {
        Cookie: cookieB,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        durationMinutes: 30,
        verificationMethod: "STUDENT_PIN",
      }),
    });
    const postSessionRes = await action({
      request: postSessionReq,
      params: { "*": `courses/${courseAId}/sessions` },
      context: {},
    } as any);
    expect(postSessionRes.status).toBe(404);

    // 3. Lecturer B attempting to GET Lecturer A's Excel export report must return 404
    const getReportReq = new Request(`http://localhost/api/courses/${courseAId}/reports/excel`, {
      headers: { Cookie: cookieB },
    });
    const getReportRes = await loader({
      request: getReportReq,
      params: { "*": `courses/${courseAId}/reports/excel` },
      context: {},
    } as any);
    expect(getReportRes.status).toBe(404);
  });
});
