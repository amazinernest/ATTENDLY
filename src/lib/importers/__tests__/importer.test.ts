import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { parseExcelBuffer, parseCsvBuffer, parseClassListFile } from "../index";

describe("Class List Importer", () => {
  it("preserves leading zeros in matriculation numbers when parsing Excel", async () => {
    // Generate a test workbook with leading zeros
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

    // Verify leading zeros were strictly preserved
    expect(result.validRows[0].matricNumber).toBe("001245");
    expect(result.validRows[1].matricNumber).toBe("000982");
    expect(result.validRows[2].matricNumber).toBe("CSC/2024/007");
    expect(result.validRows[0].fullName).toBe("Adekunle Ciroma");
  });

  it("handles CSV parsing and identifies duplicate matriculation numbers", async () => {
    const csvContent = `Matric No,Student Name,Email\nU2024/101,John Doe,john@test.com\nU2024/101,Duplicate John,john2@test.com\nU2024/102,Jane Smith,jane@test.com`;
    const buffer = Buffer.from(csvContent, "utf-8");

    const result = await parseCsvBuffer(buffer, "students.csv");
    expect(result.validRows.length).toBe(2);
    expect(result.invalidRows.length).toBe(1);
    expect(result.invalidRows[0].reason).toContain("Duplicate matriculation number");
  });

  it("rejects unsupported file formats gracefully", async () => {
    const buffer = Buffer.from("dummy data");
    const result = await parseClassListFile(buffer, "records.xyz");
    expect(result.success).toBe(false);
    expect(result.invalidRows[0].reason).toContain("Unsupported file format");
  });
});
