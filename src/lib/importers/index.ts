import * as XLSX from "xlsx";
import mammoth from "mammoth";

export interface ParsedStudentRow {
  matricNumber: string;
  fullName: string;
  email?: string;
  department?: string;
  faculty?: string;
  level?: string;
  studentPin?: string;
}

export interface ParseResult {
  success: boolean;
  validRows: ParsedStudentRow[];
  invalidRows: { rowNumber: number; reason: string; rawData: Record<string, any> }[];
  detectedColumns: string[];
  totalExtracted: number;
  fileName: string;
}

/**
 * Normalizes header strings for flexible column matching:
 * e.g. "Matric. No", "Matriculation Number", "Reg No", "Reg_Number" -> "matricNumber"
 */
function normalizeHeaderKey(header: string): string {
  const clean = header.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (
    clean.includes("matric") ||
    clean.includes("regno") ||
    clean.includes("studentno") ||
    clean.includes("idno") ||
    clean === "id"
  ) {
    return "matricNumber";
  }
  if (clean.includes("name") || clean.includes("student")) {
    return "fullName";
  }
  if (clean.includes("email") || clean.includes("mail")) {
    return "email";
  }
  if (clean.includes("dept") || clean.includes("department")) {
    return "department";
  }
  if (clean.includes("fac") || clean.includes("faculty")) {
    return "faculty";
  }
  if (clean.includes("level") || clean.includes("year")) {
    return "level";
  }
  if (clean.includes("pin") || clean.includes("code")) {
    return "studentPin";
  }
  return clean;
}

/**
 * Generates a random 4-digit student PIN if none is supplied
 */
export function generateStudentPin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Parses Excel (.xlsx, .xls) buffer ensuring text cells preserve leading zeros
 */
export async function parseExcelBuffer(buffer: Buffer, fileName: string): Promise<ParseResult> {
  try {
    const ext = fileName.toLowerCase().split(".").pop();
    // Validate ZIP magic header (PK) for .xlsx files to detect misleading extensions or corrupted workbooks
    if (ext === "xlsx" && (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b)) {
      return {
        success: false,
        validRows: [],
        invalidRows: [
          {
            rowNumber: 1,
            reason: "Failed to read Excel workbook: The file is not a valid .xlsx spreadsheet (corrupted or misleading extension).",
            rawData: {},
          },
        ],
        detectedColumns: [],
        totalExtracted: 0,
        fileName,
      };
    }

    const workbook = XLSX.read(buffer, { type: "buffer", raw: false, cellText: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        validRows: [],
        invalidRows: [{ rowNumber: 1, reason: "Workbook contains no worksheets", rawData: {} }],
        detectedColumns: [],
        totalExtracted: 0,
        fileName,
      };
    }

    const sheet = workbook.Sheets[sheetName];
    // Parse rows as raw string matrix
    const matrix: string[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: false,
    });

    return processMatrixData(matrix, fileName);
  } catch (err: any) {
    return {
      success: false,
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          reason: `Failed to read Excel workbook: ${err.message || "Corrupted or invalid spreadsheet file"}`,
          rawData: {},
        },
      ],
      detectedColumns: [],
      totalExtracted: 0,
      fileName,
    };
  }
}

/**
 * Parses CSV buffer with delimiter auto-detection
 */
export async function parseCsvBuffer(buffer: Buffer, fileName: string): Promise<ParseResult> {
  try {
    const content = buffer.toString("utf-8");
    if (!content.trim()) {
      return {
        success: false,
        validRows: [],
        invalidRows: [{ rowNumber: 1, reason: "The uploaded CSV file is empty", rawData: {} }],
        detectedColumns: [],
        totalExtracted: 0,
        fileName,
      };
    }

    const workbook = XLSX.read(content, { type: "string", raw: false });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        validRows: [],
        invalidRows: [{ rowNumber: 1, reason: "CSV contains no readable records", rawData: {} }],
        detectedColumns: [],
        totalExtracted: 0,
        fileName,
      };
    }

    const sheet = workbook.Sheets[sheetName];
    const matrix: string[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: false,
    });
    return processMatrixData(matrix, fileName);
  } catch (err: any) {
    return {
      success: false,
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          reason: `Failed to parse CSV file: ${err.message || "Corrupted or invalid CSV structure"}`,
          rawData: {},
        },
      ],
      detectedColumns: [],
      totalExtracted: 0,
      fileName,
    };
  }
}

