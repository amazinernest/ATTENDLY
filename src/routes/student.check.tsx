import React, { useState } from "react";
import { Link, useFetcher } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  GraduationCap,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  Clock,
  User,
  Info,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  Loader2,
} from "lucide-react";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface CourseAttendanceItem {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  academicSession: string;
  semester: string;
  lecturerName: string;
  lecturerDepartment: string | null;
  attendanceThreshold: number;
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  excusedSessions: number;
  lateSessions: number;
  attendancePercentage: number | null;
  isEligible: boolean;
  lecturesNeededToQualify: number;
  canMissBeforeDeficient: number;
}

interface StudentLookupResult {
  student: {
    id: string;
    matricNumber: string;
    fullName: string;
    email: string | null;
    department: string | null;
    level: string | null;
  };
  courses: CourseAttendanceItem[];
  overallRate: number;
  totalCourses: number;
  qualifiedCoursesCount: number;
  deficientCoursesCount: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const matricQuery = (url.searchParams.get("matric") || "").trim();

  if (!matricQuery) {
    return { result: null, query: "", error: null };
  }

  try {
    const student = await prisma.student.findFirst({
      where: {
        matricNumber: {
          equals: matricQuery,
          mode: "insensitive",
        },
      },
      include: {
        enrolments: {
          where: { status: "ACTIVE" },
          include: {
            course: {
              include: {
                lecturer: {
                  select: { fullName: true, department: true },
                },
                attendanceSessions: {
                  where: {
                    status: { in: ["OPEN", "CLOSED"] },
                  },
                  orderBy: { sessionDate: "asc" },
                },
              },
            },
            records: true,
          },
        },
      },
    });

    if (!student) {
      return {
        result: null,
        query: matricQuery,
        error: `No enrolled student records found matching matriculation number "${matricQuery}".`,
      };
    }

    let totalOpportunities = 0;
    let totalAttended = 0;
    let qualifiedCount = 0;
    let deficientCount = 0;

    const courses: CourseAttendanceItem[] = student.enrolments.map((enrolment) => {
      const course = enrolment.course;
      const validSessions = course.attendanceSessions;
      const totalSessions = validSessions.length;
      const threshold = course.attendanceThreshold;

      const recordMap = new Map(enrolment.records.map((r) => [r.sessionId, r]));

      let attended = 0;
      let late = 0;
      let excused = 0;
      let absent = 0;

      validSessions.forEach((sess) => {
        const rec = recordMap.get(sess.id);
        if (rec) {
          if (rec.status === "PRESENT") {
            attended++;
          } else if (rec.status === "LATE") {
            attended++;
            late++;
          } else if (rec.status === "EXCUSED") {
            excused++;
          } else {
            absent++;
          }
        } else {
          // If session is closed and student has no record, mark as absent
          absent++;
        }
      });

      const eligibleSessions = totalSessions - excused;
      const percentage =
        eligibleSessions > 0
          ? Math.round((attended / eligibleSessions) * 10000) / 100
          : null;

      const isEligible = percentage !== null ? percentage >= threshold : true;

      if (isEligible) {
        qualifiedCount++;
      } else {
        deficientCount++;
      }

      if (eligibleSessions > 0) {
        totalOpportunities += eligibleSessions;
        totalAttended += attended;
      }

      // Calculate how many more lectures are needed to reach threshold
      let lecturesNeededToQualify = 0;
      let canMissBeforeDeficient = 0;

      if (percentage !== null && threshold > 0) {
        const targetDecimal = threshold / 100;
        if (percentage < threshold) {
          // Need (attended + x) / (eligible + x) >= target
          // x * (1 - target) >= target * eligible - attended
          const requiredX = Math.ceil(
            (targetDecimal * eligibleSessions - attended) / (1 - targetDecimal)
          );
          lecturesNeededToQualify = Math.max(0, requiredX);
        } else {
          // Can miss m sessions: attended / (eligible + m) >= target
          // attended >= target * eligible + target * m
          // m <= (attended - target * eligible) / target
          const maxMiss = Math.floor(
            (attended - targetDecimal * eligibleSessions) / targetDecimal
          );
          canMissBeforeDeficient = Math.max(0, maxMiss);
        }
      }

      return {
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        academicSession: course.session,
        semester: course.semester,
        lecturerName: course.lecturer.fullName,
        lecturerDepartment: course.lecturer.department,
        attendanceThreshold: threshold,
        totalSessions,
        attendedSessions: attended,
        absentSessions: absent,
        excusedSessions: excused,
        lateSessions: late,
        attendancePercentage: percentage,
        isEligible,
        lecturesNeededToQualify,
        canMissBeforeDeficient,
      };
    });

    const overallRate =
      totalOpportunities > 0
        ? Math.round((totalAttended / totalOpportunities) * 10000) / 100
        : 100;

    return {
      result: {
        student: {
          id: student.id,
          matricNumber: student.matricNumber,
          fullName: student.fullName,
          email: student.email,
          department: student.department,
          level: student.level,
        },
        courses,
        overallRate,
        totalCourses: courses.length,
        qualifiedCoursesCount: qualifiedCount,
        deficientCoursesCount: deficientCount,
      },
      query: matricQuery,
      error: null,
    };
  } catch (err: any) {
    console.error("[Student Lookup Error]:", err);
    return {
      result: null,
      query: matricQuery,
      error: "An unexpected server error occurred while retrieving attendance records.",
    };
  }
}

