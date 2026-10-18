import React, { useState, useEffect } from "react";
import { Link, redirect } from "react-router";
import {
  GraduationCap,
  QrCode,
  FileSpreadsheet,
  UploadCloud,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  Lock,
  Smartphone,
  CheckCircle2,
  Sparkles,
  LogIn,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Award,
  FileCheck,
  Shield,
  Clock,
  Users,
  Check,
  BarChart3,
  FileText,
  Fingerprint,
  AlertTriangle,
  Download,
  Activity,
  Layers,
  Zap,
  Radio,
  Search,
  ExternalLink,
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
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // App Cockpit Simulation State
  const [activeTab, setActiveTab] = useState<"projector" | "roster" | "clearance" | "security">("projector");
  const [demoTicker, setDemoTicker] = useState(388);
  const [demoTimeLeft, setDemoTimeLeft] = useState("04:18");
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<"all" | "cleared" | "barred">("all");

  // Lock body scroll when mobile menu or modal is active
  useEffect(() => {
    if (mobileMenuOpen || activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, activeModal]);

  // Handle ESC key to close mobile menu, modal, or mega menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setMegaMenuOpen(false);
        setActiveModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Live ticker animation for live lecture simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoTicker((prev) => (prev < 410 ? prev + 1 : 388));
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  const studentsMock = [
    { matric: "001429", name: "Adebayo Kehinde", attended: 22, total: 24, percent: 91.7, status: "CLEARED", device: "iPhone 14 Pro" },
    { matric: "001580", name: "Okafor Chinedu", attended: 20, total: 24, percent: 83.3, status: "CLEARED", device: "Galaxy S23" },
    { matric: "001602", name: "Danjuma Musa", attended: 14, total: 24, percent: 58.3, status: "BARRED", device: "Pixel 7" },
    { matric: "001715", name: "Balogun Aisha", attended: 23, total: 24, percent: 95.8, status: "CLEARED", device: "iPhone 13" },
    { matric: "001890", name: "Eze Emeka", attended: 16, total: 24, percent: 66.7, status: "BARRED", device: "Redmi Note 12" },
  ];

  const filteredStudents = studentsMock.filter((s) => {
    if (selectedStudentFilter === "cleared") return s.status === "CLEARED";
    if (selectedStudentFilter === "barred") return s.status === "BARRED";
    return true;
  });

  const partners = [
    "University of Lagos",
    "University of Ibadan",
    "Ahmadu Bello Univ",
    "Obafemi Awolowo Univ",
    "Covenant University",
    "FUTA Akure",
    "Univ of Nigeria, Nsukka",
    "University of Benin",
  ];

  const modalContents: Record<string, { title: string; subtitle: string; content: React.ReactNode }> = {
    nuc: {
      title: "NUC Attendance & Accreditation Standards",
      subtitle: "National Universities Commission Compliance Framework",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
          <p>
            Under Nigerian National Universities Commission (NUC) academic guidelines, undergraduate candidates are required to attain a minimum of <strong className="text-white">70% to 75% lecture and laboratory attendance</strong> to qualify for semester examinations.
          </p>
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
            <h5 className="font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#d7f837]" />
              Compliance Verification Criteria:
            </h5>
            <ul className="list-disc pl-5 space-y-1 text-stone-400">
              <li>Tamper-proof student attendance logs recorded per academic session.</li>
              <li>Complete date, time, and session duration tracking.</li>
              <li>Hardware-backed anti-proxy defense preventing retroactive tampering.</li>
              <li>Exportable official semester attendance matrix in Excel and signed PDF formats.</li>
            </ul>
          </div>
          <p>
            ClassMark automatically enforces these criteria, computing semester percentage rankings and flagging below-threshold students before final examination clearance slips are printed.
          </p>
        </div>
      ),
    },
    exam: {
      title: "Semester Examination Clearance Engine",
      subtitle: "Automated Candidate Validation & Exam Hall Slips",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
          <p>
            ClassMark eliminates the chaotic manual tallying of attendance sign-in sheets before final exams.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
              <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Eligible Candidates (≥ 75%)
              </span>
              <p className="text-xs text-stone-300 mt-1">Automatic clearance status with digital verification stamps and printable hall passes.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30">
              <span className="font-bold text-rose-400 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Barred Candidates (&lt; 75%)
              </span>
              <p className="text-xs text-stone-300 mt-1">Instant notification with complete breakdown of missed lectures and deficit calculations.</p>
            </div>
          </div>
          <p>
            Department exam officers can generate printable official clearance rosters and Senate-format summary sheets with a single click.
          </p>
        </div>
      ),
    },
    audit: {
      title: "Departmental Audit & Accreditation Trail",
      subtitle: "Immutable Session History & Verification Hashes",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
          <p>
            Every attendance session generated on ClassMark produces a cryptographically validated session ledger with ISO 8601 timestamps, lecturer credentials, and verified student check-in metadata.
          </p>
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2 text-xs font-mono text-stone-300">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#d7f837]" />
              <span>GEO & Session IP Range Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#d7f837]" />
              <span>Unique Device Hardware Hash (UUID) Binding</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#d7f837]" />
              <span>Single Check-In Per Physical Smartphone</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#d7f837]" />
              <span>Immutable Audit Log for Senate & NUC Verification</span>
            </div>
          </div>
        </div>
      ),
    },
    security: {
      title: "Hardware Device-Locking Security Architecture",
      subtitle: "Zero-Tolerance Anti-Proxy Protection",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
          <p>
            Traditional paper sheets and static QR codes suffer from widespread proxy signing, where absent students share links via WhatsApp or peer sign-ins.
          </p>
          <p className="font-semibold text-white">
            ClassMark&apos;s 3-Layer Defense:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-stone-300">
            <li><strong className="text-white">Hardware Fingerprinting:</strong> Each student&apos;s device is cryptographically bound to their matriculation number upon first scan. One phone cannot check in for another student.</li>
            <li><strong className="text-white">Dynamic In-Class PIN:</strong> The lecturer announces or displays a randomized 4-digit code in the classroom that expires when the session ends.</li>
            <li><strong className="text-white">Session Expiry Windows:</strong> Sessions automatically close when the lecture concludes, stopping late proxy submissions.</li>
          </ol>
        </div>
      ),
    },
    privacy: {
      title: "Data Privacy & Institutional Protection",
      subtitle: "Student & Faculty Data Confidentiality Policy",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
          <p>
            ClassMark is committed to institutional data confidentiality. Student matriculation numbers, email addresses, and attendance records are processed solely for academic record-keeping and audit validation.
          </p>
          <p>
            Data is encrypted in transit using TLS 1.3 and at rest with AES-256 standards. Student location or personal device identifiers are never shared with external commercial entities.
          </p>
        </div>
      ),
    },
    terms: {
      title: "Academic Portal Terms of Service",
      subtitle: "University Lecturer & Staff Usage Agreement",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
          <p>
            By utilizing the ClassMark Academic Platform, authorized university faculty and staff agree to maintain academic record confidentiality and adhere to institutional grading and attendance regulations.
          </p>
          <p>
            Any unauthorized tampering with student attendance percentages or falsification of exam clearance reports constitutes an academic violation subject to institutional disciplinary procedures.
          </p>
        </div>
      ),
    },
    integrity: {
      title: "Zero-Tolerance Academic Integrity Policy",
      subtitle: "Defending Educational Excellence Across Campuses",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
          <p>
            Academic attendance is directly correlated with student competency, laboratory readiness, and graduation qualifications.
          </p>
          <p>
            ClassMark enforces a zero-tolerance policy against proxy attendance fraud. Any attempt to spoof device hashes or distribute in-class check-in codes outside the physical lecture hall will trigger an automated security audit flag on the student&apos;s departmental file.
          </p>
        </div>
      ),
    },
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-[#f4f4f5] font-sans antialiased selection:bg-[#d7f837] selection:text-black relative overflow-x-hidden">
      
      {/* Subtle Background Glows (Linear/Raycast style) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-radial from-[#d7f837]/10 via-emerald-500/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-radial from-blue-600/5 to-transparent blur-[140px] pointer-events-none" />

      {/* Main Container strictly bounded to 1200px max width */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24 py-5 sm:py-7">
        
        {/* ========================================================= */}
        {/* APP FLOATING HEADER */}
        {/* ========================================================= */}
        <header className="sticky top-4 z-40 bg-[#0d0e12]/80 backdrop-blur-xl border border-white/[0.08] rounded-full px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl">
          {/* Left: Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#16171d] border border-white/10 flex items-center justify-center group-hover:border-[#d7f837]/50 transition-colors shadow-sm">
              <GraduationCap className="w-4 h-4 text-[#d7f837]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                CLASSMARK
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#d7f837]/15 text-[#d7f837] text-[10px] font-mono font-bold border border-[#d7f837]/30">
                v2.4
              </span>
            </div>
          </Link>

          {/* Center: Desktop Nav with Mega Menu */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-400">
            {/* Mega Menu Trigger & Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
            >
              <button
                type="button"
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  megaMenuOpen
                    ? "text-white bg-white/10"
                    : "text-stone-300 hover:text-white hover:bg-white/5"
                }`}
                aria-expanded={megaMenuOpen}
              >
                <span className="font-semibold">Platform</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    megaMenuOpen ? "rotate-180 text-[#d7f837]" : "text-stone-400"
                  }`}
                />
              </button>

              {/* Mega Menu Dropdown */}
              {megaMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setMegaMenuOpen(false)} 
                  />
                  <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[620px] max-w-[90vw] bg-[#0c0d14]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] p-5 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setMegaMenuOpen(false)}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {/* Column 1: Core Capabilities */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold px-2.5 pb-1">
                          Core Capabilities
                        </div>

                        <a
                          href="#cockpit"
                          onClick={() => {
                            setMegaMenuOpen(false);
                            setActiveTab("projector");
                          }}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#d7f837]/10 border border-[#d7f837]/20 flex items-center justify-center text-[#d7f837] shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <Radio className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-[#d7f837] transition-colors flex items-center gap-1.5">
                              <span>Live Projector Cockpit</span>
                              <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">LIVE</span>
                            </div>
                            <p className="text-[11px] text-stone-400 leading-snug mt-0.5">
                              Dynamic in-hall QR code, classroom PIN & real-time counter.
                            </p>
                          </div>
                        </a>

                        <a
                          href="#security"
                          onClick={() => setMegaMenuOpen(false)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <Fingerprint className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-[#d7f837] transition-colors">
                              Device-Lock Shield
                            </div>
                            <p className="text-[11px] text-stone-400 leading-snug mt-0.5">
                              Cryptographic hardware binding stopping proxy attendance.
                            </p>
                          </div>
                        </a>

                        <a
                          href="#features"
                          onClick={() => setMegaMenuOpen(false)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <UploadCloud className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-[#d7f837] transition-colors">
                              Universal Roster Ingest
                            </div>
                            <p className="text-[11px] text-stone-400 leading-snug mt-0.5">
                              Ingests Excel, Word, PDF & CSV with leading zero fidelity.
                            </p>
                          </div>
                        </a>
                      </div>

                      {/* Column 2: Governance & Accreditation */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold px-2.5 pb-1">
                          Governance & Senate
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setMegaMenuOpen(false);
                            setActiveTab("clearance");
                            const el = document.getElementById("cockpit");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-[#d7f837] transition-colors flex items-center gap-1.5">
                              <span>75% Exam Clearance</span>
                              <span className="text-[9px] font-mono px-1 rounded bg-[#d7f837]/15 text-[#d7f837]">NUC</span>
                            </div>
                            <p className="text-[11px] text-stone-400 leading-snug mt-0.5">
                              Automated eligible vs barred student matrix before exams.
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMegaMenuOpen(false);
                            setActiveModal("exam");
                          }}
                          className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#d7f837]/10 border border-[#d7f837]/20 flex items-center justify-center text-[#d7f837] shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-[#d7f837] transition-colors">
                              Official Senate Registers
                            </div>
                            <p className="text-[11px] text-stone-400 leading-snug mt-0.5">
                              1-click signed PDF rosters & multi-sheet Excel exports.
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMegaMenuOpen(false);
                            setActiveModal("audit");
                          }}
                          className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-[#d7f837] transition-colors">
                              Tamper-Proof Audit Trail
                            </div>
                            <p className="text-[11px] text-stone-400 leading-snug mt-0.5">
                              Cryptographic session validation & manual override logs.
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Footer Strip of Mega Menu */}
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-stone-400">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>NUC Accreditation Ready</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMegaMenuOpen(false);
                          setActiveModal("nuc");
                        }}
                        className="text-[#d7f837] hover:underline font-semibold cursor-pointer"
                      >
                        View NUC Guidelines →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Simple Workflow Link */}
            <a href="#workflow" className="hover:text-white transition-colors">
              Workflow
            </a>

            {/* NUC Standards Modal Trigger */}
            <button
              type="button"
              onClick={() => setActiveModal("nuc")}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-stone-300"
            >
              <span>NUC Standards</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/register"
              className="text-xs font-semibold text-stone-400 hover:text-white px-3 py-1.5 transition-colors hidden sm:inline-block"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 bg-[#d7f837] hover:bg-[#cbf028] text-black text-xs font-extrabold px-4 py-2 rounded-full transition-all shadow-[0_0_20px_rgba(215,248,55,0.2)] hover:shadow-[0_0_25px_rgba(215,248,55,0.35)] active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-300 md:hidden cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* HERO SECTION: RAZOR-SHARP APP PITCH */}
        {/* ========================================================= */}
        <section className="text-center space-y-6 pt-4 sm:pt-10">
          
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-stone-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-semibold">The University Attendance Operating System</span>
            <span className="text-stone-500">·</span>
            <span className="text-[#d7f837] font-mono">Zero Proxies</span>
          </div>

          {/* Main Hero Headline */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tight text-white leading-[1.08]">
              Automate lecture halls in 90 seconds. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d7f837] via-emerald-300 to-teal-400">
                Zero proxy fraud.
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-stone-400 max-w-2xl mx-auto leading-relaxed font-normal">
              A high-performance attendance application for university lecturers. Ingest messy rosters in seconds, eliminate proxies with hardware device binding, and automate 75% NUC Senate clearance reports in 1 click.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2.5 bg-[#d7f837] hover:bg-[#cbf028] text-black text-sm font-extrabold px-6 py-3 rounded-full transition-all shadow-[0_0_30px_rgba(215,248,55,0.25)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started as Lecturer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#121319] hover:bg-[#1a1b24] text-stone-200 border border-white/10 text-sm font-semibold px-6 py-3 rounded-full transition-all hover:border-white/20"
            >
              <LogIn className="w-4 h-4 text-stone-400" />
              <span>Sign In to Workspace</span>
            </Link>
          </div>

          {/* Metric Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono text-stone-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#d7f837]" />
              <span>90s Hall Processing</span>
            </div>
            <div className="hidden sm:inline text-stone-700">•</div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hardware-Locked UUID</span>
            </div>
            <div className="hidden sm:inline text-stone-700">•</div>
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-[#d7f837]" />
              <span>100% Leading-Zero Integrity</span>
            </div>
            <div className="hidden sm:inline text-stone-700">•</div>
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>NUC 75% Senate Compliant</span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* HERO SHOWCASE: THE INTERACTIVE MACOS APP COCKPIT */}
        {/* ========================================================= */}
        <section id="cockpit" className="scroll-mt-24">
          <div className="relative rounded-[24px] sm:rounded-[32px] bg-[#0d0e14] border border-white/[0.12] shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden">
            
            {/* macOS Window Top Bar */}
            <div className="px-4 py-3 bg-[#13141c] border-b border-white/[0.08] flex items-center justify-between">
              {/* Traffic lights */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40" />
                <span className="text-[11px] font-mono text-stone-400 ml-3 hidden sm:inline">
                  ClassMark Cockpit — CSC 201: Data Structures & Algorithms
                </span>
              </div>

              {/* Live Status Indicator */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>SESSION ACTIVE</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-stone-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{demoTimeLeft}</span>
                </div>
              </div>
            </div>

            {/* In-App Navigation Tabs */}
            <div className="px-4 py-2 bg-[#0a0b10] border-b border-white/[0.06] flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("projector")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === "projector"
                    ? "bg-[#d7f837] text-black shadow-sm font-bold"
                    : "text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Live QR Projector</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("roster")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === "roster"
                    ? "bg-[#d7f837] text-black shadow-sm font-bold"
                    : "text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Live Register Feed</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("clearance")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === "clearance"
                    ? "bg-[#d7f837] text-black shadow-sm font-bold"
                    : "text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>75% Exam Clearance</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === "security"
                    ? "bg-[#d7f837] text-black shadow-sm font-bold"
                    : "text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Device-Lock Logs</span>
              </button>
            </div>

            {/* App Viewport Body */}
            <div className="p-4 sm:p-7 min-h-[420px] bg-[#0c0d13]">
              
              {/* TAB 1: LIVE QR PROJECTOR */}
              {activeTab === "projector" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  
                  {/* Left: Dynamic QR Card (Projector View) */}
                  <div className="lg:col-span-6 bg-[#12131b] rounded-2xl p-5 border border-white/10 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
                    <div className="relative p-4 rounded-2xl bg-white shadow-2xl flex items-center justify-center">
                      <QrCode className="w-48 h-48 sm:w-56 sm:h-56 text-[#09090b]" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-xl bg-[#d7f837] text-black flex items-center justify-center font-black text-xs shadow-lg border-2 border-black">
                          CM
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-mono text-stone-400 uppercase tracking-widest">
                        Classroom Anti-Remote PIN
                      </div>
                      <div className="inline-block px-4 py-1.5 rounded-xl bg-black border border-white/10 text-[#d7f837] font-mono text-xl sm:text-2xl font-black tracking-widest shadow-inner">
                        PIN: 8492
                      </div>
                      <p className="text-[11px] text-stone-400 pt-1">
                        Display on lecture hall projector. Students scan and verify in 3 seconds.
                      </p>
                    </div>
                  </div>

                  {/* Right: Real-time Cockpit Metrics */}
                  <div className="lg:col-span-6 space-y-5">
                    
                    {/* Live Auditorium Progress */}
                    <div className="bg-[#12131b] rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                        <span className="text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#d7f837]" />
                          <span>Auditorium Sign-In Velocity</span>
                        </span>
                        <span className="text-[#d7f837] font-mono font-bold">
                          {demoTicker} / 412 Verified (94.6%)
                        </span>
                      </div>

                      <div className="w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-[#d7f837] rounded-full transition-all duration-500"
                          style={{ width: `${(demoTicker / 412) * 100}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                        <span>Speed: ~4.2 check-ins/sec</span>
                        <span className="text-emerald-400">0 Proxies Detected</span>
                      </div>
                    </div>

                    {/* Live Stream of Student Scans */}
                    <div className="bg-[#12131b] rounded-2xl p-4 border border-white/10 space-y-2">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400 flex items-center justify-between">
                        <span>Live Hardware Handshake Log</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Streaming
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs font-mono">
                          <span className="text-white font-bold">001429 · Adebayo K.</span>
                          <span className="text-stone-400 text-[11px]">iPhone 14 Pro</span>
                          <span className="text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            UUID BOUND ✓
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs font-mono">
                          <span className="text-white font-bold">001580 · Okafor C.</span>
                          <span className="text-stone-400 text-[11px]">Galaxy S23</span>
                          <span className="text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            UUID BOUND ✓
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs font-mono">
                          <span className="text-white font-bold">001715 · Balogun A.</span>
                          <span className="text-stone-400 text-[11px]">iPhone 13</span>
                          <span className="text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            UUID BOUND ✓
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        to="/register"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#d7f837] hover:bg-[#cbf028] text-black font-extrabold text-xs text-center transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                      >
                        <span>Start Session on ClassMark</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setActiveModal("security")}
                        className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 font-semibold text-xs border border-white/10 cursor-pointer"
                      >
                        Security Protocol
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: LIVE REGISTER FEED */}
              {activeTab === "roster" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Enrolled Class Roster — CSC 201 (412 Students)
                      </h4>
                      <p className="text-xs text-stone-400">
                        100% Leading-zero preserved. Instant real-time search & manual lecturer override audit.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          readOnly
                          value="Filter: 0014..."
                          className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-stone-300 font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-stone-400 text-[11px] uppercase">
                          <th className="py-2.5 px-3">Matric No</th>
                          <th className="py-2.5 px-3">Student Name</th>
                          <th className="py-2.5 px-3">Attendance</th>
                          <th className="py-2.5 px-3">Hardware Lock</th>
                          <th className="py-2.5 px-3">Audit Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {studentsMock.map((student, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-2.5 px-3 font-bold text-[#d7f837]">
                              {student.matric}
                            </td>
                            <td className="py-2.5 px-3 text-white font-sans font-medium">
                              {student.name}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-stone-300">
                                {student.attended}/{student.total} ({student.percent}%)
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-sans font-semibold">
                                <Check className="w-3 h-3" />
                                {student.device}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <button
                                type="button"
                                onClick={() => setActiveModal("audit")}
                                className="text-[11px] text-stone-400 hover:text-white underline cursor-pointer"
                              >
                                Override with Reason
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: 75% EXAM CLEARANCE */}
              {activeTab === "clearance" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>NUC Senate Examination Clearance Engine</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                          THRESHOLD: 75%
                        </span>
                      </h4>
                      <p className="text-xs text-stone-400">
                        Automatically partitions eligible candidates from barred students for Senate approval.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentFilter("all")}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                          selectedStudentFilter === "all" ? "bg-white text-black font-bold" : "text-stone-400 hover:text-white"
                        }`}
                      >
                        All (5)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedStudentFilter("cleared")}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                          selectedStudentFilter === "cleared" ? "bg-emerald-500 text-black font-bold" : "text-stone-400 hover:text-white"
                        }`}
                      >
                        Cleared (3)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedStudentFilter("barred")}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                          selectedStudentFilter === "barred" ? "bg-rose-500 text-white font-bold" : "text-stone-400 hover:text-white"
                        }`}
                      >
                        Barred (2)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="text-[10px] uppercase font-mono text-stone-400">Total Lectures Conducted</div>
                      <div className="text-xl font-bold text-white mt-1">24 Sessions</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <div className="text-[10px] uppercase font-mono text-emerald-400">Cleared for Examination</div>
                      <div className="text-xl font-bold text-emerald-300 mt-1">372 Candidates (90.3%)</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                      <div className="text-[10px] uppercase font-mono text-rose-400">Barred (Deficient Attendance)</div>
                      <div className="text-xl font-bold text-rose-300 mt-1">40 Candidates (9.7%)</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {filteredStudents.map((st, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#12131b] border border-white/5 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#d7f837]">{st.matric}</span>
                          <span className="text-white font-sans">{st.name}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-stone-400">{st.attended}/{st.total} ({st.percent}%)</span>
                          {st.status === "CLEARED" ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                              CLEARED FOR EXAM ✓
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
                              BARRED (DEFICIENT) ✕
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveModal("exam")}
                      className="px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs flex items-center gap-2 hover:bg-stone-200 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Sealed Senate PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal("nuc")}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#d7f837]" />
                      <span>Export Multi-Sheet Excel Matrix</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: DEVICE-LOCK LOGS */}
              {activeTab === "security" && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-white/[0.06]">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-[#d7f837]" />
                      <span>Hardware Fingerprint Security Protocol</span>
                    </h4>
                    <p className="text-xs text-stone-400">
                      Cryptographic binding blocks students from signing in for friends via WhatsApp links.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#12131b] border border-white/10 space-y-2">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>1 Device = 1 Matric Number</span>
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        On first scan, the student&apos;s device hardware signature is bound to their matriculation profile. If another student attempts to use the same phone, the scan is rejected instantly.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#12131b] border border-white/10 space-y-2">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#d7f837]" />
                        <span>Dynamic Hall PIN Protection</span>
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        A dynamic 4-digit code is generated and projected inside the hall. Absent students cannot check in remotely even if a peer takes a photo of the QR code.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-[11px] text-stone-400 space-y-1">
                    <div className="text-stone-300 font-bold">Latest Security Handshake Audit:</div>
                    <div className="text-emerald-400">✓ SHA-256 Hardware Token Verified: Device-8f3a92...b2c9</div>
                    <div className="text-emerald-400">✓ In-Hall Session Window Active (Expiry: 04:18)</div>
                    <div className="text-emerald-400">✓ 0 Duplicate Hardware MAC Claims Detected</div>
                  </div>
                </div>
              )}

            </div>

            {/* macOS Window Bottom Status Bar */}
            <div className="px-4 py-2 bg-[#09090e] border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>ClassMark Engine v2.4 (Active)</span>
              </span>
              <span>NUC Accreditation Compliant</span>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION: 3-SECOND STUDENT CHECK-IN WORKFLOW (NO APP DOWNLOAD) */}
        {/* ========================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#d7f837]">
              Student Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Zero App Installs Required for Students
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              Students simply open their mobile camera, scan the projector screen, and check in via browser in 3 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-6 rounded-2xl bg-[#0f1017] border border-white/[0.08] space-y-3 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d7f837] font-mono font-bold">
                01
              </div>
              <h3 className="font-bold text-base text-white">Scan Projector QR</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Student points smartphone camera at the projected dynamic QR code in the auditorium.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f1017] border border-white/[0.08] space-y-3 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d7f837] font-mono font-bold">
                02
              </div>
              <h3 className="font-bold text-base text-white">Enter Matric & PIN</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Inputs matriculation number and the randomized 4-digit classroom code displayed on the screen.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f1017] border border-white/[0.08] space-y-3 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 font-mono font-bold">
                03
              </div>
              <h3 className="font-bold text-base text-white">Hardware Locked</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Device hardware locks permanently to the matric number. Verified check-in is logged to the lecturer instantly.
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION: PRODUCT ARCHITECTURE & CORE MODULES */}
        {/* ========================================================= */}
        <section id="features" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#d7f837]">
              Product Modules
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Built Like a High-Performance SaaS
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              Every detail engineered to handle 500-seat lecture halls without delays, crashed sheets, or corrupted data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Module 1: Universal Roster Parsing */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0f1017] border border-white/[0.08] space-y-4 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#d7f837]/10 border border-[#d7f837]/20 flex items-center justify-center text-[#d7f837]">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Universal Roster File Ingestion</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Directly parses rosters from Excel (.xlsx), CSV, Word (.docx), and PDF files. Preserves matriculation leading zeros (<code className="text-[#d7f837] bg-white/5 px-1 py-0.5 rounded">004128</code>) without spreadsheet corruption.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-stone-300 space-y-1">
                <div className="text-emerald-400">✓ Auto-detects matric & name columns</div>
                <div className="text-emerald-400">✓ Tolerates messy departmental formats</div>
                <div className="text-emerald-400">✓ Ingests 2,000 students in 0.4 seconds</div>
              </div>
            </div>

            {/* Module 2: Anti-Proxy Device Shield */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0f1017] border border-white/[0.08] space-y-4 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Hardware Device-Locking Defense</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Cryptographically locks each student&apos;s physical phone hardware fingerprint to their matric number. One smartphone cannot sign in for multiple students, permanently stopping lecture proxies.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-stone-300 space-y-1">
                <div className="text-emerald-400">✓ Cryptographic UUID binding</div>
                <div className="text-emerald-400">✓ Zero duplicate smartphone check-ins</div>
                <div className="text-emerald-400">✓ Full anti-spoofing audit detection</div>
              </div>
            </div>

            {/* Module 3: 75% NUC Clearance Engine */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0f1017] border border-white/[0.08] space-y-4 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Automated 75% NUC Senate Engine</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Eliminates weeks of manual attendance tallying before examinations. Instantly computes cumulative percentage per student against the official 75% accreditation threshold.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-stone-300 space-y-1">
                <div className="text-emerald-400">✓ Automated barred candidate roster</div>
                <div className="text-emerald-400">✓ Printable examination eligibility slips</div>
                <div className="text-emerald-400">✓ Pre-exam clearance verified in 1 second</div>
              </div>
            </div>

            {/* Module 4: 1-Click Senate Reports */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0f1017] border border-white/[0.08] space-y-4 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Official Sealed Senate PDF & Excel</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Export complete semester registers, attendance matrices, and summary reports formatted directly for Senate accreditation boards and external academic external examiners.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-stone-300 space-y-1">
                <div className="text-emerald-400">✓ Multi-sheet Excel matrices</div>
                <div className="text-emerald-400">✓ Official signed PDF format with seal</div>
                <div className="text-emerald-400">✓ Complete manual override audit logs</div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION: INSTITUTIONAL TRUST TICKER */}
        {/* ========================================================= */}
        <section className="py-4 space-y-4">
          <div className="text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
              Compatible with Academic Records from Leading Tertiary Institutions
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="bg-[#0f1017] hover:bg-[#151620] border border-white/[0.06] rounded-xl px-3 py-2.5 text-center flex items-center justify-center text-[10px] font-mono text-stone-400 shadow-sm transition-all cursor-default"
              >
                <span>{partner}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION: INVESTOR-GRADE CTA BANNER */}
        {/* ========================================================= */}
        <section className="rounded-[28px] sm:rounded-[36px] bg-gradient-to-b from-[#14151f] to-[#0c0d14] border border-white/10 p-7 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-radial from-[#d7f837]/15 to-transparent blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="px-3 py-1 rounded-full bg-[#d7f837]/10 border border-[#d7f837]/20 text-[#d7f837] text-xs font-mono font-bold">
              Ready for Deployment
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Bring Modern Attendance Infrastructure to Your Faculty.
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Join forward-thinking lecturers, deans, and exam officers transforming lecture halls with zero proxies and instant 75% exam clearance.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10 pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2.5 bg-[#d7f837] hover:bg-[#cbf028] text-black text-sm font-extrabold px-6 py-3 rounded-full transition-all shadow-[0_0_25px_rgba(215,248,55,0.25)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Create Free Lecturer Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 text-sm font-semibold px-6 py-3 rounded-full transition-all"
            >
              <span>Sign In to Workspace</span>
            </Link>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FOOTER */}
        {/* ========================================================= */}
        <footer className="pt-10 pb-8 border-t border-white/[0.08] space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
            
            {/* Col 1: Brand */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold text-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-white text-base tracking-tight">
                  CLASSMARK
                </span>
              </div>
              <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
                Production-grade university attendance infrastructure. Designed for Nigerian universities and tertiary institutions.
              </p>
              <div className="pt-1 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>NUC Senate Accreditation Framework Ready</span>
              </div>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-2">
              <div className="font-bold text-white uppercase text-[11px] tracking-wider">
                Product
              </div>
              <ul className="space-y-1.5 text-stone-400">
                <li>
                  <a href="#cockpit" className="hover:text-white transition-colors">
                    Live QR Projector
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Universal Roster Ingest
                  </a>
                </li>
                <li>
                  <a href="#security" className="hover:text-white transition-colors">
                    Device-Lock Shield
                  </a>
                </li>
                <li>
                  <a href="#cockpit" className="hover:text-white transition-colors">
                    Senate 75% Matrix
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Lecturers */}
            <div className="space-y-2">
              <div className="font-bold text-white uppercase text-[11px] tracking-wider">
                Lecturers
              </div>
              <ul className="space-y-1.5 text-stone-400">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Workspace Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link to="/reset-password" className="hover:text-white transition-colors">
                    Password Reset
                  </Link>
                </li>
                <li>
                  <a href="#workflow" className="hover:text-white transition-colors">
                    Lecturer Flow Guide
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Governance (Clickable Modals) */}
            <div className="space-y-2">
              <div className="font-bold text-white uppercase text-[11px] tracking-wider">
                Governance
              </div>
              <ul className="space-y-1.5 text-stone-400">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("nuc")}
                    className="hover:text-[#d7f837] text-left transition-colors cursor-pointer"
                  >
                    NUC Guidelines
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("exam")}
                    className="hover:text-[#d7f837] text-left transition-colors cursor-pointer"
                  >
                    Exam Clearance
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("audit")}
                    className="hover:text-[#d7f837] text-left transition-colors cursor-pointer"
                  >
                    Accreditation Audits
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("security")}
                    className="hover:text-[#d7f837] text-left transition-colors cursor-pointer"
                  >
                    Device Security Specs
                  </button>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500 font-mono">
            <div>
              © 2026 ClassMark Attendance Platform. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveModal("privacy")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("terms")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("integrity")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Academic Integrity
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* ========================================================= */}
      {/* MODAL DIALOGS */}
      {/* ========================================================= */}
      {activeModal && modalContents[activeModal] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative w-full max-w-lg bg-[#0e0f16] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex items-start justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {modalContents[activeModal].title}
                </h3>
                <p className="text-xs text-stone-400 font-medium mt-0.5">
                  {modalContents[activeModal].subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-stone-300 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-1">
              {modalContents[activeModal].content}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-[#d7f837] hover:bg-[#cbf028] text-black text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MOBILE DRAWER */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={closeMenu}
          />
          <div className="relative ml-auto w-80 max-w-[85vw] bg-[#0c0d14] border-l border-white/10 shadow-2xl flex flex-col h-full z-10 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold text-xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <span className="font-extrabold text-white text-sm">
                  CLASSMARK
                </span>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-300 cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <Link
                to="/login"
                onClick={closeMenu}
                className="w-full py-2.5 px-4 rounded-xl bg-[#d7f837] text-black text-xs font-extrabold text-center flex items-center justify-center gap-2 shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-stone-200 text-xs font-semibold text-center flex items-center justify-center gap-2 hover:bg-white/10"
              >
                <UserPlus className="w-4 h-4 text-[#d7f837]" />
                <span>Create Free Account</span>
              </Link>
            </div>

            <nav className="flex-1 space-y-3 text-sm font-medium text-stone-300 pt-2">
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold px-3">
                  Platform
                </div>
                <a
                  href="#cockpit"
                  onClick={() => {
                    closeMenu();
                    setActiveTab("projector");
                  }}
                  className="block px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Live QR Cockpit
                </a>
                <a
                  href="#security"
                  onClick={closeMenu}
                  className="block px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Device-Lock Shield
                </a>
                <a
                  href="#features"
                  onClick={closeMenu}
                  className="block px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Universal Roster Ingest
                </a>
              </div>

              <div className="space-y-1 pt-2 border-t border-white/[0.06]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold px-3">
                  Governance
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    setActiveModal("nuc");
                  }}
                  className="block w-full text-left px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-stone-300 cursor-pointer"
                >
                  NUC Guidelines
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    setActiveModal("exam");
                  }}
                  className="block w-full text-left px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-stone-300 cursor-pointer"
                >
                  Exam Clearance
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    setActiveModal("audit");
                  }}
                  className="block w-full text-left px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-stone-300 cursor-pointer"
                >
                  Accreditation Audit
                </button>
              </div>

              <div className="pt-2 border-t border-white/[0.06]">
                <a
                  href="#workflow"
                  onClick={closeMenu}
                  className="block px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  4-Step Workflow
                </a>
              </div>
            </nav>

            <div className="text-[11px] font-mono text-stone-500 pt-4 border-t border-white/[0.08]">
              v2.4 Production Academic Portal
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