/**
 * Parses Word (.docx) document extracting HTML tables
 */
export async function parseDocxBuffer(buffer: Buffer, fileName: string): Promise<ParseResult> {
  try {
    const { value: html } = await mammoth.convertToHtml({ buffer });

    // Extract table rows from generated HTML
    const rowMatches = html.match(/<tr[\s\S]*?<\/tr>/gi);
    if (!rowMatches || rowMatches.length === 0) {
      // If no HTML table is found, fall back to line by line text parsing
      const { value: rawText } = await mammoth.extractRawText({ buffer });
      return parseTextLines(rawText, fileName);
    }

    const matrix: string[][] = [];
    for (const rowHtml of rowMatches) {
      const cellMatches = rowHtml.match(/<t[dh][\s\S]*?<\/t[dh]>/gi);
      if (cellMatches) {
        const rowCells = cellMatches.map((cell) =>
          cell.replace(/<[^>]+>/g, "").trim()
        );
        if (rowCells.some((c) => c.length > 0)) {
          matrix.push(rowCells);
        }
      }
    }

    return processMatrixData(matrix, fileName);
  } catch (err: any) {
    return {
      success: false,
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          reason: `Failed to extract records from Word document: ${err.message || "Corrupted or invalid .docx file"}`,
          rawData: {},
        },
      ],
      detectedColumns: [],
      totalExtracted: 0,
      fileName,
    };
  }
}

/**
 * Parses PDF text stream line by line
 */
export async function parsePdfBuffer(buffer: Buffer, fileName: string): Promise<ParseResult> {
  try {
    // Dynamic import for pdf-parse supporting both v2 (PDFParse class) and v1 (function)
    const pdfModule: any = await import("pdf-parse");
    let extractedText = "";

    if (pdfModule?.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const res = await parser.getText();
      extractedText = typeof res === "string" ? res : (res?.text || "");
      if (typeof parser.destroy === "function") {
        await parser.destroy();
      }
    } else if (typeof pdfModule === "function") {
      const data = await pdfModule(buffer);
      extractedText = data?.text || "";
    } else if (typeof pdfModule?.default === "function") {
      const data = await pdfModule.default(buffer);
      extractedText = data?.text || "";
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return {
        success: false,
        validRows: [],
        invalidRows: [
          {
            rowNumber: 1,
            reason: "This PDF contains scanned image pages without selectable text. Please provide an OCR-converted document or Excel roster.",
            rawData: {},
          },
        ],
        detectedColumns: [],
        totalExtracted: 0,
        fileName,
      };
    }

    return parseTextLines(extractedText, fileName);
  } catch (err: any) {
    return {
      success: false,
      validRows: [],
      invalidRows: [
        {
          rowNumber: 1,
          reason: `Failed to extract text from PDF: ${err.message}`,
          rawData: {},
        },
      ],
      detectedColumns: [],
      totalExtracted: 0,
      fileName,
    };
  }
}

/**
 * Parse plain text lines (fallback for PDFs and unstructured text)
 */
