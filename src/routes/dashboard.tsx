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
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Lecturer Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Welcome back, {user.fullName}. Academic session management workspace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/courses/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-800 hover:bg-sky-900 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Course</span>
            </Link>
          </div>
        </div>

        {/* Live Attendance Alert Banner (if any session currently open) */}
        {activeOpenSessions.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping mt-1"></span>
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Live Attendance Active
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  You currently have {activeOpenSessions.length} active session accepting student check-ins:{" "}
                  <strong>{activeOpenSessions.map((s) => s.course.code).join(", ")}</strong>.
                </p>
              </div>
            </div>
            <Link
              to={`/courses/${activeOpenSessions[0].courseId}/attendance/${activeOpenSessions[0].id}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-800 text-white rounded text-xs font-semibold hover:bg-amber-900 shrink-0"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>View Live Session</span>
            </Link>
          </div>
        )}

        {/* Real Database-backed Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Courses
              </span>
              <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{courses.length}</span>
              <p className="text-xs text-slate-500 mt-0.5">Assigned academic courses</p>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Unique Enrolled Students
              </span>
              <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalUniqueStudents}</span>
              <p className="text-xs text-slate-500 mt-0.5">Across all your courses</p>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sessions Conducted
              </span>
              <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalSessions}</span>
              <p className="text-xs text-slate-500 mt-0.5">Attendance logs recorded</p>
            </div>
          </div>
        </div>

        {/* Empty State vs Real Course Content */}
        {courses.length === 0 ? (
          <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-lg text-center max-w-xl mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-800 flex items-center justify-center mx-auto mb-4 border border-sky-100">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No Courses Yet</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              You have not created any courses in your ClassMark workspace. Once you create a course, you will be able to import student rosters, run QR check-in sessions, and generate semester attendance reports.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/courses/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-800 hover:bg-sky-900 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Your First Course</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Courses Overview Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Your Active Courses</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any course to manage roster, start attendance, or export records
                  </p>
                </div>
                <Link
                  to="/courses"
                  className="text-xs font-semibold text-sky-800 hover:text-sky-900 inline-flex items-center gap-1"
                >
                  View all ({courses.length})
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Course Code</th>
                      <th className="px-5 py-3">Course Title</th>
                      <th className="px-5 py-3">Session & Semester</th>
                      <th className="px-5 py-3 text-center">Enrolled</th>
                      <th className="px-5 py-3 text-center">Sessions</th>
                      <th className="px-5 py-3">Latest Class</th>
                      <th className="px-5 py-3 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {courses.map((course) => {
                      const latestSession = course.attendanceSessions[0];
                      return (
                        <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            <Link
                              to={`/courses/${course.id}`}
                              className="text-sky-800 hover:text-sky-900 hover:underline"
                            >
                              {course.code}
                            </Link>
                          </td>
                          <td className="px-5 py-3.5 text-slate-700 max-w-xs truncate font-medium">
                            {course.title}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">
                            <span>{course.session}</span> • <span>{course.semester}</span>
                          </td>
                          <td className="px-5 py-3.5 text-center font-semibold text-slate-700">
                            {course._count.enrolments}
                          </td>
                          <td className="px-5 py-3.5 text-center font-semibold text-slate-700">
                            {course._count.attendanceSessions}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">
                            {latestSession ? (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{formatDate(latestSession.sessionDate)}</span>
                                <span className="text-[10px] text-slate-400">
                                  ({latestSession.records.length} present)
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No classes yet</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-2">
                            <Link
                              to={`/courses/${course.id}/attendance/new`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200"
                            >
                              <QrCode className="w-3 h-3" />
                              <span>Take Attendance</span>
                            </Link>
                            <Link
                              to={`/courses/${course.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
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
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Attendance Activity</h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px]">
                          <QrCode className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {session.course.code}: {session.topic || "Lecture Attendance Session"}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {formatDate(session.sessionDate)} • {session._count.records} students marked present
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.status === "OPEN" ? "warning" : "slate"}>
                          {session.status}
                        </Badge>
                        <Link
                          to={`/courses/${session.courseId}/attendance/${session.id}`}
                          className="text-xs font-semibold text-sky-800 hover:underline"
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
