import React from "react";
import { useLoaderData } from "react-router";
import { requireUser } from "@/lib/session.server";
import prisma from "@/lib/db";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CourseWorkspaceView } from "@/components/courses/CourseWorkspaceView";
import { calculateCourseAttendance } from "@/lib/reports";

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { courseId?: string };
}) {
  const user = await requireUser(request);
  const courseId = params.courseId;

  if (!courseId) {
    throw new Response("Course ID Required", { status: 400 });
  }

  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") || "overview";

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
    throw new Response("Course Not Found", { status: 404 });
  }

  const reportData = await calculateCourseAttendance(course.id, user.id);

  return {
    user,
    course,
    reportData,
    initialTab: tab,
  };
}

export default function CourseDetailPage() {
  const { user, course, reportData, initialTab } = useLoaderData<typeof loader>();

  return (
    <DashboardLayout user={user}>
      <CourseWorkspaceView
        course={course}
        reportData={reportData}
        initialTab={initialTab}
        user={user}
      />
    </DashboardLayout>
  );
}
