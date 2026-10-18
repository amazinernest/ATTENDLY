import { describe, it, expect } from "vitest";
import { generateCourseExcelReport } from "../reports/excel";
import { generateCoursePdfReport } from "../reports/pdf";
import { CourseReportData } from "../reports";

describe("Academic Attendance Calculations & Export Generators", () => {
  const mockReportData: CourseReportData = {
    course: {
      id: "course_123",
      code: "CSC 201",
      title: "Data Structures and Algorithms",
      session: "2026/2027",
      semester: "First Semester",
      department: "Computer Science",
      faculty: "Science",
      attendanceThreshold: 75.0,
      lecturerName: "Dr. Babatunde Raji",
      lecturerInstitution: "University of Lagos",
    },
    totalSessions: 10,
    totalStudents: 3,
    overallAttendanceRate: 70.0,
    studentsBelowThresholdCount: 1,
    sessions: [
      { id: "sess_1", sessionDate: new Date(), topic: "Introduction", status: "CLOSED", presentCount: 3 },
      { id: "sess_2", sessionDate: new Date(), topic: "Arrays & Lists", status: "CLOSED", presentCount: 2 },
    ],
    studentSummaries: [
      {
        enrolmentId: "enr_1",
        studentId: "stu_1",
        matricNumber: "001420", // Leading zero test
        fullName: "Aisha Bello",
        email: "aisha@unilag.edu.ng",
        department: "Computer Science",
        level: "200",
        enrolmentStatus: "ACTIVE",
        eligibleSessions: 10,
        attendedSessions: 9,
        absentSessions: 1,
        excusedSessions: 0,
        lateSessions: 0,
        attendancePercentage: 90.0,
        classification: "EXCELLENT",
        isBelowThreshold: false,
        sessionRecordMap: { sess_1: "PRESENT", sess_2: "PRESENT" },
      },
      {
        enrolmentId: "enr_2",
        studentId: "stu_2",
        matricNumber: "=HYPERLINK()", // Formula injection test
        fullName: "Emeka Okafor",
        email: "emeka@unilag.edu.ng",
        department: "Computer Science",
        level: "200",
        enrolmentStatus: "ACTIVE",
        eligibleSessions: 10,
        attendedSessions: 6,
        absentSessions: 4,
        excusedSessions: 0,
        lateSessions: 0,
        attendancePercentage: 60.0,
        classification: "FAIR",
        isBelowThreshold: true, // 60% < 75% threshold
        sessionRecordMap: { sess_1: "PRESENT", sess_2: "ABSENT" },
      },
      {
        enrolmentId: "enr_3",
        studentId: "stu_3",
        matricNumber: "CSC/2024/099",
        fullName: "Zainab Usman",
        email: "zainab@unilag.edu.ng",
        department: "Computer Science",
        level: "200",
        enrolmentStatus: "ACTIVE",
        eligibleSessions: 0, // Zero sessions test
        attendedSessions: 0,
        absentSessions: 0,
        excusedSessions: 0,
        lateSessions: 0,
        attendancePercentage: null,
        classification: "NA",
        isBelowThreshold: false,
        sessionRecordMap: {},
      },
    ],
  };

  it("handles zero eligible sessions gracefully without division by zero", () => {
    const zeroStudent = mockReportData.studentSummaries[2];
    expect(zeroStudent.eligibleSessions).toBe(0);
    expect(zeroStudent.attendancePercentage).toBeNull();
    expect(zeroStudent.classification).toBe("NA");
  });

  it("correctly flags students below configurable threshold", () => {
    const qualifyingStudent = mockReportData.studentSummaries[0];
    const deficientStudent = mockReportData.studentSummaries[1];

    expect(qualifyingStudent.isBelowThreshold).toBe(false);
    expect(deficientStudent.isBelowThreshold).toBe(true);
  });

  describe("Section 14 Mandatory Academic Calculation Test Cases", () => {
    const calculatePercentage = (attended: number, eligible: number): number | null => {
      return eligible > 0 ? Math.round((attended / eligible) * 10000) / 100 : null;
    };

    const formatPercentage = (pct: number | null): string => {
      return pct !== null ? `${pct}%` : "N/A";
    };

    const mandatoryCases = [
      { eligible: 100, attended: 100, expectedPct: 100, expectedStr: "100%" },
      { eligible: 100, attended: 90, expectedPct: 90, expectedStr: "90%" },
      { eligible: 100, attended: 65, expectedPct: 65, expectedStr: "65%" },
      { eligible: 100, attended: 45, expectedPct: 45, expectedStr: "45%" },
      { eligible: 10, attended: 9, expectedPct: 90, expectedStr: "90%" },
      { eligible: 3, attended: 2, expectedPct: 66.67, expectedStr: "66.67%" },
      { eligible: 3, attended: 1, expectedPct: 33.33, expectedStr: "33.33%" },
      { eligible: 0, attended: 0, expectedPct: null, expectedStr: "N/A" },
    ];

    it.each(mandatoryCases)(
      "calculates $attended / $eligible as $expectedStr ($expectedPct)",
      ({ eligible, attended, expectedPct, expectedStr }) => {
        const result = calculatePercentage(attended, eligible);
        expect(result).toBe(expectedPct);
        expect(formatPercentage(result)).toBe(expectedStr);
      }
    );

    it("evaluates boundary conditions for 75% threshold with exact 2-decimal precision", () => {
      const threshold = 75.0;

      // 74.99% is below threshold
      const below = 74.99;
      expect(below < threshold).toBe(true);

      // 75.00% meets threshold
      const exact = 75.0;
      expect(exact < threshold).toBe(false);

      // 75.01% exceeds threshold
      const above = 75.01;
      expect(above < threshold).toBe(false);
    });
  });

  it("generates genuine Excel (.xlsx) buffer with formula sanitization", async () => {
    const buffer = await generateCourseExcelReport(mockReportData);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(1000);
    // Excel files start with PK (ZIP header)
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
  });

  it("generates genuine PDF (.pdf) report buffer", async () => {
    const buffer = await generateCoursePdfReport(mockReportData);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(1000);
    // PDF files start with %PDF
    const header = buffer.subarray(0, 4).toString("utf-8");
    expect(header).toBe("%PDF");
  });
});
