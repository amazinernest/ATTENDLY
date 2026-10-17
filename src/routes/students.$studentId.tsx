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
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#777770] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>
          <div className="mt-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#111111] text-[#d7f837] flex items-center justify-center font-bold shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">{student.fullName}</h1>
              <p className="text-xs text-[#777770] font-mono mt-0.5">
                Matriculation Number: <strong className="text-[#111111]">{student.matricNumber}</strong>
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
                className="bg-white border border-[#e7e5df] rounded-[28px] p-7 shadow-xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#edebe4] gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-black bg-[#d7f837] px-3 py-1 rounded-full shadow-xs">
                      {course.code}
                    </span>
                    <h3 className="text-lg font-bold text-[#111111] mt-2">{course.title}</h3>
                    <p className="text-xs text-[#777770] mt-0.5">
                      {course.session} • {course.semester} • Minimum Requirement:{" "}
                      {course.attendanceThreshold}%
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] text-[#888880] block font-bold uppercase tracking-wider">ATTENDANCE RATE</span>
                      <span
                        className={`text-2xl font-extrabold ${
                          isBelow ? "text-rose-600" : "text-[#111111]"
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
                  <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-3">
                    Class Attendance Register Log
                  </h4>
                  {records.length === 0 ? (
                    <p className="text-xs text-[#888880] italic py-3">
                      No attendance events recorded for this student in this course.
                    </p>
                  ) : (
                    <div className="overflow-x-auto border border-[#e7e5df] rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#faf9f5] text-[#555550] font-bold border-b border-[#edebe4]">
                          <tr>
                            <th className="px-4 py-3">Session Date</th>
                            <th className="px-4 py-3">Lecture Topic</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Check-in Timestamp</th>
                            <th className="px-4 py-3">Verification Method</th>
                            <th className="px-4 py-3">Audit Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#edebe4]">
                          {records.map((rec) => (
                            <tr key={rec.id} className="hover:bg-[#faf9f5] transition-colors">
                              <td className="px-4 py-2.5 font-medium text-[#111111]">
                                {formatDate(rec.session.sessionDate)}
                              </td>
                              <td className="px-4 py-2.5 text-[#555550]">
                                {rec.session.topic || "Lecture Class"}
                              </td>
                              <td className="px-4 py-2.5">
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
                              <td className="px-4 py-2.5 text-[#777770]">
                                {formatDateTime(rec.checkInTime)}
                              </td>
                              <td className="px-4 py-2.5 text-[#555550]">
                                {rec.verificationMethod} ({rec.verificationStatus})
                              </td>
                              <td className="px-4 py-2.5 text-[#777770]">
                                {rec.isManualOverride ? (
                                  <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
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
