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
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Interactive Live Demo Cockpit State
  const [demoTab, setDemoTab] = useState<"projector" | "clearance" | "audit">("projector");
  const [demoVerifiedCount, setDemoVerifiedCount] = useState(384);
  const [demoTimeLeft, setDemoTimeLeft] = useState("04:38");

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

  // Handle ESC key to close mobile menu or modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setActiveModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Subtle live ticker effect for the demo cockpit
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoVerifiedCount((prev) => (prev < 408 ? prev + 1 : 384));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  const features = [
    {
      code: "A01",
      title: "Universal Roster File Ingestion",
      tagline: "Excel, CSV, Word & PDF roster parsing with zero data loss",
      description:
        "Directly import student rosters from Excel (.xlsx), CSV, Word (.docx), and PDF documents. Preserves leading zeros in matriculation numbers (e.g., 004128) and handles variable header columns automatically.",
      badge: "Universal Roster Engine",
      stat: "100% Leading-Zero Integrity",
      highlights: ["Automatic header detection", "Preserves 00XXXX matric prefixes", "Supports messy department rosters"],
    },
    {
      code: "A02",
      title: "Dynamic In-Class QR Check-In",
      tagline: "Live session QR projected in class with randomized PIN & OTP",
      description:
        "Project a high-contrast dynamic session QR code onto the lecture hall screen. Students scan with their phone and verify in 3 seconds. Randomized in-class PIN prevents remote WhatsApp sharing.",
      badge: "Zero Proxy Technology",
      stat: "90s Hall Sign-in Speed",
      highlights: ["Randomized 4-digit hall PIN", "Live in-hall attendance counter", "Zero app download required for students"],
    },
    {
      code: "A03",
      title: "Hardware Device-Locking Defense",
      tagline: "Physical device fingerprint binding exclusively to matric numbers",
      description:
        "Each student's physical phone hardware fingerprint is cryptographically locked to their matriculation number upon first scan. One smartphone cannot sign in for another student under any circumstance.",
      badge: "Hardware-Level Shield",
      stat: "1 Device Per Student",
      highlights: ["Cryptographic device UUID binding", "Permanent proxy lockout", "Automatic tampering audit flags"],
    },
    {
      code: "A04",
      title: "NUC 75% Senate Reports & Exports",
      tagline: "Automated 75% threshold alerts, attendance matrix & PDF export",
      description:
        "Automatic computation of cumulative attendance percentages per student against the 75% examination clearance requirement. Export official multi-sheet Excel matrices and sealed PDF rosters with 1 click.",
      badge: "Accreditation Ready",
      stat: "One-Click Instant Export",
      highlights: ["Instant cleared vs barred rosters", "Signed Senate-format PDF registers", "Multi-sheet Excel matrices"],
    },
  ];

  const testimonials = [
    {
      headline: "400 students signed in under 90 seconds without chaotic paper sheets.",
      quote:
        "With ClassMark, our lecture hall of 400 engineering students is signed in within 90 seconds. We eliminated proxy signing entirely, and our semester examination clearance roster is ready before exams start.",
      name: "Dr. Chioma Adebayo",
      role: "Senior Lecturer & Faculty Exam Officer",
      institution: "Faculty of Computing & Information Science",
      avatar: "/images/landing/chioma-portrait.jpg",
    },
    {
      headline: "Proxy attendance eliminated across all faculties. Fully NUC-audited.",
      quote:
        "The hardware device locking coupled with random physical in-class PINs completely solved student proxy fraud. Our department now possesses immutable, verified attendance ledgers for Senate and NUC accreditation.",
      name: "Prof. Babatunde Alabi",
      role: "Head of Academic Planning & Quality Assurance",
      institution: "Directorate of Academic Affairs",
      avatar: "/images/landing/dean-portrait.jpg",
    },
    {
      headline: "Preserved every leading zero in our 2,500-student university roster.",
      quote:
        "Previous software corrupted matriculation numbers starting with '00'. ClassMark imported our messy departmental Excel and Word rosters flawlessly with zero data loss or manual retyping.",
      name: "Dr. David Ejembi",
      role: "Dean of Faculty & Academic Board Member",
      institution: "College of Applied Sciences",
      avatar: "/images/landing/portrait-female.jpg",
    },
  ];

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
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <p>
            Under Nigerian National Universities Commission (NUC) academic guidelines, candidates are required to attain a minimum of <strong>70% to 75% lecture and laboratory attendance</strong> to be cleared for semester examinations.
          </p>
          <div className="p-4 rounded-2xl bg-[#edebe4] border border-black/[0.04] space-y-2">
            <h5 className="font-bold text-[#111111] flex items-center gap-2">
              <Award className="w-4 h-4 text-stone-800" />
              Compliance Verification Criteria:
            </h5>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>Verified student attendance logs recorded per academic session.</li>
              <li>Complete date, time, and session duration tracking.</li>
              <li>Tamper-proof audit logs preventing retroactive proxy entries.</li>
              <li>Exportable official semester attendance matrix in Excel and signed PDF formats.</li>
            </ul>
          </div>
          <p>
            ClassMark automatically enforces these criteria, computing semester percentage rankings and flagging below-threshold students before examination clearance slips are printed.
          </p>
        </div>
      ),
    },
    exam: {
      title: "Semester Examination Clearance Engine",
      subtitle: "Automated Candidate Validation & Exam Hall Slips",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <p>
            ClassMark eliminates the chaotic manual tallying of attendance sign-in sheets before final semester examinations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/60">
              <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Eligible Candidates (≥ 75%)
              </span>
              <p className="text-xs text-emerald-700 mt-1">Automatic clearance status with digital verification stamps and printable hall passes.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/60">
              <span className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Barred Candidates (&lt; 75%)
              </span>
              <p className="text-xs text-rose-700 mt-1">Instant notification with complete breakdown of missed lectures and deficit calculations.</p>
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
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <p>
            Every attendance session generated on ClassMark produces a cryptographically validated session ledger with ISO 8601 timestamps, lecturer credentials, and verified student check-in metadata.
          </p>
          <div className="p-4 rounded-2xl bg-[#edebe4] border border-black/[0.04] space-y-2 text-xs font-mono text-stone-800">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>GEO & Session IP Range Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unique Device Hardware Hash (UUID) Binding</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Single Check-In Per Physical Smartphone</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
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
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <p>
            Traditional paper sheets and static QR codes suffer from widespread proxy signing, where absent students share links via WhatsApp or peer sign-ins.
          </p>
          <p className="font-semibold text-stone-900">
            ClassMark&apos;s 3-Layer Defense:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-stone-600">
            <li><strong>Hardware Fingerprinting:</strong> Each student&apos;s device is cryptographically bound to their matriculation number upon first scan. One phone cannot check in for another student.</li>
            <li><strong>Dynamic In-Class PIN:</strong> The lecturer announces or displays a randomized 4-digit code in the classroom that expires when the session ends.</li>
            <li><strong>Session Expiry Windows:</strong> Sessions automatically close when the lecture concludes, stopping late proxy submissions.</li>
          </ol>
        </div>
      ),
    },
    privacy: {
      title: "Data Privacy & Institutional Protection",
      subtitle: "Student & Faculty Data Confidentiality Policy",
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
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
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
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
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
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
    <div className="min-h-screen bg-[#faf9f5] text-[#161616] font-sans antialiased selection:bg-[#d7f837] selection:text-black">
      {/* Outer Padding Container strictly bounded to 1200px max width */}
      <div className="max-w-[1200px] mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
        
        {/* ========================================================= */}
        {/* HERO CARD CONTAINER (Warm Stone Framed Architecture) */}
        {/* ========================================================= */}
        <section className="bg-[#edebe4] rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] border border-black/[0.05] p-5 sm:p-7 lg:p-10 relative overflow-hidden shadow-xs">
          
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-gradient-to-br from-[#d7f837]/25 via-emerald-200/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] bg-gradient-to-tr from-stone-300/40 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Top Embedded Navbar inside Hero Card */}
          <header className="relative z-10 flex items-center justify-between pb-6 sm:pb-8 border-b border-black/[0.06]">
            {/* Left: Navigation links */}
            <nav className="hidden lg:flex items-center gap-6 text-[12px] font-semibold tracking-wider uppercase text-stone-600">
              <a href="#features" className="hover:text-black transition-colors">
                Capabilities
              </a>
              <a href="#cockpit-demo" className="hover:text-black transition-colors">
                Live Simulator
              </a>
              <a href="#security" className="hover:text-black transition-colors">
                Anti-Proxy Shield
              </a>
              <a href="#workflow" className="hover:text-black transition-colors">
                Workflow
              </a>
              <button
                type="button"
                onClick={() => setActiveModal("nuc")}
                className="hover:text-black transition-colors cursor-pointer uppercase tracking-wider text-[12px] font-semibold text-stone-600 flex items-center gap-1.5"
              >
                <span>NUC Standard</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              </button>
            </nav>

            {/* Center: Brand Name Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                <GraduationCap className="w-4 h-4 text-[#d7f837]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#111111] tracking-tight text-lg sm:text-xl">
                  CLASSMARK
                </span>
                <span className="w-2 h-2 rounded-full bg-[#d7f837]"></span>
              </div>
            </Link>

            {/* Right: Action Pill Buttons & Mobile Menu Trigger */}
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 bg-white hover:bg-stone-50 border border-black/10 active:scale-95 text-stone-800 text-xs font-bold px-4 py-2 rounded-full transition-all shadow-2xs"
              >
                <span>Sign In</span>
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 bg-[#d7f837] hover:bg-[#c9ea28] active:scale-95 text-black text-xs font-bold px-4 py-2 sm:px-4 sm:py-2 rounded-full transition-all shadow-xs"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-black/5 flex items-center justify-center text-stone-800 transition-colors cursor-pointer shadow-2xs lg:hidden"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* Hero Content: 2-Column Split */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center pt-6 sm:pt-8 lg:pt-10">
            
            {/* Left Column: Investor Value Prop & Headline */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              
              {/* Institutional Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-black/[0.08] text-[11px] font-semibold text-stone-800 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-[#111111]">NUC-Compliant Architecture</span>
                <span className="text-stone-400">·</span>
                <span className="text-stone-600">Zero Proxy Fraud</span>
              </div>

              {/* Pitch-Grade Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight text-[#111111] leading-[1.08]">
                The Zero-Proxy University <br className="hidden sm:inline" />
                Attendance Infrastructure.
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm lg:text-[15px] text-stone-600 max-w-xl leading-relaxed font-normal">
                Replace chaotic paper sign-ins with 90-second dynamic QR verification. Hardware device locking permanently stops proxy attendance, while automated 75% examination clearance matrices eliminate weeks of manual departmental audits.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-3 bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-semibold pl-5 pr-2.5 py-2.5 rounded-full shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <span>Launch Lecturer Workspace</span>
                  <span className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-xs">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full border border-black/10 hover:border-black/20 shadow-2xs transition-all"
                >
                  <UserPlus className="w-4 h-4 text-stone-600" />
                  <span>Create Account</span>
                </Link>
              </div>

              {/* Institutional Traction Bar */}
              <div className="pt-4 border-t border-black/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3 text-stone-700">
                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-extrabold text-[#111111] tracking-tight">
                    90s
                  </div>
                  <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                    Hall Check-In Speed
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-extrabold text-[#111111] tracking-tight">
                    0%
                  </div>
                  <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                    Proxy Tolerance
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-extrabold text-[#111111] tracking-tight">
                    100%
                  </div>
                  <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                    Leading-Zero Fidelity
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-extrabold text-[#111111] tracking-tight">
                    75%
                  </div>
                  <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                    NUC Exam Threshold
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Live Interactive Lecturer Cockpit Demo */}
            <div id="cockpit-demo" className="lg:col-span-5 relative">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-black/[0.08] shadow-xl">
                
                {/* Cockpit Window Top Bar */}
                <div className="px-4 py-3 bg-[#111111] text-white flex items-center justify-between border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-mono text-stone-300 ml-2 font-bold">
                      PROJECTOR COCKPIT
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-800 text-[10px] font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>LIVE</span>
                  </div>
                </div>

                {/* Course Bar */}
                <div className="px-4 py-2.5 bg-[#f5f4ee] border-b border-black/[0.06] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-[#111111]">CSC 201</span>
                    <span className="text-stone-500 font-medium ml-1.5 hidden sm:inline">Data Structures & Algos</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-stone-600">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{demoTimeLeft}</span>
                  </div>
                </div>

                {/* Cockpit Interactive Mode Tabs */}
                <div className="px-3 pt-2 pb-1 bg-stone-50 border-b border-black/[0.05] flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDemoTab("projector")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      demoTab === "projector"
                        ? "bg-white text-black shadow-2xs border border-black/10"
                        : "text-stone-600 hover:text-black"
                    }`}
                  >
                    Dynamic QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoTab("clearance")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      demoTab === "clearance"
                        ? "bg-white text-black shadow-2xs border border-black/10"
                        : "text-stone-600 hover:text-black"
                    }`}
                  >
                    75% Exam Clearance
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoTab("audit")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      demoTab === "audit"
                        ? "bg-white text-black shadow-2xs border border-black/10"
                        : "text-stone-600 hover:text-black"
                    }`}
                  >
                    Audit Ledger
                  </button>
                </div>

                {/* Cockpit Interactive Content */}
                <div className="p-4 sm:p-5">
                  {demoTab === "projector" && (
                    <div className="space-y-4">
                      {/* Dynamic In-Class QR Graphic with Hall PIN */}
                      <div className="flex items-center gap-4 bg-[#edebe4] p-3.5 rounded-2xl border border-black/[0.05]">
                        <div className="w-24 h-24 bg-white p-2 rounded-xl border border-black/10 flex items-center justify-center shrink-0 shadow-2xs relative">
                          <QrCode className="w-full h-full text-[#111111]" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="w-5 h-5 rounded-md bg-[#d7f837] text-black text-[9px] font-black flex items-center justify-center border border-black/20 shadow-2xs">
                              CM
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 flex-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                            Classroom Projector Code
                          </div>
                          <div className="text-xs font-semibold text-stone-700">
                            Random in-class security PIN:
                          </div>
                          <div className="inline-block px-3 py-1 bg-black text-[#d7f837] rounded-lg font-mono font-black text-sm tracking-widest shadow-2xs">
                            PIN: 8492
                          </div>
                          <div className="text-[10px] text-stone-500">
                            Refreshes when session concludes
                          </div>
                        </div>
                      </div>

                      {/* Live Ticker Progress */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5 text-stone-800">
                            <Users className="w-3.5 h-3.5 text-stone-500" />
                            <span>Auditorium Attendance</span>
                          </span>
                          <span className="text-emerald-700 font-mono">
                            {demoVerifiedCount} / 412 Verified (93%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${(demoVerifiedCount / 412) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Live In-Class Stream */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          Live In-Hall Device Handshakes:
                        </div>
                        <div className="space-y-1 text-[11px] font-mono text-stone-700">
                          <div className="p-1.5 rounded-lg bg-stone-50 border border-black/[0.04] flex items-center justify-between">
                            <span className="font-bold text-[#111111]">001429 · Adebayo K.</span>
                            <span className="text-emerald-600 text-[10px] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Hardware locked
                            </span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-stone-50 border border-black/[0.04] flex items-center justify-between">
                            <span className="font-bold text-[#111111]">001580 · Okafor C.</span>
                            <span className="text-emerald-600 text-[10px] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Hardware locked
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {demoTab === "clearance" && (
                    <div className="space-y-3">
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-amber-900 flex items-center justify-between">
                        <span className="font-semibold">NUC Minimum Requirement:</span>
                        <span className="font-bold">≥ 75% Total Lectures</span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="p-2 rounded-xl bg-stone-50 border border-black/[0.04] flex items-center justify-between">
                          <div>
                            <div className="font-bold text-stone-900">001429 · Adebayo Kehinde</div>
                            <div className="text-[10px] text-stone-500">22 of 24 sessions attended</div>
                          </div>
                          <div className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            91.7% · CLEARED ✓
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-stone-50 border border-black/[0.04] flex items-center justify-between">
                          <div>
                            <div className="font-bold text-stone-900">001580 · Okafor Chinedu</div>
                            <div className="text-[10px] text-stone-500">19 of 24 sessions attended</div>
                          </div>
                          <div className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            79.2% · CLEARED ✓
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-stone-50 border border-black/[0.04] flex items-center justify-between">
                          <div>
                            <div className="font-bold text-stone-900">001602 · Danjuma Musa</div>
                            <div className="text-[10px] text-stone-500">13 of 24 sessions attended</div>
                          </div>
                          <div className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                            54.1% · BARRED ✕
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveModal("exam")}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-black text-white text-[11px] font-bold text-center flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#d7f837]" />
                          <span>Senate PDF Roster</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveModal("nuc")}
                          className="py-1.5 px-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center gap-1 border border-black/5 cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-stone-500" />
                          <span>Excel</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {demoTab === "audit" && (
                    <div className="space-y-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-stone-100 text-stone-700 text-[11px] space-y-1 font-mono">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Session ID:</span>
                          <span className="font-bold text-stone-900">SESS-2026-CSC201-08</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Hardware Cipher:</span>
                          <span className="font-bold text-emerald-700">AES-256-GCM / SHA256</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Duplicate Devices:</span>
                          <span className="font-bold text-emerald-700">0 (Blocked)</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <div className="p-2 rounded-lg bg-stone-50 border border-black/[0.04] space-y-0.5">
                          <div className="font-bold text-stone-900">Lecturer Manual Override Recorded</div>
                          <div className="text-[10px] text-stone-500">
                            Student 001389 marked present: &quot;Medical admission slip approved by Clinic&quot;
                          </div>
                          <div className="text-[9px] font-mono text-stone-400">Timestamp: 2026-10-18 10:14:02 GMT+1</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveModal("audit")}
                        className="w-full py-1.5 rounded-lg bg-[#edebe4] hover:bg-[#e4e2db] text-stone-800 text-[11px] font-bold text-center transition-colors cursor-pointer"
                      >
                        View Full Accreditation Framework →
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Strip */}
                <div className="px-4 py-2 bg-stone-50 border-t border-black/[0.06] flex items-center justify-between text-[10px] text-stone-500 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cryptographic Device Binding</span>
                  </span>
                  <span>100% Audit Precision</span>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: INVESTOR PROBLEM VS SOLUTION COMPARISON */}
        {/* ========================================================= */}
        <section className="py-6 sm:py-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500">
              The Enterprise Opportunity
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
              Why Paper Sign-In Sheets Fail Universities
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Traditional paper registers drain teaching hours, enable massive proxy fraud, and trigger accreditation risks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            
            {/* The Old Reality: Paper Sheets */}
            <div className="bg-white p-5 sm:p-7 rounded-[24px] sm:rounded-[28px] border border-rose-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Traditional Paper Registers
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  Compromised Integrity
                </span>
              </div>

              <ul className="space-y-3 text-xs sm:text-[13px] text-stone-700">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✕</span>
                  <div>
                    <strong>20 to 30 minutes lost per lecture</strong> circulating paper sheets through tiered 400-seat lecture halls.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✕</span>
                  <div>
                    <strong>Up to 45% proxy attendance rate</strong> with students signing for absent peers or sharing codes on WhatsApp.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✕</span>
                  <div>
                    <strong>Lost, damaged, or spilled-on rosters</strong> with no audit trail or cryptographic recovery.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✕</span>
                  <div>
                    <strong>Weeks of grueling manual Excel tallying</strong> by exam officers trying to calculate the 75% exam clearance threshold.
                  </div>
                </li>
              </ul>
            </div>

            {/* The ClassMark Standard */}
            <div className="bg-[#edebe4] p-5 sm:p-7 rounded-[24px] sm:rounded-[28px] border border-black/[0.08] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  The ClassMark Standard
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#d7f837] text-black">
                  Zero Proxy Guaranteed
                </span>
              </div>

              <ul className="space-y-3 text-xs sm:text-[13px] text-stone-800">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                  <div>
                    <strong>90-second total hall sign-in</strong> with high-visibility dynamic QR projection and zero disruption to lecturing.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                  <div>
                    <strong>0% proxy attendance</strong> via hardware device binding (1 physical phone locks permanently to 1 matric number).
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                  <div>
                    <strong>100% leading-zero integrity</strong> supporting universal roster ingestion across Excel, CSV, Word, and PDF.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                  <div>
                    <strong>Instant 1-click Senate reports</strong> with official printable clearance rosters and multi-sheet semester matrices.
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: BENTO GRID CAPABILITIES */}
        {/* ========================================================= */}
        <section id="features" className="py-6 sm:py-10 space-y-6 sm:space-y-8 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
              Engineered for Modern University Scale
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Purpose-built for African higher education workflows, large lecture theatres, and strict Senate compliance.
            </p>
          </div>

          {/* 4-Card Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-stretch">
            
            {/* Bento Card 1: Universal Class List Import */}
            <div className="md:col-span-5 relative rounded-[24px] sm:rounded-[28px] overflow-hidden border border-black/[0.06] bg-stone-100 group shadow-xs min-h-[340px] sm:min-h-[400px] flex flex-col justify-end">
              <img
                src="/images/landing/students-lecture-phone.jpg"
                alt="Students in university lecture hall using smartphones for attendance"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              {/* Frosted Glass Floating Badge */}
              <div className="relative m-4 sm:m-5 p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 text-white shadow-lg space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold shadow-xs">
                    <UploadCloud className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide uppercase">
                    Universal Roster Ingestion
                  </span>
                </div>
                <p className="text-xs text-white/95 leading-relaxed font-medium">
                  Directly ingest student rosters from Excel (.xlsx), CSV, Word (.docx), and PDF. Preserves matriculation leading zeros (e.g. 004128) automatically.
                </p>
              </div>
            </div>

            {/* Bento Card 2 & 3: Middle Column Split */}
            <div className="md:col-span-4 flex flex-col gap-4 sm:gap-6 justify-between">
              
              {/* Top: Photo of Scholars collaborating */}
              <div className="relative rounded-[24px] sm:rounded-[28px] overflow-hidden border border-black/[0.06] bg-stone-100 shadow-xs aspect-[16/10] group">
                <img
                  src="/images/landing/students-classroom.jpg"
                  alt="University students collaborating with laptops in class"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d7f837]" />
                  <span>Verified Roster Verification</span>
                </div>
              </div>

              {/* Bottom: Vibrant Lime Card */}
              <div className="rounded-[24px] sm:rounded-[28px] bg-[#d7f837] p-5 sm:p-6 text-black flex flex-col justify-between shadow-xs border border-black/5 flex-1 min-h-[160px]">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold shadow-xs">
                  <Fingerprint className="w-4 h-4 text-[#d7f837]" />
                </div>
                <div className="space-y-1 pt-3">
                  <h3 className="font-extrabold text-base tracking-tight leading-tight">
                    Hardware Device-Locked Defense
                  </h3>
                  <p className="text-xs font-medium text-black/80 leading-snug">
                    One physical smartphone binds exclusively to one matriculation number. Zero proxy sign-ins possible.
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Right Card with Large Stat */}
            <div className="md:col-span-3 rounded-[24px] sm:rounded-[28px] bg-[#edebe4] p-5 sm:p-6 border border-black/[0.05] flex flex-col justify-between shadow-xs min-h-[340px] sm:min-h-[400px]">
              <div className="w-8 h-8 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold shadow-xs">
                <Award className="w-4 h-4" />
              </div>
              <div className="space-y-2 pt-6">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
                  75%
                </div>
                <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  NUC Senate Clearance
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Automatic candidate threshold alerts, barred roster generation, and sealed PDF registers.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal("nuc")}
                    className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read NUC Guidelines</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: STRAIGHTFORWARD 4-STEP LECTURER WORKFLOW */}
        {/* ========================================================= */}
        <section id="workflow" className="py-6 sm:py-8 space-y-6 scroll-mt-20">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-stone-400">
              Streamlined Architecture
            </h3>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
              4-Step Complete Lecturer Workflow
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-black/[0.05] shadow-xs space-y-2.5">
              <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#d7f837] text-black">
                Step 01
              </span>
              <h4 className="font-bold text-sm text-[#111111]">Create Course</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Specify course code, title, semester, and attendance threshold (defaults to 75% for NUC exams).
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-black/[0.05] shadow-xs space-y-2.5">
              <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#d7f837] text-black">
                Step 02
              </span>
              <h4 className="font-bold text-sm text-[#111111]">Import Class Roster</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Upload registered students via Excel (.xlsx), CSV, Word (.docx), or PDF with full matric zero preservation.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-black/[0.05] shadow-xs space-y-2.5">
              <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#d7f837] text-black">
                Step 03
              </span>
              <h4 className="font-bold text-sm text-[#111111]">Display In-Class QR</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Project dynamic session QR code with randomized in-class PIN. Students verify on their phones in 3 seconds.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-black/[0.05] shadow-xs space-y-2.5">
              <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#d7f837] text-black">
                Step 04
              </span>
              <h4 className="font-bold text-sm text-[#111111]">Export Senate Reports</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Download verified semester registers, attendance matrices, and exam clearance slips in Excel and PDF formats.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: DISCOVER CAPABILITIES SLIDER / DEEP DIVE */}
        {/* ========================================================= */}
        <section className="py-6 sm:py-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400">
                Operational Modules
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
                Institutional Feature Breakdown
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-stone-500 max-w-xs sm:text-right font-medium">
              Built specifically for university exam officers, lecturers, and departmental quality assurance.
            </div>
          </div>

          <div className="space-y-4">
            {/* Tab navigation pills */}
            <div className="flex flex-wrap items-center gap-2">
              {features.map((feat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveFeatureTab(idx)}
                  className={`text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer ${
                    activeFeatureTab === idx
                      ? "bg-[#111111] text-white shadow-xs"
                      : "bg-white text-stone-600 hover:bg-stone-100 border border-black/[0.05]"
                  }`}
                >
                  <span className="text-[#d7f837] mr-1.5">{feat.code}</span>
                  <span>{feat.title}</span>
                </button>
              ))}
            </div>

            {/* Feature Showcase Card */}
            <div className="relative rounded-[24px] sm:rounded-[32px] overflow-hidden bg-[#edebe4] border border-black/[0.05] p-5 sm:p-8 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                
                {/* Visual Image */}
                <div className="lg:col-span-7 relative rounded-2xl overflow-hidden bg-stone-100 shadow-sm">
                  <img
                    src="/images/landing/lecturer-hall.jpg"
                    alt={features[activeFeatureTab].title}
                    className="w-full h-auto aspect-[16/10] object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-bold text-stone-800 shadow-xs">
                      {features[activeFeatureTab].badge}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Module {features[activeFeatureTab].code}
                    </div>
                    <h3 className="text-lg sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                      {features[activeFeatureTab].title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                    {features[activeFeatureTab].description}
                  </p>

                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {features[activeFeatureTab].highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="p-3 rounded-xl bg-white/80 border border-black/[0.05] flex items-center justify-between text-xs font-bold text-stone-800">
                    <span>Performance Benchmark</span>
                    <span className="text-emerald-700 font-mono">
                      {features[activeFeatureTab].stat}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-xs"
                    >
                      <span>Explore In App</span>
                      <ArrowRight className="w-3 h-3 text-[#d7f837]" />
                    </Link>

                    {/* Pagination Arrows */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveFeatureTab((prev) => (prev > 0 ? prev - 1 : features.length - 1))
                        }
                        className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 border border-black/5 flex items-center justify-center text-stone-700 cursor-pointer shadow-2xs"
                        aria-label="Previous capability"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveFeatureTab((prev) => (prev < features.length - 1 ? prev + 1 : 0))
                        }
                        className="w-8 h-8 rounded-full bg-[#d7f837] hover:bg-[#cbf028] text-black flex items-center justify-center cursor-pointer shadow-2xs"
                        aria-label="Next capability"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 6: INSTITUTIONAL TESTIMONIALS & TRUST */}
        {/* ========================================================= */}
        <section id="security" className="py-6 sm:py-10 scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left side text */}
            <div className="lg:col-span-4 space-y-3">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400">
                Institutional Validation
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111] leading-tight">
                Trusted by University Academic Leadership
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                Adopted across computing, engineering, law, and medical faculties for audit-proof record integrity.
              </p>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveTestimonial((prev) =>
                      prev > 0 ? prev - 1 : testimonials.length - 1
                    )
                  }
                  className="w-9 h-9 rounded-full bg-white hover:bg-stone-100 border border-black/5 flex items-center justify-center text-stone-800 cursor-pointer shadow-2xs"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveTestimonial((prev) =>
                      prev < testimonials.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="w-9 h-9 rounded-full bg-[#d7f837] hover:bg-[#cbf028] text-black flex items-center justify-center cursor-pointer shadow-2xs"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right side testimonial card */}
            <div className="lg:col-span-8 bg-[#edebe4] rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 border border-black/[0.05] shadow-xs space-y-5">
              <div className="space-y-2">
                <h3 className="font-extrabold text-base sm:text-lg text-[#111111] tracking-tight">
                  “{testimonials[activeTestimonial].headline}”
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                  {testimonials[activeTestimonial].quote}
                </p>
              </div>

              {/* Author row */}
              <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={testimonials[activeTestimonial].avatar}
                    alt={testimonials[activeTestimonial].name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
                  />
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#111111]">
                      {testimonials[activeTestimonial].name}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-medium">
                      {testimonials[activeTestimonial].role} · {testimonials[activeTestimonial].institution}
                    </p>
                  </div>
                </div>

                {/* Dots indicator */}
                <div className="flex items-center gap-1.5">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveTestimonial(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeTestimonial === idx
                          ? "w-6 bg-black"
                          : "w-2 bg-stone-300 hover:bg-stone-400"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 7: INSTITUTIONAL PARTNERS TICKER */}
        {/* ========================================================= */}
        <section className="py-2">
          <div className="text-center pb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Compatible with Academic Records from Leading Tertiary Institutions
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="bg-white hover:bg-stone-50 border border-black/[0.05] rounded-xl px-2.5 py-2.5 text-center flex items-center justify-center text-[10px] font-bold text-stone-600 shadow-2xs transition-all cursor-default"
              >
                <span>{partner}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 8: BOTTOM CTA BANNER */}
        {/* ========================================================= */}
        <section className="bg-[#edebe4] rounded-[24px] sm:rounded-[36px] p-5 sm:p-8 lg:p-10 border border-black/[0.05] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left: African university scholars working on computers */}
            <div className="lg:col-span-4 rounded-2xl overflow-hidden bg-[#d7f837] shadow-sm flex items-center justify-center">
              <img
                src="/images/landing/student-campus-lime.jpg"
                alt="University students working in campus computing laboratory"
                className="w-full h-auto aspect-square object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Right: Bold Call to Action Copy */}
            <div className="lg:col-span-8 space-y-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500">
                Institutional Modernization
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-extrabold tracking-tight text-[#111111] leading-tight">
                Modernize University Attendance with Institutional Precision.
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed font-medium">
                Eliminate proxy attendance, import your class lists in seconds, and automatically generate verified 75% examination clearance matrices for Senate accreditation.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-3 bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-semibold pl-5 pr-2.5 py-2.5 rounded-full shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <span>Start Free as a Lecturer</span>
                  <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-xs">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>

                <Link
                  to="/login"
                  className="w-10 h-10 rounded-2xl bg-[#d7f837] hover:bg-[#c9ea28] text-black flex items-center justify-center transition-all shadow-xs"
                  aria-label="Sign In to Lecturer Account"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 9: DEEP BLACK ACCENT FOOTER */}
        {/* ========================================================= */}
        <footer className="bg-[#0c0c0c] text-white rounded-[24px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 border border-stone-800 space-y-10">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-2 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold text-xs shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-white tracking-tight text-xl">
                  CLASSMARK
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
                Production-grade University Attendance Infrastructure. Purpose-built for African Universities and Tertiary Institutions.
              </p>
              <div className="pt-1 text-[11px] font-mono text-stone-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>NUC ACCREDITATION READY</span>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Capabilities
              </h5>
              <ul className="space-y-2 text-xs text-stone-400 font-medium">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Universal Roster Ingestion
                  </a>
                </li>
                <li>
                  <a href="#cockpit-demo" className="hover:text-white transition-colors">
                    Dynamic QR Check-in
                  </a>
                </li>
                <li>
                  <a href="#security" className="hover:text-white transition-colors">
                    Hardware Device Binding
                  </a>
                </li>
                <li>
                  <a href="#workflow" className="hover:text-white transition-colors">
                    Senate 75% Matrix
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Lecturers
              </h5>
              <ul className="space-y-2 text-xs text-stone-400 font-medium">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Workspace Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Create Free Account
                  </Link>
                </li>
                <li>
                  <Link to="/reset-password" className="hover:text-white transition-colors">
                    Password Reset
                  </Link>
                </li>
                <li>
                  <a href="#workflow" className="hover:text-white transition-colors">
                    Lecturer Workflow Guide
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Institutional (All clickable modals) */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Governance
              </h5>
              <ul className="space-y-2 text-xs text-stone-400 font-medium">
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

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
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
      {/* INFORMATION MODAL OVERLAY */}
      {/* ========================================================= */}
      {activeModal && modalContents[activeModal] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative w-full max-w-lg bg-[#faf9f5] border border-black/10 rounded-[28px] shadow-2xl p-6 sm:p-8 z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-black/[0.06]">
              <div>
                <h3 className="text-lg font-extrabold text-[#111111] tracking-tight">
                  {modalContents[activeModal].title}
                </h3>
                <p className="text-xs text-stone-500 font-medium mt-0.5">
                  {modalContents[activeModal].subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 border border-black/5 flex items-center justify-center text-stone-700 cursor-pointer shadow-2xs"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-1">
              {modalContents[activeModal].content}
            </div>

            <div className="pt-3 border-t border-black/[0.06] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NAVIGATION DRAWER OVERLAY */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={closeMenu}
          />
          <div className="relative ml-auto w-80 max-w-[85vw] bg-[#faf9f5] shadow-2xl flex flex-col h-full z-10 p-6 space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                  <GraduationCap className="w-3.5 h-3.5 text-[#d7f837]" />
                </div>
                <span className="font-extrabold text-stone-900 text-sm tracking-tight">
                  CLASSMARK
                </span>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 border border-black/5 flex items-center justify-center text-stone-700 cursor-pointer transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <Link
                to="/login"
                onClick={closeMenu}
                className="w-full py-3 px-4 rounded-full bg-[#111111] text-white text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs"
              >
                <LogIn className="w-4 h-4 text-[#d7f837]" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="w-full py-2.5 px-4 rounded-full bg-[#d7f837] text-black text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Free Account</span>
              </Link>
            </div>

            <nav className="flex-1 space-y-2 text-sm font-semibold text-stone-700 pt-2">
              <a
                href="#features"
                onClick={closeMenu}
                className="block px-3 py-2 rounded-xl hover:bg-stone-200/60 transition-colors"
              >
                Capabilities
              </a>
              <a
                href="#cockpit-demo"
                onClick={closeMenu}
                className="block px-3 py-2 rounded-xl hover:bg-stone-200/60 transition-colors"
              >
                Live Simulator
              </a>
              <a
                href="#security"
                onClick={closeMenu}
                className="block px-3 py-2 rounded-xl hover:bg-stone-200/60 transition-colors"
              >
                Anti-Proxy Security
              </a>
              <a
                href="#workflow"
                onClick={closeMenu}
                className="block px-3 py-2 rounded-xl hover:bg-stone-200/60 transition-colors"
              >
                4-Step Process
              </a>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  setActiveModal("nuc");
                }}
                className="block w-full text-left px-3 py-2 rounded-xl hover:bg-stone-200/60 transition-colors text-sm font-semibold text-stone-700 cursor-pointer"
              >
                NUC Standards
              </button>
            </nav>

            <div className="text-[11px] text-stone-500 pt-4 border-t border-black/[0.06]">
              Confidential University Academic Portal.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
