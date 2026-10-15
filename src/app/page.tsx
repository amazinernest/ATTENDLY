import Link from "next/link";
import { redirect } from "next/navigation";
import {
  GraduationCap,
  QrCode,
  FileSpreadsheet,
  UploadCloud,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Users,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Academic Navigation Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-sky-800 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-lg">ClassMark</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                University Attendance System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors"
            >
              Lecturer Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 px-3.5 py-2 rounded-md shadow-xs transition-colors"
            >
              Register Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 sm:py-24 border-b border-slate-200 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200 rounded-full text-xs font-medium text-sky-800 mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Designed for Nigerian Universities and Tertiary Institutions</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 leading-tight">
              Production University Attendance Management Platform
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Import class lists seamlessly, conduct secure QR-based lecture attendance, prevent proxy check-ins, and export verified semester reports in Excel and PDF formats.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-md shadow-xs transition-colors"
              >
                <span>Access Lecturer Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-200"
              >
                Create Lecturer Account
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Core Academic Attendance Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Engineered specifically for academic workflows, lecture halls, and departmental audits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs">
              <div className="w-10 h-10 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center mb-4">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Class List File Import</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Directly import student rosters from Excel (.xlsx), CSV, Word (.docx), and PDF files. Preserves leading zeros in matriculation numbers and eliminates manual data entry.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs">
              <div className="w-10 h-10 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center mb-4">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">QR Code & Identity Check-In</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Project a large dynamic session QR code in class. Students verify with their matriculation number and configured PIN or institutional email verification to eliminate proxy attendance.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs">
              <div className="w-10 h-10 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Semester Reports & Exports</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatic calculation of attendance percentage per student, threshold alerts (e.g., 75%), session attendance matrix, and one-click export to official Excel and PDF documents.
              </p>
            </div>
          </div>
        </section>

        {/* Workflow overview */}
        <section className="py-12 bg-white border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 text-center mb-8">
              Straightforward 4-Step Lecturer Workflow
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 border border-slate-200 rounded-md bg-slate-50">
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">Step 1</span>
                <p className="font-semibold text-xs text-slate-900 mt-2">Create Course</p>
                <p className="text-[11px] text-slate-500 mt-1">Specify code, title, semester, and attendance threshold</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-md bg-slate-50">
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">Step 2</span>
                <p className="font-semibold text-xs text-slate-900 mt-2">Import Class Roster</p>
                <p className="text-[11px] text-slate-500 mt-1">Upload Excel, CSV, Word, or PDF list of students</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-md bg-slate-50">
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">Step 3</span>
                <p className="font-semibold text-xs text-slate-900 mt-2">Display Session QR</p>
                <p className="text-[11px] text-slate-500 mt-1">Students scan and verify in-class presence</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-md bg-slate-50">
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">Step 4</span>
                <p className="font-semibold text-xs text-slate-900 mt-2">Export Semester Report</p>
                <p className="text-[11px] text-slate-500 mt-1">Download clean Excel and PDF files for records</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Academic Footer */}
      <footer className="border-t border-slate-200 bg-slate-100 py-6 text-center text-xs text-slate-500">
        <p>ClassMark Academic Attendance System. Confidential University Records Portal.</p>
      </footer>
    </div>
  );
}
