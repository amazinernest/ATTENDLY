import React from "react";
import { Link, useLoaderData } from "react-router";
import {
  BookOpen,
  Users,
  CheckCircle,
  PlusCircle,
  QrCode,
  ArrowRight,
  Clock,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { requireUser } from "@/lib/session.server";
import prisma from "@/lib/db";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);

  // 1. Fetch all courses for this lecturer
  const courses = await prisma.course.findMany({
    where: { lecturerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      enrolments: {
        where: { status: "ACTIVE" },
        select: { studentId: true },
      },
      attendanceSessions: {
        orderBy: { sessionDate: "desc" },
        take: 1,
        include: {
          records: {
            where: { status: { in: ["PRESENT", "LATE"] } },
            select: { id: true },
          },
        },
      },
      _count: {
        select: {
          enrolments: { where: { status: "ACTIVE" } },
          attendanceSessions: true,
        },
      },
    },
  });

  // 2. Calculate unique students across all lecturer courses
  const uniqueStudentIds = new Set<string>();
  courses.forEach((c) => {
    c.enrolments.forEach((e) => uniqueStudentIds.add(e.studentId));
  });
  const totalUniqueStudents = uniqueStudentIds.size;

  // 3. Total sessions conducted across all courses
  const totalSessions = courses.reduce(
    (sum, c) => sum + c._count.attendanceSessions,
    0
  );

  // 4. Fetch recent attendance sessions across all lecturer's courses
  const recentSessions = await prisma.attendanceSession.findMany({
    where: {
      course: { lecturerId: user.id },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      course: {
        select: { code: true, title: true },
      },
      _count: {
        select: {
          records: {
            where: { status: { in: ["PRESENT", "LATE"] } },
          },
        },
      },
    },
  });

  // 5. Check if any active sessions currently in progress
  const activeOpenSessions = await prisma.attendanceSession.findMany({
    where: {
      course: { lecturerId: user.id },
      status: "OPEN",
    },
    include: {
      course: { select: { code: true, title: true } },
    },
  });

  return {
    user,
    courses,
    totalUniqueStudents,
    totalSessions,
    recentSessions,
    activeOpenSessions,
  };
}

