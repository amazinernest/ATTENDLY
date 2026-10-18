import { describe, it, expect, beforeEach } from "vitest";
import prisma from "@/lib/db";
import { loader } from "@/routes/student.check";

describe("Student Attendance Status & Exam Clearance Lookup", () => {
  let lecturerId: string;
  let studentId: string;
  let courseId: string;
  const matricNumber = "TEST/2026/999";

  beforeEach(async () => {
    // Clean previous test data
    await prisma.attendanceRecord.deleteMany({
      where: { session: { course: { code: "STU-LOOKUP-101" } } },
    });
    await prisma.attendanceSession.deleteMany({
      where: { course: { code: "STU-LOOKUP-101" } },
    });
    await prisma.courseEnrolment.deleteMany({
      where: { student: { matricNumber } },
    });
    await prisma.student.deleteMany({
      where: { matricNumber },
    });
    await prisma.course.deleteMany({
      where: { code: "STU-LOOKUP-101" },
    });
    await prisma.user.deleteMany({
      where: { email: "lecturer.lookup@university.edu.ng" },
    });

    // 1. Create Lecturer
    const lecturer = await prisma.user.create({
      data: {
        email: "lecturer.lookup@university.edu.ng",
        passwordHash: "hash123",
        fullName: "Dr. Sunday Okafor",
        department: "Computer Science",
      },
    });
    lecturerId = lecturer.id;

    // 2. Create Course
    const course = await prisma.course.create({
      data: {
        lecturerId,
        code: "STU-LOOKUP-101",
        title: "Software Verification Principles",
        session: "2026/2027",
        semester: "First Semester",
        attendanceThreshold: 75.0,
      },
    });
    courseId = course.id;

    // 3. Create Student
    const student = await prisma.student.create({
      data: {
        matricNumber,
        fullName: "Tunde Bakare",
        email: "tunde.bakare@student.edu.ng",
        department: "Computer Science",
        level: "400",
      },
    });
    studentId = student.id;

    // 4. Enroll Student
    const enrolment = await prisma.courseEnrolment.create({
      data: {
        courseId,
        studentId,
        status: "ACTIVE",
      },
    });

    // 5. Create 4 Sessions: Student attends 3, misses 1 (75%)
    for (let i = 1; i <= 4; i++) {
      const sess = await prisma.attendanceSession.create({
        data: {
          courseId,
          topic: `Lecture ${i}`,
          token: `token-lookup-${i}-${Date.now()}`,
          status: "CLOSED",
          expiresAt: new Date(Date.now() + 3600000),
        },
      });

      if (i <= 3) {
        await prisma.attendanceRecord.create({
          data: {
            sessionId: sess.id,
            enrolmentId: enrolment.id,
            status: "PRESENT",
            verificationMethod: "STUDENT_PIN",
            verificationStatus: "VERIFIED",
          },
        });
      }
    }
  });

  it("successfully retrieves student profile and course attendance metrics", async () => {
    const request = new Request(`http://localhost:3000/student/check?matric=${matricNumber}`);
    const data = await loader({ request, params: {} } as any);

    expect(data.error).toBeNull();
    expect(data.result).not.toBeNull();
    expect(data.result?.student.matricNumber).toBe(matricNumber);
    expect(data.result?.student.fullName).toBe("Tunde Bakare");
    expect(data.result?.totalCourses).toBe(1);

    const courseItem = data.result?.courses[0];
    expect(courseItem?.courseCode).toBe("STU-LOOKUP-101");
    expect(courseItem?.totalSessions).toBe(4);
    expect(courseItem?.attendedSessions).toBe(3);
    expect(courseItem?.absentSessions).toBe(1);
    expect(courseItem?.attendancePercentage).toBe(75);
    expect(courseItem?.isEligible).toBe(true);
    expect(data.result?.qualifiedCoursesCount).toBe(1);
    expect(data.result?.deficientCoursesCount).toBe(0);
  });

  it("handles case-insensitive and trimmed matriculation number queries", async () => {
    const request = new Request(`http://localhost:3000/student/check?matric=  test/2026/999  `);
    const data = await loader({ request, params: {} } as any);

    expect(data.error).toBeNull();
    expect(data.result).not.toBeNull();
    expect(data.result?.student.matricNumber).toBe(matricNumber);
  });

  it("returns a clean, actionable error when matriculation number is not found", async () => {
    const request = new Request("http://localhost:3000/student/check?matric=NONEXISTENT/0000");
    const data = await loader({ request, params: {} } as any);

    expect(data.result).toBeNull();
    expect(data.error).toContain("No enrolled student records found matching matriculation number");
  });

  it("returns empty result when no query is provided", async () => {
    const request = new Request("http://localhost:3000/student/check");
    const data = await loader({ request, params: {} } as any);

    expect(data.result).toBeNull();
    expect(data.error).toBeNull();
  });
});
