import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sessionStorage } from "@/lib/session.server";
import { action, loader } from "@/routes/api.$";

describe("Course API Route Handlers (/api/courses/:courseId)", () => {
  let lecturerA: any;
  let lecturerB: any;
  let cookieHeaderA: string;
  let cookieHeaderB: string;
  let courseA: any;
  let courseA2: any;

  beforeAll(async () => {
    const pwdHash = await hashPassword("StrongP@ss2026!");

    lecturerA = await prisma.user.create({
      data: {
        email: `api_lecturer_a_${Date.now()}@uni.edu.ng`,
        passwordHash: pwdHash,
        fullName: "Dr. API Test Alpha",
        isEmailVerified: true,
      },
    });

    lecturerB = await prisma.user.create({
      data: {
        email: `api_lecturer_b_${Date.now()}@uni.edu.ng`,
        passwordHash: pwdHash,
        fullName: "Dr. API Test Beta",
        isEmailVerified: true,
      },
    });

    const sessionA = await sessionStorage.getSession();
    sessionA.set("userId", lecturerA.id);
    cookieHeaderA = await sessionStorage.commitSession(sessionA);

    const sessionB = await sessionStorage.getSession();
    sessionB.set("userId", lecturerB.id);
    cookieHeaderB = await sessionStorage.commitSession(sessionB);

    // Create courses for lecturer A
    courseA = await prisma.course.create({
      data: {
        lecturerId: lecturerA.id,
        code: `API101_${Date.now().toString().slice(-4)}`,
        title: "Introduction to Computer Systems",
        session: "2026/2027",
        semester: "First Semester",
        attendanceThreshold: 75.0,
      },
    });

    courseA2 = await prisma.course.create({
      data: {
        lecturerId: lecturerA.id,
        code: `API102_${Date.now().toString().slice(-4)}`,
        title: "Computer Logic and Digital Design",
        session: "2026/2027",
        semester: "First Semester",
        attendanceThreshold: 75.0,
      },
    });
  });

  afterAll(async () => {
    await prisma.course.deleteMany({
      where: { lecturerId: { in: [lecturerA.id, lecturerB.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [lecturerA.id, lecturerB.id] } },
    });
  });

  it("GET /api/courses/:courseId retrieves course data for owner", async () => {
    const req = new Request(`http://localhost:3000/api/courses/${courseA.id}`, {
      headers: { Cookie: cookieHeaderA },
    });

    const res = await loader({
      request: req,
      params: { "*": `courses/${courseA.id}` },
    } as any);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.course).toBeDefined();
    expect(json.course.id).toBe(courseA.id);
    expect(json.course.title).toBe(courseA.title);
  });

  it("PUT /api/courses/:courseId updates course details", async () => {
    const updatedTitle = "Modern Computer Systems Architecture";
    const req = new Request(`http://localhost:3000/api/courses/${courseA.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeaderA,
      },
      body: JSON.stringify({
        title: updatedTitle,
        attendanceThreshold: 85,
        status: "ARCHIVED",
      }),
    });

    const res = await action({
      request: req,
      params: { "*": `courses/${courseA.id}` },
    } as any);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.course.title).toBe(updatedTitle);
    expect(json.course.attendanceThreshold).toBe(85);
    expect(json.course.status).toBe("ARCHIVED");
  });

  it("PUT /api/courses/:courseId rejects duplicate code within same session and semester", async () => {
    // Attempting to rename courseA code to courseA2's code
    const req = new Request(`http://localhost:3000/api/courses/${courseA.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeaderA,
      },
      body: JSON.stringify({
        code: courseA2.code,
        session: courseA2.session,
        semester: courseA2.semester,
      }),
    });

    const res = await action({
      request: req,
      params: { "*": `courses/${courseA.id}` },
    } as any);

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain("already exists");
  });

  it("prevents Lecturer B from editing or deleting Lecturer A's course", async () => {
    // Lecturer B attempting to update courseA
    const updateReq = new Request(`http://localhost:3000/api/courses/${courseA.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeaderB,
      },
      body: JSON.stringify({ title: "Hacked Title" }),
    });

    const updateRes = await action({
      request: updateReq,
      params: { "*": `courses/${courseA.id}` },
    } as any);
    expect(updateRes.status).toBe(404);

    // Lecturer B attempting to delete courseA
    const deleteReq = new Request(`http://localhost:3000/api/courses/${courseA.id}`, {
      method: "DELETE",
      headers: { Cookie: cookieHeaderB },
    });

    const deleteRes = await action({
      request: deleteReq,
      params: { "*": `courses/${courseA.id}` },
    } as any);
    expect(deleteRes.status).toBe(404);
  });

  it("DELETE /api/courses/:courseId deletes course permanently", async () => {
    const req = new Request(`http://localhost:3000/api/courses/${courseA.id}`, {
      method: "DELETE",
      headers: { Cookie: cookieHeaderA },
    });

    const res = await action({
      request: req,
      params: { "*": `courses/${courseA.id}` },
    } as any);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    // Verify it is gone from database
    const checkDb = await prisma.course.findUnique({
      where: { id: courseA.id },
    });
    expect(checkDb).toBeNull();
  });
});
