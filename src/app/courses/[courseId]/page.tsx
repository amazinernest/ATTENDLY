import React from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CourseWorkspaceView } from "./CourseWorkspaceView";
import { calculateCourseAttendance } from "@/lib/reports";


export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { courseId } = await params;
  const { tab = "overview" } = await searchParams;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      enrolments: {
        include: {
          student: true,
          records: true,
        },
        orderBy: { student: { matricNumber: "asc" } },
      },
      attendanceSessions: {
        orderBy: { sessionDate: "desc" },
        include: {
          _count: {
            select: {
              records: { where: { status: { in: ["PRESENT", "LATE"] } } },
            },
          },
        },
      },
    },
  });

  if (!course || course.lecturerId !== user.id) {
    notFound();
  }

  // Precalculate report metrics for the workspace
  const reportData = await calculateCourseAttendance(course.id, user.id);

  return (
    <DashboardLayout user={user}>
      <CourseWorkspaceView
        course={course}
        reportData={reportData}
        initialTab={tab}
        user={user}
      />
    </DashboardLayout>
  );
}