function parseTextLines(text: string, fileName: string): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const validRows: ParsedStudentRow[] = [];
  const invalidRows: { rowNumber: number; reason: string; rawData: Record<string, any> }[] = [];
  const seenMatrics = new Set<string>();

  // Pattern for typical university matric numbers: e.g. "U2024/5521", "CSC/2021/045", "20/47CS/001", "20210045"
  const matricRegex = /([A-Za-z0-9]{2,}\/[A-Za-z0-9\/_-]+|[A-Za-z]{2,}\d{4,}|\d{6,})/i;

  lines.forEach((line, idx) => {
    // Ignore lines that look like document headers/footers
    if (
      line.toLowerCase().includes("page ") ||
      line.toLowerCase().includes("university") ||
      line.toLowerCase().includes("department") && line.length < 50 && !line.includes(",")
    ) {
      return;
    }

    // Try splitting by comma, tab, or double space
    const parts = line.split(/[,\t]+|\s{2,}/).map((p) => p.trim()).filter(Boolean);

    let matricNumber = "";
    let fullName = "";
    let email = "";

    // Search for matric pattern
    const match = line.match(matricRegex);
    if (match) {
      matricNumber = match[0].trim().toUpperCase();
      // Remaining part might be the name
      fullName = line.replace(match[0], "").replace(/^[,\s\-\.]+|[,\s\-\.]+$/g, "").trim();
    } else if (parts.length >= 2) {
      // First column matric or second column matric
      if (parts[0].length >= 4 && /\d/.test(parts[0])) {
        matricNumber = parts[0];
        fullName = parts[1];
      } else if (parts[1].length >= 4 && /\d/.test(parts[1])) {
        matricNumber = parts[1];
        fullName = parts[0];
      }
    }

    // Check for email in line
    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      email = emailMatch[0].toLowerCase();
      fullName = fullName.replace(emailMatch[0], "").trim();
    }

    if (!matricNumber || matricNumber.length < 3) {
      // Not a valid student row, skip or record if it looked like one
      if (line.length > 5 && (line.includes("/") || /\d{4}/.test(line))) {
        invalidRows.push({
          rowNumber: idx + 1,
          reason: "Could not identify a valid matriculation number in this row.",
          rawData: { line },
        });
      }
      return;
    }

    matricNumber = matricNumber.toUpperCase();

    if (seenMatrics.has(matricNumber)) {
      invalidRows.push({
        rowNumber: idx + 1,
        reason: `Duplicate matriculation number "${matricNumber}" found in file.`,
        rawData: { line, matricNumber, fullName },
      });
      return;
    }

    seenMatrics.add(matricNumber);
    validRows.push({
      matricNumber,
      fullName: fullName || "Student " + matricNumber,
      email: email || undefined,
      studentPin: generateStudentPin(),
    });
  });

  return {
    success: validRows.length > 0,
    validRows,
    invalidRows,
    detectedColumns: ["matricNumber", "fullName", "email"],
    totalExtracted: validRows.length,
    fileName,
  };
}

/**
 * Processes tabular data matrix from Excel, CSV, or HTML tables
 */
