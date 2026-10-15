import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const wb = XLSX.utils.book_new();

  // Create template sheet with headers and sample format instruction (no fake data)
  const headers = [
    ["Matriculation Number", "Full Name", "Institutional Email", "Department", "Level"],
    ["CSC/2024/001", "Surname Firstname", "student@university.edu.ng", "Computer Science", "200"],
  ];

  const ws = XLSX.utils.aoa_to_sheet(headers);
  // Set column widths
  ws["!cols"] = [
    { wch: 25 },
    { wch: 30 },
    { wch: 35 },
    { wch: 25 },
    { wch: 10 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Class List Template");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="ClassMark_Class_List_Template.xlsx"',
    },
  });
}
