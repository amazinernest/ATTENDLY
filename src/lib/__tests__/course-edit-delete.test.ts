import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { createAttendanceSession } from "@/lib/attendance";

describe("Course Editing and Deletion Functionality & Security", () => {
  let lecturerA: any;
  let lecturerB: any;
  let courseA: any;
  let courseB: any;
  let student: any;
  let enrolment: any;
  let sessionA: any;

  beforeAll(async () => {
    const passwordHash = await hashPassword("Secur3P@ss2026!");

    lecturerA = await prisma.user.create({
      data: {
        email: `lecturer_edit_a_${Date.now()}@uni.edu.ng`,
        passwordHash,
        fullName: "Dr. Alpha CourseEdit",
        isEmailVerified: true,
      },
    });

    lecturerB = await prisma.user.create({
      data: {
        email: `lecturer_edit_b_${Date.now()}@uni.edu.ng`,
        passwordHash,
        fullName: "Dr. Beta CourseEdit",
        isEmailVerified: true,
      },
    });

    // Create course for Lecturer A
    courseA = await prisma.course.create({
      data: {
        lecturerId: lecturerA.id,
        code: `CSC${Math.floor(100 + Math.random() * 800)}`,
        title: "Original Software Engineering",
        department: "Computer Science",
        session: "2026/2027",
        semester: "First Semester",
        attendanceThreshold: 75.0,
        status: "ACTIVE",
      },
    });

    // Create course for Lecturer B
    courseB = await prisma.course.create({
      data: {
        lecturerId: lecturerB.id,
        code: `PHY${Math.floor(100 + Math.random() * 800)}`,
        title: "Classical Mechanics",
        department: "Physics",
        session: "2026/2027",
        semester: "First Semester",
        attendanceThreshold: 70.0,
        status: "ACTIVE",
      },
    });

    // Create a student and enrolment for courseA
    student = await prisma.student.create({
      data: {
        matricNumber: `MATRIC_${Date.now()}`,
        fullName: "Student Test Edit",
        email: `student_${Date.now()}@uni.edu.ng`,
      },
    });

    enrolment = await prisma.courseEnrolment.create({
      data: {
        courseId: courseA.id,
        studentId: student.id,
        status: "ACTIVE",
      },
    });

    // Create an attendance session for courseA
    sessionA = await createAttendanceSession({
      courseId: courseA.id,
      topic: "Introduction & Overview",
      durationMinutes: 30,
      verificationMethod: "STUDENT_PIN",
    });
  });

  afterAll(async () => {
    // Cleanup any remaining data
    await prisma.course.deleteMany({
      where: { id: { in: [courseA.id, courseB.id] } },
    });
    if (student?.id) {
      await prisma.student.deleteMany({
        where: { id: student.id },
      });
    }
    await prisma.user.deleteMany({
      where: { id: { in: [lecturerA.id, lecturerB.id] } },
    });
  });

  it("allows lecturer to edit their own course details", async () => {
    const updated = await prisma.course.update({
      where: { id: courseA.id },
      data: {
        title: "Advanced Software Engineering & Architecture",
        attendanceThreshold: 80.0,
        status: "ARCHIVED",
        description: "Updated syllabus with modern cloud architectures",
      },
    });

    expect(updated.title).toBe("Advanced Software Engineering & Architecture");
    expect(updated.attendanceThreshold).toBe(80.0);
    expect(updated.status).toBe("ARCHIVED");
    expect(updated.description).toBe("Updated syllabus with modern cloud architectures");
  });

  it("enforces uniqueness constraint on course code, session, and semester per lecturer", async () => {
    // Attempting to create or update to an existing code in same session/semester for Lecturer A must fail
    await expect(
      prisma.course.create({
        data: {
          lecturerId: lecturerA.id,
          code: courseA.code,
          title: "Duplicate Course Attempt",
          session: courseA.session,
          semester: courseA.semester,
        },
      })
    ).rejects.toThrow();
  });

  it("deleting a course cascade-deletes enrolments, sessions, and records cleanly", async () => {
    // Verify session and enrolment exist before delete
    const preEnrolment = await prisma.courseEnrolment.findUnique({
      where: { id: enrolment.id },
    });
    expect(preEnrolment).not.toBeNull();

    const preSession = await prisma.attendanceSession.findUnique({
      where: { id: sessionA.id },
    });
    expect(preSession).not.toBeNull();

    // Delete Course A
    await prisma.course.delete({
      where: { id: courseA.id },
    });

    // Verify Course is gone
    const deletedCourse = await prisma.course.findUnique({
      where: { id: courseA.id },
    });
    expect(deletedCourse).toBeNull();

    // Verify enrolments are cascade deleted
    const postEnrolment = await prisma.courseEnrolment.findUnique({
      where: { id: enrolment.id },
    });
    expect(postEnrolment).toBeNull();

    // Verify sessions are cascade deleted
    const postSession = await prisma.attendanceSession.findUnique({
      where: { id: sessionA.id },
    });
    expect(postSession).toBeNull();

    // Student should still exist in university student registry
    const preservedStudent = await prisma.student.findUnique({
      where: { id: student.id },
    });
    expect(preservedStudent).not.toBeNull();
  });
});
