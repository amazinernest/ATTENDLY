import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CourseReportData } from "./index";
import { formatDate } from "@/lib/utils";

export async function generateCoursePdfReport(data: CourseReportData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Academic Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Navy
  doc.text("CLASSMARK ACADEMIC ATTENDANCE REPORT", pageWidth / 2, 18, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("OFFICIAL UNIVERSITY COURSE ATTENDANCE REGISTER", pageWidth / 2, 24, { align: "center" });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 28, pageWidth - 14, 28);

  // Course Information Meta Block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Course: ${data.course.code} - ${data.course.title}`, 14, 35);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Academic Session: ${data.course.session} | Semester: ${data.course.semester}`, 14, 40);
  doc.text(`Department: ${data.course.department || "General"} | Faculty: ${data.course.faculty || "N/A"}`, 14, 45);
  doc.text(`Lecturer: ${data.course.lecturerName} (${data.course.lecturerInstitution || "Academic Staff"})`, 14, 50);
  doc.text(`Report Generation Date: ${formatDate(new Date())}`, 14, 55);

  // Summary Metrics Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(14, 59, pageWidth - 28, 18, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  const colWidth = (pageWidth - 28) / 4;
  doc.text("Total Enrolled:", 18, 66);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.totalStudents} students`, 18, 72);

  doc.setFont("helvetica", "bold");
  doc.text("Completed Lectures:", 18 + colWidth, 66);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.totalSessions} sessions`, 18 + colWidth, 72);

  doc.setFont("helvetica", "bold");
  doc.text("Overall Attendance:", 18 + colWidth * 2, 66);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.overallAttendanceRate}%`, 18 + colWidth * 2, 72);

  doc.setFont("helvetica", "bold");
  doc.text("Threshold Alert:", 18 + colWidth * 3, 66);
  doc.setTextColor(220, 38, 38); // red
  doc.text(`${data.studentsBelowThresholdCount} below ${data.course.attendanceThreshold}%`, 18 + colWidth * 3, 72);

  // Student Attendance Table
  const tableData = data.studentSummaries.map((s, idx) => [
    idx + 1,
    s.matricNumber,
    s.fullName,
    s.eligibleSessions,
    s.attendedSessions,
    s.absentSessions,
    s.attendancePercentage !== null ? `${s.attendancePercentage}%` : "N/A",
    s.isBelowThreshold ? "DEFICIENT" : "QUALIFIED",
  ]);

  autoTable(doc, {
    startY: 82,
    head: [
      [
        "S/N",
        "Matriculation No.",
        "Student Name",
        "Eligible",
        "Present",
        "Absent",
        "Rate (%)",
        "Eligibility",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [3, 105, 161], // ClassMark navy
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 32, fontStyle: "bold" },
      2: { cellWidth: "auto" },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 16, halign: "center" },
      5: { cellWidth: 16, halign: "center" },
      6: { cellWidth: 18, halign: "center", fontStyle: "bold" },
      7: { cellWidth: 24, halign: "center", fontStyle: "bold" },
    },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 7) {
        if (hookData.cell.raw === "DEFICIENT") {
          hookData.cell.styles.textColor = [220, 38, 38];
        } else {
          hookData.cell.styles.textColor = [5, 150, 105];
        }
      }
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (hookData) => {
      // Footer page numbering
      const pageNumber = hookData.pageNumber;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `ClassMark Academic Records • Page ${pageNumber} of ${doc.getNumberOfPages()}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    },
  });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
