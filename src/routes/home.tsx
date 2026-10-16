import React, { useState, useEffect } from "react";
import { Link, redirect } from "react-router";
import {
  GraduationCap,
  QrCode,
  FileSpreadsheet,
  UploadCloud,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  Lock,
  Smartphone,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { getUser } from "@/lib/session.server";

export async function loader({ request }: { request: Request }) {
  const user = await getUser(request);
  if (user) {
    throw redirect("/dashboard");
  }
  return null;
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Academic Navigation Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-sky-700 rounded-lg p-1 -ml-1">
            <div className="w-9 h-9 rounded-md bg-sky-800 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-lg">ClassMark</span>
              <span className="hidden md:inline-block text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                University Attendance System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-sky-800 transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-sky-800 transition-colors">
              How it Works
            </a>
            <a href="#security" className="hover:text-sky-800 transition-colors">
              Anti-Proxy Defense
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors"
            >
              Lecturer Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 px-3.5 py-2 rounded-md shadow-xs transition-colors"
            >
              Register Account
            </Link>
          </div>

          {/* Mobile Right Controls: Quick Sign In + Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-700 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={closeMenu}
          />

          {/* Drawer Sheet */}
          <div className="relative ml-auto w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-sky-800 text-white flex items-center justify-center font-bold shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm leading-tight">ClassMark</h2>
                  <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                    Academic Portal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
              <p className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Explore Platform
              </p>

              <a
                href="#features"
                onClick={closeMenu}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <UploadCloud className="w-4 h-4 text-sky-800" />
                <span>Features & Roster Import</span>
              </a>

              <a
                href="#workflow"
                onClick={closeMenu}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <QrCode className="w-4 h-4 text-sky-800" />
                <span>How It Works</span>
              </a>

              <a
                href="#security"
                onClick={closeMenu}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Anti-Proxy Security</span>
              </a>

              <div className="pt-4 border-t border-slate-100 mt-4 space-y-2.5">
                <p className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Lecturer Account
                </p>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Register Lecturer Account</span>
                </Link>

                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                >
                  <span>Lecturer Sign In</span>
                </Link>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 text-center space-y-1">
              <p className="font-semibold text-slate-700">Nigerian Tertiary Institution Standard</p>
              <p className="text-slate-400">Official Academic Attendance Records</p>
            </div>
          </div>
        </div>
      )}

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
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-md shadow-xs transition-colors"
              >
                <span>Access Lecturer Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-200"
              >
                Create Lecturer Account
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-20">
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

        {/* Anti-Proxy Security Section */}
        <section id="security" className="py-16 bg-white border-y border-slate-200 scroll-mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-Tolerance Integrity</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Multi-Layer Anti-Proxy Architecture
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
                Built-in hardware device-locking and verification safeguards ensure only students physically in the lecture hall get recorded.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/60">
                <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center mb-3">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Hardware Device Locking</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Each student's phone hardware fingerprint binds exclusively to their matric number. One physical device cannot sign in for another student.
                </p>
              </div>

              <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/60">
                <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Physical In-Class PIN & OTP</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lecturers can enforce a randomized PIN announced in the classroom or institutional email OTP verification for airtight validation.
                </p>
              </div>

              <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/60">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Tamper-Proof Audit Trail</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every check-in is logged with exact IP address, user-agent hardware hash, and ISO timestamp for accredited departmental defense.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow overview */}
        <section id="workflow" className="py-12 bg-slate-50 border-b border-slate-200 scroll-mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 text-center mb-8">
              Straightforward 4-Step Lecturer Workflow
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 border border-slate-200 rounded-md bg-white shadow-2xs">
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">Step 1</span>
                <p className="font-semibold text-xs text-slate-900 mt-2">Create Course</p>
                <p className="text-[11px] text-slate-500 mt-1">Specify code, title, semester, and attendance threshold</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-md bg-white shadow-2xs">
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">Step 2</span>
                <p className="font-semibold text-xs text-slate-900 mt-2">Import Class Roster</p>
                <p className="text-[11px] text-slate-500 mt-1">Upload Excel, CSV, Word, or PDF list of students</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-md bg-white shadow-2xs">
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">Step 3</span>
                <p className="font-semibold text-xs text-slate-900 mt-2">Display Session QR</p>
                <p className="text-[11px] text-slate-500 mt-1">Students scan and verify in-class presence</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-md bg-white shadow-2xs">
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">Step 4</span>
                <p className="font-semibold text-xs text-slate-900 mt-2">Export Semester Report</p>
                <p className="text-[11px] text-slate-500 mt-1">Download clean Excel and PDF files for records</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Academic Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-sky-800 text-white flex items-center justify-center font-bold text-xs">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">ClassMark</span>
            <span className="text-slate-400">|</span>
            <span>University Attendance System</span>
          </div>
          <p className="text-slate-500">
            Confidential University Academic Records Portal.
          </p>
        </div>
      </footer>
    </div>
  );
}