export default function DashboardPage() {
  const {
    user,
    courses,
    totalUniqueStudents,
    totalSessions,
    recentSessions,
    activeOpenSessions,
  } = useLoaderData<typeof loader>();

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
              Lecturer Overview
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
              Welcome back, {user.fullName}. Academic attendance workspace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/courses/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-full shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 text-[#d7f837]" />
              <span>Create Course</span>
            </Link>
          </div>
        </div>

        {/* Live Attendance Alert Banner (if any session currently open) */}
        {activeOpenSessions.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#edebe4] border border-black/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d7f837] animate-ping mt-1 shrink-0"></span>
              <div>
                <p className="text-xs font-extrabold text-[#111111] uppercase tracking-wider">
                  Live Attendance Active
                </p>
                <p className="text-xs text-stone-600 mt-0.5 font-medium">
                  You currently have {activeOpenSessions.length} active session accepting student check-ins:{" "}
                  <strong className="text-black">{activeOpenSessions.map((s) => s.course.code).join(", ")}</strong>.
                </p>
              </div>
            </div>
            <Link
              to={`/courses/${activeOpenSessions[0].courseId}/attendance/${activeOpenSessions[0].id}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#111111] hover:bg-black text-white rounded-full text-xs font-bold shrink-0 transition-all shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-[#d7f837]" />
              <span>View Live Session</span>
            </Link>
          </div>
        )}

        {/* Real Database-backed Metrics matching landing page stat card aesthetics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-6 bg-white border border-black/[0.06] rounded-[24px] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                {courses.length}
              </div>
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Active Courses Assigned
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-black/[0.06] rounded-[24px] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                {totalUniqueStudents}
              </div>
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Unique Enrolled Students
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-black/[0.06] rounded-[24px] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold shrink-0 shadow-xs">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                {totalSessions}
              </div>
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Attendance Sessions Logged
              </div>
            </div>
          </div>
        </div>

        {/* Empty State vs Real Course Content */}
        {courses.length === 0 ? (
          <div className="p-8 sm:p-14 bg-white border border-black/[0.06] rounded-[28px] text-center max-w-xl mx-auto shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#edebe4] text-stone-800 flex items-center justify-center mx-auto mb-2 border border-black/5 shadow-2xs">
              <FolderOpen className="w-7 h-7 text-black" />
            </div>
            <h3 className="text-lg font-extrabold text-[#111111]">No Courses Yet</h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-medium">
              You have not created any courses in your ClassMark workspace. Once you create a course, you can import student rosters, launch dynamic QR sessions, and generate semester attendance reports.
            </p>
            <div className="pt-2">
              <Link
                to="/courses/new"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-full shadow-xs transition-all hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4 text-[#d7f837]" />
                <span>Create Your First Course</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Courses Overview Table */}
            <div className="bg-white border border-black/[0.06] rounded-[24px] overflow-hidden shadow-xs">
              <div className="px-6 py-5 border-b border-black/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#111111]">Your Active Courses</h3>
                  <p className="text-xs text-stone-500 mt-0.5 font-medium">
                    Select any course to manage rosters, start attendance, or export records
                  </p>
                </div>
                <Link
                  to="/courses"
                  className="text-xs font-bold text-black hover:underline inline-flex items-center gap-1"
                >
                  <span>View all ({courses.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#edebe4]/50 text-stone-600 font-bold uppercase tracking-wider text-[11px] border-b border-black/[0.06]">
                    <tr>
                      <th className="px-6 py-3.5">Course Code</th>
                      <th className="px-6 py-3.5">Course Title</th>
                      <th className="px-6 py-3.5">Session & Semester</th>
                      <th className="px-6 py-3.5 text-center">Enrolled</th>
                      <th className="px-6 py-3.5 text-center">Sessions</th>
                      <th className="px-6 py-3.5">Latest Class</th>
                      <th className="px-6 py-3.5 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {courses.map((course) => {
                      const latestSession = course.attendanceSessions[0];
                      return (
                        <tr key={course.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="px-6 py-4 font-extrabold text-[#111111]">
                            <Link
                              to={`/courses/${course.id}`}
                              className="text-black hover:underline flex items-center gap-1.5"
                            >
                              <span>{course.code}</span>
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-stone-700 max-w-xs truncate font-semibold">
                            {course.title}
                          </td>
                          <td className="px-6 py-4 text-stone-500 font-medium">
                            <span>{course.session}</span> • <span>{course.semester}</span>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-stone-800">
                            {course._count.enrolments}
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-stone-800">
                            {course._count.attendanceSessions}
                          </td>
                          <td className="px-6 py-4 text-stone-500 font-medium">
                            {latestSession ? (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-stone-400" />
                                <span>{formatDate(latestSession.sessionDate)}</span>
                                <span className="text-[11px] text-stone-400 font-mono">
                                  ({latestSession.records.length} present)
                                </span>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic">No classes yet</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <Link
                              to={`/courses/${course.id}/attendance/new`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-black bg-[#d7f837] hover:bg-[#cbf028] rounded-full transition-all shadow-2xs"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Take Attendance</span>
                            </Link>
                            <Link
                              to={`/courses/${course.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#111111] hover:bg-black rounded-full transition-all shadow-2xs"
                            >
                              <span>Manage</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Attendance Activity */}
            {recentSessions.length > 0 && (
              <div className="bg-white border border-black/[0.06] rounded-[24px] p-6 shadow-xs">
                <h3 className="text-sm font-extrabold text-[#111111] mb-4">Recent Attendance Activity</h3>
                <div className="divide-y divide-black/[0.04] text-xs">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="py-3 flex items-center justify-between hover:bg-[#faf9f5] px-3 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#edebe4] text-black flex items-center justify-center font-bold text-xs">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">
                            {session.course.code}: {session.topic || "Lecture Attendance Session"}
                          </p>
                          <p className="text-[11px] text-stone-500 font-medium">
                            {formatDate(session.sessionDate)} • {session._count.records} students marked present
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Badge variant={session.status === "OPEN" ? "accent" : "slate"}>
                          {session.status}
                        </Badge>
                        <Link
                          to={`/courses/${session.courseId}/attendance/${session.id}`}
                          className="text-xs font-bold text-black hover:underline"
                        >
                          View Session
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
