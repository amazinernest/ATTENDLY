import ExcelJS from "exceljs";
import { CourseReportData } from "./index";
import { formatDate } from "@/lib/utils";

/**
 * Sanitizes untrusted text strings to prevent Excel formula injection (CSV/Spreadsheet Injection)
 */
function sanitizeForExcel(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  if (str.startsWith("=") || str.startsWith("+") || str.startsWith("-") || str.startsWith("@")) {
    return `'${str}`;
  }
  return str;
}

export async function generateCourseExcelReport(data: CourseReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ClassMark Academic Attendance System";
  workbook.created = new Date();

  // -------------------------------------------------------------
  // Sheet 1: Course Summary & Register
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet("Attendance Summary", {
    views: [{ state: "frozen", ySplit: 8 }],
  });

  // Title Block
  summarySheet.mergeCells("A1:G1");
  const titleCell = summarySheet.getCell("A1");
  titleCell.value = `${data.course.code}: ${data.course.title}`;
  titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FF0F172A" } };
  titleCell.alignment = { vertical: "middle" };

  summarySheet.mergeCells("A2:G2");
  const metaCell = summarySheet.getCell("A2");
  metaCell.value = `Academic Session: ${data.course.session} | ${data.course.semester} | Department: ${data.course.department || "N/A"}`;
  metaCell.font = { name: "Calibri", size: 11, italic: true, color: { argb: "FF475569" } };

  summarySheet.mergeCells("A3:G3");
  const lecturerCell = summarySheet.getCell("A3");
  lecturerCell.value = `Lecturer: ${data.course.lecturerName} (${data.course.lecturerInstitution || "Academic Staff"}) | Report Generated: ${formatDate(new Date())}`;
  lecturerCell.font = { name: "Calibri", size: 10, color: { argb: "FF64748B" } };

  // Overview metrics row
  summarySheet.getCell("A5").value = "Total Enrolled Students:";
  summarySheet.getCell("B5").value = data.totalStudents;
  summarySheet.getCell("A5").font = { bold: true };

  summarySheet.getCell("C5").value = "Completed Lectures:";
  summarySheet.getCell("D5").value = data.totalSessions;
  summarySheet.getCell("C5").font = { bold: true };

  summarySheet.getCell("E5").value = "Overall Attendance:";
  summarySheet.getCell("F5").value = `${data.overallAttendanceRate}%`;
  summarySheet.getCell("E5").font = { bold: true };

  summarySheet.getCell("A6").value = "Required Threshold:";
  summarySheet.getCell("B6").value = `${data.course.attendanceThreshold}%`;
  summarySheet.getCell("A6").font = { bold: true };

  summarySheet.getCell("C6").value = "Below Threshold Alert:";
  summarySheet.getCell("D6").value = data.studentsBelowThresholdCount;
  summarySheet.getCell("C6").font = { bold: true, color: { argb: "FFDC2626" } };

  // Table Headers
  const headerRow = summarySheet.getRow(8);
  headerRow.values = [
    "S/N",
    "Matriculation Number",
    "Student Full Name",
    "Eligible Classes",
    "Classes Attended",
    "Classes Absent",
    "Excused",
    "Attendance (%)",
    "Classification",
    "Exam Eligibility",
  ];

  headerRow.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0369A1" }, // ClassMark Academic Navy
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  summarySheet.getCell("C8").alignment = { vertical: "middle", horizontal: "left" };

  data.studentSummaries.forEach((s, idx) => {
    const row = summarySheet.addRow([
      idx + 1,
      sanitizeForExcel(s.matricNumber),
      sanitizeForExcel(s.fullName),
      s.eligibleSessions,
      s.attendedSessions,
      s.absentSessions,
      s.excusedSessions,
      s.attendancePercentage !== null ? `${s.attendancePercentage}%` : "N/A",
      s.classification,
      s.isBelowThreshold ? "DEFICIENT (Below Threshold)" : "QUALIFIED",
    ]);

    row.getCell(2).numFmt = "@"; // Force text formatting for matric number to preserve leading zeros!
    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(2).alignment = { horizontal: "left" };
    row.getCell(4).alignment = { horizontal: "center" };
    row.getCell(5).alignment = { horizontal: "center" };
    row.getCell(6).alignment = { horizontal: "center" };
    row.getCell(7).alignment = { horizontal: "center" };
    row.getCell(8).alignment = { horizontal: "center" };
    row.getCell(9).alignment = { horizontal: "center" };
    row.getCell(10).alignment = { horizontal: "center" };

    if (s.isBelowThreshold) {
      row.getCell(10).font = { bold: true, color: { argb: "FFDC2626" } };
    } else {
      row.getCell(10).font = { bold: true, color: { argb: "FF059669" } };
    }
  });

  // Set explicit column widths
  summarySheet.columns = [
    { width: 6 },  // S/N
    { width: 22 }, // Matric
    { width: 32 }, // Name
    { width: 15 }, // Eligible
    { width: 16 }, // Attended
    { width: 15 }, // Absent
    { width: 12 }, // Excused
    { width: 16 }, // Percentage
    { width: 16 }, // Classification
    { width: 28 }, // Eligibility
  ];

  // -------------------------------------------------------------
  // Sheet 2: Student-by-Session Matrix
  // -------------------------------------------------------------
  const matrixSheet = workbook.addWorksheet("Attendance Matrix", {
    views: [{ state: "frozen", ySplit: 2, xSplit: 3 }],
  });

  // Header Row 1: Session Dates
  const matrixHeaders = [
    "S/N",
    "Matriculation Number",
    "Student Name",
    ...data.sessions.map((sess, idx) => `Lecture ${idx + 1} (${formatDate(sess.sessionDate)})`),
  ];

  const mHeaderRow = matrixSheet.getRow(2);
  mHeaderRow.values = matrixHeaders;
  mHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  mHeaderRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" },
  };
  mHeaderRow.alignment = { horizontal: "center" };
  matrixSheet.getCell("C2").alignment = { horizontal: "left" };

  data.studentSummaries.forEach((s, idx) => {
    const sessionMarks = data.sessions.map((sess) => {
      const status = s.sessionRecordMap[sess.id];
      if (status === "PRESENT") return "P";
      if (status === "LATE") return "L";
      if (status === "EXCUSED") return "E";
      return "A";
    });

    const row = matrixSheet.addRow([
      idx + 1,
      sanitizeForExcel(s.matricNumber),
      sanitizeForExcel(s.fullName),
      ...sessionMarks,
    ]);

    row.getCell(2).numFmt = "@";
    row.getCell(1).alignment = { horizontal: "center" };
    // Color-code the session marks
    for (let c = 4; c <= matrixHeaders.length; c++) {
      const cell = row.getCell(c);
      cell.alignment = { horizontal: "center" };
      const val = cell.value;
      if (val === "P" || val === "L") {
        cell.font = { color: { argb: "FF059669" }, bold: true }; // Green
      } else if (val === "E") {
        cell.font = { color: { argb: "FFD97706" }, bold: true }; // Amber
      } else {
        cell.font = { color: { argb: "FFDC2626" } }; // Red
      }
    }
  });

  matrixSheet.columns = [
    { width: 6 },
    { width: 22 },
    { width: 30 },
    ...data.sessions.map(() => ({ width: 16 })),
  ];

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
