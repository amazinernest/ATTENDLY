import React from "react";
import { Link, useLoaderData } from "react-router";
import { ArrowLeft, User } from "lucide-react";
import { requireUser } from "@/lib/session.server";
import prisma from "@/lib/db";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatDateTime } from "@/lib/utils";

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { studentId?: string };
}) {
  const user = await requireUser(request);
  const studentId = params.studentId;

  if (!studentId) {
    throw new Response("Student ID Required", { status: 400 });
  }

  // Strict tenant boundary: only find student if they are enrolled in at least one of THIS lecturer's courses
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      enrolments: {
        some: {
          course: { lecturerId: user.id },
        },
      },
    },
    include: {
      enrolments: {
        where: {
          course: { lecturerId: user.id },
        },
        include: {
          course: {
            include: {
              attendanceSessions: {
                orderBy: { sessionDate: "desc" },
              },
            },
          },
          records: {
            include: {
              session: true,
            },
            orderBy: { checkInTime: "desc" },
          },
        },
      },
    },
  });

  if (!student) {
    throw new Response("Student Not Found", { status: 404 });
  }

  return { user, student };
}

export default function StudentDetailPage() {
  const { user, student } = useLoaderData<typeof loader>();

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 max-w-5xl">
        <div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-sky-800 text-white flex items-center justify-center font-bold shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{student.fullName}</h1>
              <p className="text-xs text-slate-500 font-mono">
                Matriculation Number: <strong className="text-slate-800">{student.matricNumber}</strong>
                {student.department && ` • ${student.department}`}
                {student.level && ` • ${student.level} Level`}
              </p>
            </div>
          </div>
        </div>

        {/* Enrolled Courses Summary */}
        <div className="space-y-6">
          {student.enrolments.map((enrolment) => {
            const course = enrolment.course;
            const records = enrolment.records;
            const validSessions = course.attendanceSessions;
            const totalSessions = validSessions.length;

            const attended = records.filter(
              (r) => r.status === "PRESENT" || r.status === "LATE"
            ).length;
            const excused = records.filter((r) => r.status === "EXCUSED").length;
            const eligible = totalSessions - excused;
            const percent =
              eligible > 0 ? Math.round((attended / eligible) * 1000) / 10 : null;
            const isBelow = percent !== null && percent < course.attendanceThreshold;

            return (
              <div
                key={enrolment.id}
                className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      {course.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{course.title}</h3>
                    <p className="text-xs text-slate-500">
                      {course.session} • {course.semester} • Minimum Requirement:{" "}
                      {course.attendanceThreshold}%
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-semibold">ATTENDANCE RATE</span>
                      <span
                        className={`text-xl font-bold ${
                          isBelow ? "text-rose-600" : "text-emerald-700"
                        }`}
                      >
                        {percent !== null ? `${percent}%` : "N/A"}
                      </span>
                    </div>
                    <Badge variant={isBelow ? "destructive" : "success"}>
                      {isBelow ? "DEFICIENT" : "QUALIFIED"}
                    </Badge>
                  </div>
                </div>

                {/* Session by session log */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Class Attendance Register Log
                  </h4>
                  {records.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No attendance events recorded for this student in this course.
                    </p>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2">Session Date</th>
                            <th className="px-4 py-2">Lecture Topic</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Check-in Timestamp</th>
                            <th className="px-4 py-2">Verification Method</th>
                            <th className="px-4 py-2">Audit Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {records.map((rec) => (
                            <tr key={rec.id} className="hover:bg-slate-50">
                              <td className="px-4 py-2 font-medium text-slate-900">
                                {formatDate(rec.session.sessionDate)}
                              </td>
                              <td className="px-4 py-2 text-slate-700">
                                {rec.session.topic || "Lecture Class"}
                              </td>
                              <td className="px-4 py-2">
                                <Badge
                                  variant={
                                    rec.status === "PRESENT"
                                      ? "success"
                                      : rec.status === "EXCUSED"
                                      ? "warning"
                                      : "slate"
                                  }
                                >
                                  {rec.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-2 text-slate-500">
                                {formatDateTime(rec.checkInTime)}
                              </td>
                              <td className="px-4 py-2 text-slate-600">
                                {rec.verificationMethod} ({rec.verificationStatus})
                              </td>
                              <td className="px-4 py-2 text-slate-500">
                                {rec.isManualOverride ? (
                                  <span className="text-[11px] text-amber-800">
                                    Manual: {rec.overrideReason || "Lecturer override"}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