export default function StudentCheckPage({ loaderData }: { loaderData: any }) {
  const { result, query: initialQuery, error } = loaderData || {};
  const [matricInput, setMatricInput] = useState(initialQuery || "");
  const fetcher = useFetcher();

  const isSearching = fetcher.state === "submitting" || fetcher.state === "loading";
  const data = fetcher.data ? fetcher.data.result : result;
  const currentError = fetcher.data ? fetcher.data.error : error;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#161616] font-sans antialiased selection:bg-[#d7f837] selection:text-black">
      {/* Header Container */}
      <header className="border-b border-black/[0.06] bg-[#edebe4]/60 backdrop-blur-md sticky top-0 z-40 print:hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none group">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4 text-[#d7f837]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#111111] tracking-tight text-base sm:text-lg">
                CLASSMARK
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d7f837]"></span>
              <span className="text-xs uppercase font-bold tracking-wider text-stone-500 hidden sm:inline">
                Student Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-stone-600 hover:text-black transition-colors px-3 py-1.5"
            >
              Lecturer Sign In
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-black/10 px-3.5 py-1.5 rounded-full shadow-2xs hover:bg-stone-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        {/* Search Card Section (Hidden on Print) */}
        <section className="bg-[#edebe4] rounded-[24px] sm:rounded-[32px] border border-black/[0.04] p-6 sm:p-10 shadow-xs print:hidden">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <Badge variant="outline" className="mb-1">
              Official University Attendance Register
            </Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#111111]">
              Student Attendance & Exam Clearance Status
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Verify your attendance percentages across all enrolled university courses and confirm your eligibility for semester examinations (75% minimum attendance rule).
            </p>

            <form
              method="get"
              action="/student/check"
              className="pt-4 flex flex-col sm:flex-row items-center gap-2.5 max-w-xl mx-auto"
            >
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  name="matric"
                  value={matricInput}
                  onChange={(e) => setMatricInput(e.target.value)}
                  placeholder="Enter Matriculation No. (e.g. 210408012 or CSC/2024/001)"
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-full bg-white border border-black/10 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0369a1] shadow-2xs transition-all uppercase"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isSearching || !matricInput.trim()}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-black hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider shrink-0 transition-transform active:scale-95 shadow-xs"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Searching...
                  </>
                ) : (
                  <>
                    <span>Check Status</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Accredited against National Universities Commission (NUC) Academic Guidelines</span>
            </div>
          </div>
        </section>

        {/* Error Notification */}
        {currentError && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3.5 animate-in fade-in duration-200 print:hidden">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <p className="font-bold">Record Not Found</p>
              <p className="text-rose-700 leading-relaxed">{currentError}</p>
              <p className="text-stone-500 text-[11px] pt-1">
                Tip: Confirm your matriculation number spelling with your course registration slip, or ask your course lecturer to verify that the imported class list contains your record.
              </p>
            </div>
          </div>
        )}

        {/* Printable Official Slip Header (Visible on print) */}
        {data && (
          <div className="hidden print:block text-center border-b pb-4 mb-6">
            <h1 className="text-xl font-bold uppercase tracking-tight">University Academic Attendance & Exam Clearance Slip</h1>
            <p className="text-xs text-stone-500 mt-1">Generated via ClassMark Academic Attendance Engine • Verified Official Record</p>
            <p className="text-[11px] text-stone-400">Date of Verification: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        )}

        {/* Results Container */}
        {data && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Student Profile & Summary Strip */}
            <div className="bg-white rounded-3xl border border-black/10 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-black/5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#0369a1] text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
                    {data.student.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-extrabold text-[#111111]">
                        {data.student.fullName}
                      </h2>
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        Enrolled Candidate
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold font-mono text-stone-600">
                      Matriculation No: {data.student.matricNumber}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {data.student.department || "Faculty of Science & Computing"} {data.student.level ? `• ${data.student.level} Level` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 print:hidden">
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="rounded-full px-4 py-2 text-xs font-semibold gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Clearance Slip</span>
                  </Button>
                </div>
              </div>

              {/* High-Level Semester Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                <div className="p-4 rounded-2xl bg-[#faf9f5] border border-black/5 space-y-1">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Courses Enrolled
                  </span>
                  <p className="text-2xl font-extrabold text-[#111111]">{data.totalCourses}</p>
                  <span className="text-[11px] text-stone-500">Active class rosters</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf9f5] border border-black/5 space-y-1">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Semester Attendance
                  </span>
                  <p className="text-2xl font-extrabold text-[#0369a1]">{data.overallRate}%</p>
                  <span className="text-[11px] text-stone-500">Weighted average</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Exam Qualified
                  </span>
                  <p className="text-2xl font-extrabold text-emerald-700">{data.qualifiedCoursesCount}</p>
                  <span className="text-[11px] text-emerald-600 font-medium">≥ 75% attendance attained</span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1">
                  <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                    At-Risk / Deficient
                  </span>
                  <p className="text-2xl font-extrabold text-rose-700">{data.deficientCoursesCount}</p>
                  <span className="text-[11px] text-rose-600 font-medium">Below exam threshold</span>
                </div>
              </div>
            </div>

            {/* Course-by-Course Attendance Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-base sm:text-lg font-bold text-[#111111] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#0369a1]" />
                  <span>Enrolled Course Attendance Breakdown</span>
                </h3>
                <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                  Minimum 75% Lecture Attendance Required
                </span>
              </div>

              {data.courses.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white border border-black/10 text-center text-stone-500 text-sm">
                  You are not currently enrolled in any published courses.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {data.courses.map((course: CourseAttendanceItem) => (
                    <div
                      key={course.courseId}
                      className="p-5 sm:p-6 rounded-3xl bg-white border border-black/10 shadow-2xs hover:border-black/20 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-black px-2.5 py-0.5 rounded-md bg-[#edebe4] text-[#111111]">
                              {course.courseCode}
                            </span>
                            <h4 className="font-extrabold text-base text-[#111111]">
                              {course.courseTitle}
                            </h4>
                          </div>
                          <p className="text-xs text-stone-500 flex items-center gap-2 flex-wrap pt-0.5">
                            <span>Lecturer: <strong>{course.lecturerName}</strong></span>
                            <span>•</span>
                            <span>Session: {course.academicSession} ({course.semester})</span>
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {course.attendancePercentage === null ? (
                            <Badge variant="outline">No Sessions Finalized Yet</Badge>
                          ) : course.isEligible ? (
                            <Badge variant="success" className="gap-1 px-3 py-1 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>CLEARED FOR EXAMS ({course.attendancePercentage}%)</span>
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1 px-3 py-1 text-xs">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>DEFICIENT / AT RISK ({course.attendancePercentage}%)</span>
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-stone-600">
                            Attendance Rate:{" "}
                            <strong className={course.isEligible ? "text-emerald-700" : "text-rose-700"}>
                              {course.attendancePercentage !== null ? `${course.attendancePercentage}%` : "N/A"}
                            </strong>
                          </span>
                          <span className="text-stone-400 text-[11px]">
                            Requirement: {course.attendanceThreshold}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden relative border border-black/5">
                          {/* 75% Threshold Marker Line */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-black/40 z-10"
                            style={{ left: `${course.attendanceThreshold}%` }}
                            title={`Clearance threshold: ${course.attendanceThreshold}%`}
                          />
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              course.isEligible ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(100, course.attendancePercentage || 0)}%` }}
                          />
                        </div>
                      </div>

                      {/* Statistics Summary Pills */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#faf9f5] border border-black/5 text-center">
                          <span className="text-stone-500 text-[11px] block">Completed Classes</span>
                          <span className="font-bold text-stone-900">{course.totalSessions}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
                          <span className="text-emerald-700 text-[11px] block">Attended</span>
                          <span className="font-bold text-emerald-800">
                            {course.attendedSessions} {course.lateSessions > 0 ? `(${course.lateSessions} late)` : ""}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-center">
                          <span className="text-rose-700 text-[11px] block">Absent</span>
                          <span className="font-bold text-rose-800">{course.absentSessions}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                          <span className="text-stone-500 text-[11px] block">Excused</span>
                          <span className="font-bold text-stone-800">{course.excusedSessions}</span>
                        </div>
                      </div>

                      {/* Actionable Academic Guidance Notice */}
                      {course.attendancePercentage !== null && (
                        <div className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 ${
                          course.isEligible ? "bg-emerald-50/60 text-emerald-900" : "bg-amber-50/80 text-amber-900"
                        }`}>
                          <Info className={`w-4 h-4 shrink-0 mt-0.5 ${
                            course.isEligible ? "text-emerald-600" : "text-amber-600"
                          }`} />
                          <div>
                            {course.isEligible ? (
                              <span>
                                <strong>Exam Clearance Standing:</strong> You have fulfilled the lecture attendance requirement. You may miss up to{" "}
                                <strong>{course.canMissBeforeDeficient}</strong> upcoming lecture(s) before dropping below the {course.attendanceThreshold}% clearance threshold.
                              </span>
                            ) : (
                              <span>
                                <strong>Action Required:</strong> You are currently below the required {course.attendanceThreshold}% attendance threshold. You must attend at least{" "}
                                <strong>{course.lecturesNeededToQualify}</strong> consecutive lecture(s) without absence to qualify for semester examinations.
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Official Institutional Certification Disclaimer (Print Footer) */}
            <div className="p-5 rounded-2xl bg-white border border-black/10 text-xs text-stone-500 space-y-2 mt-6">
              <div className="flex items-center gap-2 font-bold text-stone-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Institutional Attendance Policy Verification</span>
              </div>
              <p className="leading-relaxed">
                This record reflects verified digital attendance captures logged via ClassMark. For queries regarding manual corrections or excused medical absences, contact your course lecturer or departmental examination officer with supporting documentation.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
