import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { parseExcelBuffer, parseCsvBuffer, parseClassListFile } from "../index";

describe("Class List Importer Full QA Suite", () => {
  it("preserves leading zeros in matriculation numbers when parsing Excel", async () => {
    const wb = XLSX.utils.book_new();
    const data = [
      ["Matriculation Number", "Full Name", "Email", "Department"],
      ["001245", "Adekunle Ciroma", "adekunle@uni.edu.ng", "Computer Science"],
      ["000982", "Fatima Abubakar", "fatima@uni.edu.ng", "Computer Science"],
      ["CSC/2024/007", "Chukwudi Eze", "eze@uni.edu.ng", "Computer Science"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Roster");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const result = await parseExcelBuffer(buffer, "test_roster.xlsx");
    expect(result.success).toBe(true);
    expect(result.validRows.length).toBe(3);

    expect(result.validRows[0].matricNumber).toBe("001245");
    expect(result.validRows[1].matricNumber).toBe("000982");
    expect(result.validRows[2].matricNumber).toBe("CSC/2024/007");
    expect(result.validRows[0].fullName).toBe("Adekunle Ciroma");
  });

  it("handles large class list (50+ students in Excel) with international names and accents", async () => {
    const wb = XLSX.utils.book_new();
    const rows: string[][] = [
      ["Matriculation Number", "Full Name", "Email", "Department", "Level"],
    ];

    for (let i = 1; i <= 55; i++) {
      const paddedId = String(i).padStart(4, "0");
      const name =
        i === 1
          ? "Dr. Patrick O'Connor"
          : i === 2
          ? "René François Müller"
          : `Student ${paddedId}`;
      rows.push([
        `UNILAG/2026/${paddedId}`,
        name,
        `student${i}@unilag.edu.ng`,
        "Computer Science",
        "300",
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Class List");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const result = await parseExcelBuffer(buffer, "large_class_55.xlsx");
    expect(result.success).toBe(true);
    expect(result.validRows.length).toBe(55);
    expect(result.invalidRows.length).toBe(0);
    expect(result.validRows[0].fullName).toBe("Dr. Patrick O'Connor");
    expect(result.validRows[1].fullName).toBe("René François Müller");
    expect(result.validRows[54].matricNumber).toBe("UNILAG/2026/0055");
  });

  it("handles CSV parsing and identifies duplicate matriculation numbers", async () => {
    const csvContent = `Matric No,Student Name,Email\nU2024/101,John Doe,john@test.com\nU2024/101,Duplicate John,john2@test.com\nU2024/102,Jane Smith,jane@test.com`;
    const buffer = Buffer.from(csvContent, "utf-8");

    const result = await parseCsvBuffer(buffer, "students.csv");
    expect(result.validRows.length).toBe(2);
    expect(result.invalidRows.length).toBe(1);
    expect(result.invalidRows[0].reason).toContain("Duplicate matriculation number");
  });

  it("handles PDF parsing with selectable text tables", async () => {
    const doc = new jsPDF();
    doc.text("CSC 301 CLASS ROSTER", 20, 20);
    doc.text("Matric No, Full Name, Email", 20, 30);
    doc.text("CSC/2024/001, Chioma Adeleke, chioma@uni.edu.ng", 20, 40);
    doc.text("CSC/2024/002, Babatunde Alabi, babatunde@uni.edu.ng", 20, 50);

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const result = await parseClassListFile(pdfBuffer, "roster.pdf");

    expect(result.fileName).toBe("roster.pdf");
    expect(result.validRows.length).toBeGreaterThanOrEqual(2);
    expect(result.validRows[0].matricNumber).toBe("CSC/2024/001");
  });

  it("safely handles empty files and sheets", async () => {
    const emptyCsv = Buffer.from("", "utf-8");
    const result = await parseCsvBuffer(emptyCsv, "empty.csv");
    expect(result.success).toBe(false);
    expect(result.validRows.length).toBe(0);
    expect(result.invalidRows[0].reason).toContain("empty");
  });

  it("safely handles corrupted Excel and Word files without crashing", async () => {
    const corruptedBuffer = Buffer.from("Corrupted non-zip content posing as office document");

    // Corrupted Excel
    const excelResult = await parseExcelBuffer(corruptedBuffer, "corrupted.xlsx");
    expect(excelResult.success).toBe(false);
    expect(excelResult.invalidRows[0].reason).toContain("Failed to read Excel workbook");

    // Corrupted Word document
    const docxResult = await parseClassListFile(corruptedBuffer, "corrupted.docx");
    expect(docxResult.success).toBe(false);
    expect(docxResult.invalidRows[0].reason).toContain("Failed to extract records from Word document");

    // Corrupted PDF
    const pdfResult = await parseClassListFile(corruptedBuffer, "corrupted.pdf");
    expect(pdfResult.success).toBe(false);
    expect(pdfResult.invalidRows[0].reason).toContain("Failed to extract text from PDF");
  });

  it("rejects unsupported file formats gracefully", async () => {
    const buffer = Buffer.from("dummy data");
    const result = await parseClassListFile(buffer, "records.xyz");
    expect(result.success).toBe(false);
    expect(result.invalidRows[0].reason).toContain("Unsupported file format");
  });
});
