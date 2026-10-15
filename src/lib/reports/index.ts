import prisma from "@/lib/db";

export interface StudentAttendanceSummary {
  enrolmentId: string;
  studentId: string;
  matricNumber: string;
  fullName: string;
  email: string | null;
  department: string | null;
  level: string | null;
  studentPin?: string | null;
  enrolmentStatus: string;
  eligibleSessions: number;
  attendedSessions: number;
  absentSessions: number;
  excusedSessions: number;
  lateSessions: number;
  attendancePercentage: number | null; // null if 0 eligible sessions
  classification: "EXCELLENT" | "GOOD" | "FAIR" | "LOW" | "NA";
  isBelowThreshold: boolean;
  sessionRecordMap: Record<string, "PRESENT" | "ABSENT" | "EXCUSED" | "LATE" | "NOT_ENROLLED">;
}

export interface CourseReportData {
  course: {
    id: string;
    code: string;
    title: string;
    session: string;
    semester: string;
    department: string | null;
    faculty: string | null;
    attendanceThreshold: number;
    lecturerName: string;
    lecturerInstitution: string | null;
  };
  totalSessions: number;
  totalStudents: number;
  overallAttendanceRate: number;
  studentsBelowThresholdCount: number;
  sessions: {
    id: string;
    sessionDate: Date;
    topic: string | null;
    status: string;
    presentCount: number;
  }[];
  studentSummaries: StudentAttendanceSummary[];
}

/**
 * Calculates complete academic attendance statistics for a course
 */
export async function calculateCourseAttendance(
  courseId: string,
  lecturerId: string
): Promise<CourseReportData> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lecturer: {
        select: { fullName: true, institution: true },
      },
      enrolments: {
        include: {
          student: true,
          records: true,
        },
        orderBy: { student: { matricNumber: "asc" } },
      },
      attendanceSessions: {
        where: {
          status: { in: ["OPEN", "CLOSED"] }, // exclude CANCELLED sessions
        },
        orderBy: { sessionDate: "asc" },
        include: {
          records: true,
        },
      },
    },
  });

  if (!course || course.lecturerId !== lecturerId) {
    throw new Error("Course not found or unauthorized.");
  }

  const validSessions = course.attendanceSessions;
  const totalSessions = validSessions.length;
  const threshold = course.attendanceThreshold;

  const sessionsInfo = validSessions.map((s) => ({
    id: s.id,
    sessionDate: s.sessionDate,
    topic: s.topic,
    status: s.status,
    presentCount: s.records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length,
  }));

  let totalStudentSessionsAttended = 0;
  let totalStudentSessionsOpportunities = 0;
  let belowThresholdCount = 0;

  const studentSummaries: StudentAttendanceSummary[] = course.enrolments.map((enrolment) => {
    const student = enrolment.student;
    const records = enrolment.records;

    const recordBySessionId = new Map(records.map((r) => [r.sessionId, r]));

    let attended = 0;
    let excused = 0;
    let late = 0;
    let absent = 0;

    const sessionRecordMap: Record<string, "PRESENT" | "ABSENT" | "EXCUSED" | "LATE" | "NOT_ENROLLED"> = {};

    validSessions.forEach((sess) => {
      // Check if student was enrolled before/during session
      const rec = recordBySessionId.get(sess.id);

      if (rec) {
        if (rec.status === "PRESENT") {
          attended++;
          sessionRecordMap[sess.id] = "PRESENT";
        } else if (rec.status === "LATE") {
          attended++;
          late++;
          sessionRecordMap[sess.id] = "LATE";
        } else if (rec.status === "EXCUSED") {
          excused++;
          sessionRecordMap[sess.id] = "EXCUSED";
        } else {
          absent++;
          sessionRecordMap[sess.id] = "ABSENT";
        }
      } else {
        // If session is closed and student has no record, they were absent
        if (sess.status === "CLOSED") {
          absent++;
          sessionRecordMap[sess.id] = "ABSENT";
        } else {
          sessionRecordMap[sess.id] = "ABSENT";
        }
      }
    });

    // Total eligible sessions (total sessions excluding excused if policy excludes them, or standard eligible)
    const eligibleSessions = totalSessions - excused;
    const percentage =
      eligibleSessions > 0
        ? Math.round(((attended) / eligibleSessions) * 1000) / 10
        : null;

    let classification: "EXCELLENT" | "GOOD" | "FAIR" | "LOW" | "NA" = "NA";
    let isBelowThreshold = false;

    if (percentage !== null) {
      if (percentage >= 90) classification = "EXCELLENT";
      else if (percentage >= 75) classification = "GOOD";
      else if (percentage >= 60) classification = "FAIR";
      else classification = "LOW";

      if (percentage < threshold) {
        isBelowThreshold = true;
        belowThresholdCount++;
      }

      totalStudentSessionsAttended += attended;
      totalStudentSessionsOpportunities += eligibleSessions;
    }

    return {
      enrolmentId: enrolment.id,
      studentId: student.id,
      matricNumber: student.matricNumber,
      fullName: student.fullName,
      email: student.email,
      department: student.department,
      level: student.level,
      studentPin: student.studentPin,
      enrolmentStatus: enrolment.status,
      eligibleSessions,
      attendedSessions: attended,
      absentSessions: absent,
      excusedSessions: excused,
      lateSessions: late,
      attendancePercentage: percentage,
      classification,
      isBelowThreshold,
      sessionRecordMap,
    };
  });

  const overallAttendanceRate =
    totalStudentSessionsOpportunities > 0
      ? Math.round((totalStudentSessionsAttended / totalStudentSessionsOpportunities) * 1000) / 10
      : 0;

  return {
    course: {
      id: course.id,
      code: course.code,
      title: course.title,
      session: course.session,
      semester: course.semester,
      department: course.department,
      faculty: course.faculty,
      attendanceThreshold: threshold,
      lecturerName: course.lecturer.fullName,
      lecturerInstitution: course.lecturer.institution,
    },
    totalSessions,
    totalStudents: course.enrolments.length,
    overallAttendanceRate,
    studentsBelowThresholdCount: belowThresholdCount,
    sessions: sessionsInfo,
    studentSummaries,
  };
}