function processMatrixData(matrix: string[][], fileName: string): ParseResult {
  if (matrix.length === 0) {
    return {
      success: false,
      validRows: [],
      invalidRows: [{ rowNumber: 1, reason: "The uploaded file is empty", rawData: {} }],
      detectedColumns: [],
      totalExtracted: 0,
      fileName,
    };
  }

  // Find header row (the first row containing keywords like matric, name, reg, id, student)
  let headerIndex = -1;
  for (let r = 0; r < Math.min(matrix.length, 10); r++) {
    const row = matrix[r];
    const rowText = row.join(" ").toLowerCase();
    if (
      (rowText.includes("matric") || rowText.includes("reg") || rowText.includes("student no") || rowText.includes("id")) &&
      (rowText.includes("name") || rowText.includes("student"))
    ) {
      headerIndex = r;
      break;
    }
  }

  // If no obvious header found, default to row 0
  if (headerIndex === -1) {
    headerIndex = 0;
  }

  const rawHeaders = matrix[headerIndex].map((h) => String(h || "").trim());
  const columnMap: Record<string, number> = {};

  rawHeaders.forEach((header, colIdx) => {
    const key = normalizeHeaderKey(header);
    if (key && !(key in columnMap)) {
      columnMap[key] = colIdx;
    }
  });

  // Fallback positional detection if headers were ambiguous
  if (columnMap["matricNumber"] === undefined) {
    // Check first 3 columns for digits or slashes
    for (let c = 0; c < Math.min(rawHeaders.length, 4); c++) {
      const sample = matrix.slice(headerIndex + 1, headerIndex + 5).map((row) => row[c] || "");
      if (sample.some((val) => /\d/.test(val) && (val.includes("/") || val.length >= 5))) {
        columnMap["matricNumber"] = c;
        break;
      }
    }
  }

  if (columnMap["fullName"] === undefined) {
    // Look for column with alphabetic words
    for (let c = 0; c < Math.min(rawHeaders.length, 4); c++) {
      if (c !== columnMap["matricNumber"]) {
        columnMap["fullName"] = c;
        break;
      }
    }
  }

  const validRows: ParsedStudentRow[] = [];
  const invalidRows: { rowNumber: number; reason: string; rawData: Record<string, any> }[] = [];
  const seenMatrics = new Set<string>();

  for (let r = headerIndex + 1; r < matrix.length; r++) {
    const row = matrix[r];
    // Skip empty lines
    if (!row || row.every((c) => String(c).trim() === "")) continue;

    const rowObj: Record<string, any> = {};
    rawHeaders.forEach((header, idx) => {
      rowObj[header || `col_${idx}`] = row[idx] || "";
    });

    const rawMatric = columnMap["matricNumber"] !== undefined ? String(row[columnMap["matricNumber"]] || "").trim() : "";
    const rawName = columnMap["fullName"] !== undefined ? String(row[columnMap["fullName"]] || "").trim() : "";
    const rawEmail = columnMap["email"] !== undefined ? String(row[columnMap["email"]] || "").trim().toLowerCase() : "";
    const rawDept = columnMap["department"] !== undefined ? String(row[columnMap["department"]] || "").trim() : "";
    const rawFaculty = columnMap["faculty"] !== undefined ? String(row[columnMap["faculty"]] || "").trim() : "";
    const rawLevel = columnMap["level"] !== undefined ? String(row[columnMap["level"]] || "").trim() : "";
    const rawPin = columnMap["studentPin"] !== undefined ? String(row[columnMap["studentPin"]] || "").trim() : "";

    if (!rawMatric || rawMatric.length < 2) {
      invalidRows.push({
        rowNumber: r + 1,
        reason: "Missing or blank matriculation number.",
        rawData: rowObj,
      });
      continue;
    }

    // Preserve leading zeros and format matric
    const matricNumber = rawMatric.toUpperCase();

    if (seenMatrics.has(matricNumber)) {
      invalidRows.push({
        rowNumber: r + 1,
        reason: `Duplicate matriculation number "${matricNumber}" within the uploaded list.`,
        rawData: rowObj,
      });
      continue;
    }

    seenMatrics.add(matricNumber);

    validRows.push({
      matricNumber,
      fullName: rawName || `Student ${matricNumber}`,
      email: rawEmail || undefined,
      department: rawDept || undefined,
      faculty: rawFaculty || undefined,
      level: rawLevel || undefined,
      studentPin: rawPin || generateStudentPin(),
    });
  }

  if (validRows.length === 0 && invalidRows.length === 0) {
    invalidRows.push({
      rowNumber: 1,
      reason: "No student records could be identified. Please ensure the file contains columns for Matriculation Number and Full Name.",
      rawData: {},
    });
  }

  return {
    success: validRows.length > 0,
    validRows,
    invalidRows,
    detectedColumns: Object.keys(columnMap),
    totalExtracted: validRows.length,
    fileName,
  };
}

/**
 * Universal dispatcher for file buffer based on MIME type or filename extension
 */
export async function parseClassListFile(buffer: Buffer, fileName: string): Promise<ParseResult> {
  const ext = fileName.toLowerCase().split(".").pop();

  switch (ext) {
    case "xlsx":
    case "xls":
      return parseExcelBuffer(buffer, fileName);
    case "csv":
      return parseCsvBuffer(buffer, fileName);
    case "docx":
    case "doc":
      return parseDocxBuffer(buffer, fileName);
    case "pdf":
      return parsePdfBuffer(buffer, fileName);
    default:
      return {
        success: false,
        validRows: [],
        invalidRows: [
          {
            rowNumber: 1,
            reason: `Unsupported file format ".${ext}". Please upload an Excel (.xlsx, .xls), CSV (.csv), Word (.docx), or PDF (.pdf) file.`,
            rawData: {},
          },
        ],
        detectedColumns: [],
        totalExtracted: 0,
        fileName,
      };
  }
}
