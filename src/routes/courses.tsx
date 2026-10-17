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
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
              My Courses
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
              Manage class rosters, start dynamic QR attendance sessions, and monitor registers
            </p>
          </div>

          <Link
            to="/courses/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-full shadow-xs transition-all hover:scale-[1.02] self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-[#d7f837]" />
            <span>Create New Course</span>
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-3 border-b border-black/[0.06]">
          <Link
            to="/courses?tab=active"
            className={`pb-3 px-2 text-xs font-bold border-b-2 transition-all ${
              !isArchivedTab
                ? "border-black text-[#111111]"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            Active Courses
          </Link>
          <Link
            to="/courses?tab=archived"
            className={`pb-3 px-2 text-xs font-bold border-b-2 transition-all ${
              isArchivedTab
                ? "border-black text-[#111111]"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            Archived Courses
          </Link>
        </div>

        {/* Courses List */}
        {courses.length === 0 ? (
          <div className="p-10 sm:p-14 bg-white border border-black/[0.06] rounded-[28px] text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#edebe4] text-black mx-auto flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#111111]">
              No {isArchivedTab ? "archived" : "active"} courses found
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium leading-relaxed">
              {isArchivedTab
                ? "You do not have any archived courses. Past courses you archive will appear here."
                : "You have not created any active courses yet. Click below to set up your first course."}
            </p>
            {!isArchivedTab && (
              <div className="pt-2">
                <Link
                  to="/courses/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-full shadow-xs transition-all hover:scale-[1.02]"
                >
                  <PlusCircle className="w-4 h-4 text-[#d7f837]" />
                  <span>Create Course</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {courses.map((course) => {
              return (
                <div
                  key={course.id}
                  className="bg-white border border-black/[0.06] rounded-[24px] p-6 shadow-xs flex flex-col justify-between hover:border-black/20 transition-all hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-extrabold text-black bg-[#d7f837] px-2.5 py-1 rounded-full font-mono shadow-2xs">
                        {course.code}
                      </span>
                      <Badge variant={course.status === "ACTIVE" ? "success" : "slate"}>
                        {course.status}
                      </Badge>
                    </div>

                    <h3 className="mt-3 font-extrabold text-[#111111] text-base leading-snug">
                      <Link to={`/courses/${course.id}`} className="hover:underline">
                        {course.title}
                      </Link>
                    </h3>

                    <div className="mt-3 space-y-1.5 text-xs text-stone-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          {course.session} • {course.semester}
                        </span>
                      </div>
                      {course.department && (
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-stone-400" />
                          <span>{course.department}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/[0.04] grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-[#edebe4]/50 p-2.5 rounded-xl">
                        <span className="text-stone-400 block text-[10px] font-bold uppercase tracking-wider">Enrolled</span>
                        <span className="font-extrabold text-stone-900 text-sm">{course._count.enrolments}</span>
                      </div>
                      <div className="bg-[#edebe4]/50 p-2.5 rounded-xl">
                        <span className="text-stone-400 block text-[10px] font-bold uppercase tracking-wider">Sessions</span>
                        <span className="font-extrabold text-stone-900 text-sm">{course._count.attendanceSessions}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-black/[0.04] flex items-center justify-between gap-2">
                    <Link
                      to={`/courses/${course.id}/attendance/new`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#d7f837] hover:bg-[#cbf028] text-black rounded-full text-xs font-bold shadow-2xs transition-all hover:scale-[1.02]"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Take Attendance</span>
                    </Link>

                    <Link
                      to={`/courses/${course.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-[#111111] hover:bg-black rounded-full transition-all shadow-2xs hover:scale-[1.02]"
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
