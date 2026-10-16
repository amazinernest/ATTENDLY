import React from "react";
import { Link, useLoaderData } from "react-router";
import {
  BookOpen,
  PlusCircle,
  QrCode,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { requireUser } from "@/lib/session.server";
import prisma from "@/lib/db";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/Badge";

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") || "active";
  const isArchivedTab = tab === "archived";

  const courses = await prisma.course.findMany({
    where: {
      lecturerId: user.id,
      status: isArchivedTab ? "ARCHIVED" : "ACTIVE",
    },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          enrolments: { where: { status: "ACTIVE" } },
          attendanceSessions: true,
        },
      },
      attendanceSessions: {
        orderBy: { sessionDate: "desc" },
        take: 1,
        select: {
          sessionDate: true,
          status: true,
        },
      },
    },
  });

  return { user, courses, isArchivedTab };
}

export default function CoursesPage() {
  const { user, courses, isArchivedTab } = useLoaderData<typeof loader>();

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              My Courses
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage class rosters, start attendance sessions, and monitor lecture registers
            </p>
          </div>

          <Link
            to="/courses/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-800 hover:bg-sky-900 text-white text-xs font-semibold rounded-md shadow-xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Course</span>
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <Link
            to="/courses?tab=active"
            className={`pb-2.5 px-1 text-xs font-semibold border-b-2 transition-colors ${
              !isArchivedTab
                ? "border-sky-800 text-sky-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Active Courses
          </Link>
          <Link
            to="/courses?tab=archived"
            className={`pb-2.5 px-1 text-xs font-semibold border-b-2 transition-colors ${
              isArchivedTab
                ? "border-sky-800 text-sky-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Archived Courses
          </Link>
        </div>

        {/* Courses List */}
        {courses.length === 0 ? (
          <div className="p-10 bg-white border border-slate-200 rounded-lg text-center shadow-xs">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">
              No {isArchivedTab ? "archived" : "active"} courses found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {isArchivedTab
                ? "You do not have any archived courses. Past courses you archive will appear here."
                : "You have not created any active courses yet. Click below to set up your first course."}
            </p>
            {!isArchivedTab && (
              <div className="mt-4">
                <Link
                  to="/courses/new"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-800 text-white text-xs font-semibold rounded-md hover:bg-sky-900 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Course</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => {
              return (
                <div
                  key={course.id}
                  className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 font-mono">
                        {course.code}
                      </span>
                      <Badge variant={course.status === "ACTIVE" ? "success" : "slate"}>
                        {course.status}
                      </Badge>
                    </div>

                    <h3 className="mt-2.5 font-bold text-slate-900 text-sm leading-snug">
                      <Link to={`/courses/${course.id}`} className="hover:text-sky-800 hover:underline">
                        {course.title}
                      </Link>
                    </h3>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {course.session} • {course.semester}
                        </span>
                      </div>
                      {course.department && (
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.department}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Enrolled</span>
                        <span className="font-bold text-slate-800 text-sm">{course._count.enrolments}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Sessions</span>
                        <span className="font-bold text-slate-800 text-sm">{course._count.attendanceSessions}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/courses/${course.id}/attendance/new`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 rounded text-xs font-semibold"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Take Attendance</span>
                    </Link>

                    <Link
                      to={`/courses/${course.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
