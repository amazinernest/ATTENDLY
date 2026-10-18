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

  // Auto-close menu when viewport is resized to desktop width (lg: 1024px+)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setMobileMenuOpen(false);
      }
    };
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  const features = [
    {
      code: "A01",
      title: "Class List File Import",
      tagline: "Excel, CSV, Word & PDF roster parsing with zero data loss",
      description:
        "Directly import student rosters from Excel (.xlsx), CSV, Word (.docx), and PDF files. Preserves leading zeros in matriculation numbers and eliminates manual data entry.",
      badge: "Universal Roster Engine",
      stat: "100% Leading-Zero Integrity",
    },
    {
      code: "A02",
      title: "Dynamic In-Class QR Check-In",
      tagline: "Live session QR projected in class with randomized PIN & OTP",
      description:
        "Project a large dynamic session QR code in class. Students verify with their matriculation number and configured PIN or institutional email verification to eliminate proxy attendance.",
      badge: "Zero Proxy Technology",
      stat: "90s Hall Sign-in Speed",
    },
    {
      code: "A03",
      title: "Hardware Device-Locking Defense",
      tagline: "Physical device fingerprint binding exclusively to matric numbers",
      description:
        "Each student's phone hardware fingerprint binds exclusively to their matric number. One physical device cannot sign in for another student, permanently stopping lecture proxies.",
      badge: "Hardware-Level Shield",
      stat: "1 Device Per Student",
    },
    {
      code: "A04",
      title: "Semester Reports & Exports",
      tagline: "Automated 75% threshold alerts, attendance matrix & PDF export",
      description:
        "Automatic calculation of attendance percentage per student, threshold alerts (e.g., 75%), session attendance matrix, and one-click export to official Excel and PDF documents.",
      badge: "Accreditation Ready",
      stat: "One-Click Instant Export",
    },
  ];

  const testimonials = [
    {
      headline: "Security and convenience really work together.",
      quote:
        "With ClassMark, our lecture hall of 400 students is signed in within 90 seconds without chaotic paper sheets, and our exam clearance lists are generated instantly.",
      name: "Dr. Chioma Adebayo",
      role: "Senior Lecturer & Exam Officer, Computer Science",
      institution: "Faculty of Science & Computing",
      avatar: "/images/landing/chioma-portrait.jpg",
    },
    {
      headline: "Proxy attendance eliminated across all faculties.",
      quote:
        "The hardware device locking coupled with random physical in-class PINs completely solved attendance fraud. We now have 100% audited records for our NUC accreditation.",
      name: "Prof. Babatunde Alabi",
      role: "Head of Academic Planning",
      institution: "Directorate of Academic Affairs",
      avatar: "/images/landing/dean-portrait.jpg",
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
          <div className="p-3.5 rounded-xl bg-[#edebe4] space-y-2">
            <h5 className="font-bold text-[#111111]">Compliance Verification Criteria:</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>Verified student attendance logs recorded per academic session.</li>
              <li>Complete date, time, and session duration tracking.</li>
              <li>Tamper-proof audit logs preventing retroactive proxy entries.</li>
              <li>Exportable official semester attendance matrix in Excel and signed PDF formats.</li>
            </ul>
          </div>
          <p>
            ClassMark automatically enforces these criteria, computing semester percentage rankings and flagging below-threshold students before examination clearance.
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
            ClassMark eliminates the chaotic manual tallying of attendance sign-in sheets before final exams.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white border border-black/10">
              <span className="font-bold text-emerald-800 text-xs">Eligible Candidates (≥ 75%)</span>
              <p className="text-xs text-stone-600 mt-1">Automatic clearance status with digital verification stamps.</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-black/10">
              <span className="font-bold text-rose-800 text-xs">Barred Candidates (&lt; 75%)</span>
              <p className="text-xs text-stone-600 mt-1">Instant notification with complete breakdown of missed lectures.</p>
            </div>
          </div>
          <p>
            Department exam officers can generate printable official clearance rosters with a single click.
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
          <div className="p-3.5 rounded-xl bg-[#edebe4] space-y-1.5 text-xs font-mono">
            <div>• GEO/IP Range Verification</div>
            <div>• Unique Device Hardware Hash (UUID)</div>
            <div>• Single Check-In Per Hardware Token</div>
            <div>• Exportable Audit Log for Senate Accreditation</div>
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
          <p>
            <strong>ClassMark&apos;s 3-Layer Defense:</strong>
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>Hardware Fingerprinting:</strong> Each student&apos;s device is cryptographically bound to their matriculation number upon first scan. One phone cannot check in for another student.</li>
            <li><strong>Dynamic In-Class PIN:</strong> The lecturer announces a randomized 4-digit code in the classroom that expires when the session ends.</li>
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
      {/* Outer Padding Container matching the high-end framed layout */}
      <div className="max-w-[1440px] mx-auto p-3 sm:p-5 lg:p-6 space-y-6 sm:space-y-8">
        
        {/* ========================================================= */}
        {/* HERO CARD CONTAINER (Warm Gray Framed Card with Rounded Corners) */}
        {/* ========================================================= */}
        <section className="bg-[#edebe4] rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] border border-black/[0.04] p-5 sm:p-8 lg:p-12 relative overflow-hidden shadow-xs">
          
          {/* Top Embedded Navbar inside Hero Card */}
          <header className="flex items-center justify-between pb-8 sm:pb-12 border-b border-black/[0.06]">
            {/* Left: Navigation links */}
            <nav className="hidden lg:flex items-center gap-7 text-[12px] font-semibold tracking-wider uppercase text-stone-600">
              <a href="#features" className="hover:text-black transition-colors">
                Features
              </a>
              <a href="#security" className="hover:text-black transition-colors">
                Security
              </a>
              <a href="#workflow" className="hover:text-black transition-colors">
                Workflow
              </a>
              <button
                type="button"
                onClick={() => setActiveModal("nuc")}
                className="hover:text-black transition-colors cursor-pointer uppercase tracking-wider text-[12px] font-semibold text-stone-600"
              >
                NUC Standards
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
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#111111] tracking-tight text-lg sm:text-xl">
                  CLASSMARK
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#d7f837]"></span>
              </div>
            </Link>

            {/* Right: Action Pill Buttons & Mobile Menu Trigger */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 bg-[#d7f837] hover:bg-[#c9ea28] active:scale-95 text-black text-xs font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-full transition-all shadow-xs"
              >
                <span>Sign In</span>
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white border border-black/5 flex items-center justify-center text-stone-800 transition-colors cursor-pointer shadow-2xs"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* Hero Content: 2-Column Split */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 lg:gap-12 items-center pt-6 sm:pt-10 lg:pt-14">
            
            {/* Left Column: Headline & Action CTAs */}
            <div className="md:col-span-7 space-y-5 sm:space-y-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.05] border border-black/[0.06] text-[11px] font-semibold uppercase tracking-wider text-stone-700">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                <span>Designed for Nigerian Universities and Tertiary Institutions</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-[#111111] leading-[1.06]">
                Your Academic Attendance <br className="hidden sm:inline" />
                Safe — Seamless and Secure
              </h1>

              <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed font-normal">
                Import class lists seamlessly, conduct secure QR-based lecture attendance, prevent proxy check-ins, and export verified semester reports in Excel and PDF formats.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-3 bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-semibold pl-5 pr-2.5 py-2.5 rounded-full shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Access Lecturer Workspace</span>
                  <span className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-xs">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-stone-800 text-xs sm:text-sm font-semibold px-5 py-3 rounded-full border border-black/5 hover:border-black/15 shadow-2xs transition-all"
                >
                  <UserPlus className="w-4 h-4 text-stone-600" />
                  <span>Create Account</span>
                </Link>
              </div>

              {/* Bottom indicators in hero */}
              <div className="pt-4 sm:pt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Dynamic QR Check-in
                </span>
                <span className="text-stone-300">/</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#111111]"></span>
                  Hardware Device Locking
                </span>
                <span className="text-stone-300">/</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d7f837]"></span>
                  Excel & PDF Exports
                </span>
              </div>
            </div>

            {/* Right Column: Hero Real Academic Lecture Hall Showcase */}
            <div className="md:col-span-5 relative">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-black/10 bg-stone-200">
                <img
                  src="/images/landing/hero-lecture-hall.jpg"
                  alt="Modern university lecture hall with tiered seating and presentation screen"
                  className="w-full h-auto aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                
                {/* Floating pill badge on lecture hall photo */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-white/60 text-xs font-semibold text-stone-900 shadow-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Lecture Session Active
                  </span>
                  <span className="text-[11px] font-mono text-stone-700 bg-stone-100 px-2 py-0.5 rounded font-bold">
                    CSC 401 · 240 ENROLLED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: BENTO GRID ("Welcome to a Smarter Way of Living") */}
        {/* ========================================================= */}
        <section id="features" className="py-8 sm:py-14 space-y-8 sm:space-y-12 scroll-mt-20">
          {/* Centered Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
              Welcome to a Smarter Way of Attendance
            </h2>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-stone-500">
              Engineered specifically for academic workflows, lecture halls, and departmental audits
            </p>
          </div>

          {/* 4-Card Bento Grid with Authentic Academic Images */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            
            {/* Bento Card 1: Students in lecture hall with phone */}
            <div className="md:col-span-5 relative rounded-[28px] sm:rounded-[32px] overflow-hidden border border-black/[0.06] bg-stone-100 group shadow-xs min-h-[380px] sm:min-h-[440px] h-full flex flex-col justify-end">
              <img
                src="/images/landing/students-lecture-phone.jpg"
                alt="Students in university lecture hall using smartphones for attendance"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              
              {/* Frosted Glass Floating Badge */}
              <div className="relative m-4 sm:m-6 p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 text-white shadow-lg space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold shadow-xs">
                    <UploadCloud className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide uppercase">
                    Universal Class List Import
                  </span>
                </div>
                <p className="text-xs text-white/95 leading-relaxed font-medium">
                  Directly import student rosters from Excel (.xlsx), CSV, Word (.docx), and PDF files. Preserves leading zeros in matriculation numbers.
                </p>
              </div>
            </div>

            {/* Bento Card 2 & 3: Middle Column Split */}
            <div className="md:col-span-4 flex flex-col gap-5 sm:gap-6 justify-between h-full">
              
              {/* Top: University Scholars collaborating in library/classroom */}
              <div className="relative rounded-[28px] sm:rounded-[32px] overflow-hidden border border-black/[0.06] bg-stone-100 shadow-xs aspect-[4/3] group">
                <img
                  src="/images/landing/students-classroom.jpg"
                  alt="University students collaborating with laptops in class"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium">
                  Verified Academic Roster
                </div>
              </div>

              {/* Bottom: Vibrant Lime Card matching screenshot */}
              <div className="rounded-[28px] sm:rounded-[32px] bg-[#d7f837] p-6 sm:p-7 text-black flex flex-col justify-between shadow-xs border border-black/5 flex-1 min-h-[170px]">
                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-[#d7f837]" />
                </div>
                <div className="space-y-1 pt-4">
                  <h3 className="font-extrabold text-base sm:text-lg tracking-tight leading-tight">
                    Zero Proxy Attendance
                  </h3>
                  <p className="text-xs font-medium text-black/80 leading-snug">
                    Hardware device-locked matriculation verification and physical classroom security.
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Right Card with Large Stat */}
            <div className="md:col-span-3 rounded-[28px] sm:rounded-[32px] bg-[#edebe4] p-6 sm:p-7 border border-black/[0.05] flex flex-col justify-between shadow-xs min-h-[380px] sm:min-h-[440px] h-full">
              <div className="w-9 h-9 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-2 pt-8 sm:pt-14">
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111111]">
                  99%
                </div>
                <p className="text-xs font-semibold text-stone-600 leading-relaxed">
                  Seamless integration with faculty exam clearance and department archives.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: KEYNOTE QUOTE & STATS BANNER */}
        {/* ========================================================= */}
        <section className="bg-[#f4f3ed] rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] p-6 sm:p-10 lg:p-14 border border-black/[0.05] shadow-xs space-y-8 sm:space-y-12">
          
          {/* Top Half: Dean Avatar + Testimonial Quote */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            {/* Left: Avatar & Info */}
            <div className="lg:col-span-3 flex lg:flex-col items-center lg:items-start gap-4">
              <img
                src="/images/landing/dean-portrait.jpg"
                alt="Dr. David Ejembi, Dean of Faculty"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-white shadow-md"
              />
              <div>
                <h4 className="font-extrabold text-stone-900 text-sm sm:text-base">
                  Dr. David Ejembi
                </h4>
                <p className="text-xs text-stone-500 font-medium">
                  Dean of Faculty / Lead Lecturer
                </p>
                <p className="text-[11px] text-stone-400 font-medium">
                  University Academic Board
                </p>
              </div>
            </div>

            {/* Right: Large Quote */}
            <div className="lg:col-span-9">
              <p className="text-base sm:text-xl lg:text-2xl font-normal text-stone-800 leading-snug tracking-tight">
                “The integration of anti-proxy verification into university lecture halls is revolutionizing institutional accountability. ClassMark not only eliminates proxy attendance but delivers effortless accreditation compliance.”
              </p>
            </div>
          </div>

          {/* Bottom Half: 4 White Rounded Stat Cards with Lime Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                  80M+
                </div>
                <div className="text-[11px] font-semibold text-stone-500">
                  Total student check-ins processed
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                  50+
                </div>
                <div className="text-[11px] font-semibold text-stone-500">
                  Academic departments & faculties
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                  100%
                </div>
                <div className="text-[11px] font-semibold text-stone-500">
                  Hardware device proxy prevention
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                  $120M+
                </div>
                <div className="text-[11px] font-semibold text-stone-500">
                  Institution hours saved annually
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: INSTITUTIONAL PARTNERS LOGO BAR */}
        {/* ========================================================= */}
        <section className="py-2 sm:py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="bg-white/80 hover:bg-white border border-black/[0.06] rounded-xl px-3 py-3 text-center flex items-center justify-center text-[11px] font-bold text-stone-600 shadow-2xs hover:border-black/20 transition-all cursor-default"
              >
                <span>{partner}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: DISCOVER CAPABILITIES SHOWCASE */}
        {/* ========================================================= */}
        <section id="workflow" className="py-8 sm:py-12 space-y-6 sm:space-y-8 scroll-mt-20">
          
          {/* Header Split */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
                Discover core academic attendance capabilities
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-stone-500 max-w-xs sm:text-right font-medium">
              Engineered specifically for academic workflows, lecture halls, and departmental audits.
            </div>
          </div>

          {/* Interactive Feature Slider / Tabs */}
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
            <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden bg-[#edebe4] border border-black/[0.05] p-6 sm:p-10 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Visual Image: Lecturer in front of lecture hall */}
                <div className="lg:col-span-7 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-100 shadow-md">
                  <img
                    src="/images/landing/lecturer-hall.jpg"
                    alt={features[activeFeatureTab].title}
                    className="w-full h-auto aspect-[16/9] object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-bold text-stone-800 shadow-xs">
                      {features[activeFeatureTab].badge}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="lg:col-span-5 space-y-4 sm:space-y-6">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Module {features[activeFeatureTab].code}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                      {features[activeFeatureTab].title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                    {features[activeFeatureTab].description}
                  </p>

                  <div className="p-3.5 rounded-xl bg-white/80 border border-black/[0.05] flex items-center justify-between text-xs font-bold text-stone-800">
                    <span>Performance Benchmark</span>
                    <span className="text-emerald-700 font-mono">
                      {features[activeFeatureTab].stat}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2.5 bg-[#111111] hover:bg-black text-white text-xs font-semibold pl-4 pr-2 py-2 rounded-full transition-all shadow-xs"
                    >
                      <span>Deploy Module</span>
                      <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-xs">
                        <ArrowRight className="w-3 h-3" />
                      </span>
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
        {/* SECTION 6: STRAIGHTFORWARD 4-STEP LECTURER WORKFLOW */}
        {/* ========================================================= */}
        <section className="py-6 sm:py-10 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-stone-400">
              Workflow Architecture
            </h3>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
              Straightforward 4-Step Lecturer Process
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-black/[0.05] shadow-xs space-y-3">
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#d7f837] text-black">
                Step 01
              </span>
              <h4 className="font-bold text-sm text-[#111111]">Create Course</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Specify course code, title, semester, and attendance threshold (e.g. 75%).
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-black/[0.05] shadow-xs space-y-3">
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#d7f837] text-black">
                Step 02
              </span>
              <h4 className="font-bold text-sm text-[#111111]">Import Class Roster</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Upload Excel (.xlsx), CSV, Word (.docx), or PDF list of registered students.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-black/[0.05] shadow-xs space-y-3">
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#d7f837] text-black">
                Step 03
              </span>
              <h4 className="font-bold text-sm text-[#111111]">Display Session QR</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Students scan dynamic QR in lecture hall and verify via phone fingerprint & PIN.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-black/[0.05] shadow-xs space-y-3">
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#d7f837] text-black">
                Step 04
              </span>
              <h4 className="font-bold text-sm text-[#111111]">Export Semester Report</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Download verified semester matrix and clearance reports in Excel and PDF formats.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 7: TESTIMONIALS ("Here's what people says") */}
        {/* ========================================================= */}
        <section id="security" className="py-8 sm:py-14 scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left side text */}
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111] leading-tight">
                Here&apos;s what people say
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                Trusted by lecturers, department heads, and academic directors across Nigerian tertiary institutions.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setActiveTestimonial((prev) =>
                      prev > 0 ? prev - 1 : testimonials.length - 1
                    )
                  }
                  className="w-10 h-10 rounded-full bg-white hover:bg-stone-100 border border-black/5 flex items-center justify-center text-stone-800 cursor-pointer shadow-2xs"
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
                  className="w-10 h-10 rounded-full bg-[#d7f837] hover:bg-[#cbf028] text-black flex items-center justify-center cursor-pointer shadow-2xs"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right side testimonial card */}
            <div className="lg:col-span-8 bg-[#f4f3ed] rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 border border-black/[0.05] shadow-xs space-y-6">
              <div className="space-y-2">
                <h3 className="font-extrabold text-base sm:text-xl text-[#111111] tracking-tight">
                  “{testimonials[activeTestimonial].headline}”
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                  {testimonials[activeTestimonial].quote}
                </p>
              </div>

              {/* Author row */}
              <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <img
                    src={testimonials[activeTestimonial].avatar}
                    alt={testimonials[activeTestimonial].name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-xs"
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
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        activeTestimonial === idx
                          ? "w-6 bg-black"
                          : "bg-stone-300 hover:bg-stone-400"
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
        {/* SECTION 8: BOTTOM CTA BANNER ("Your Journey to Smarter Living Starts with One Click.") */}
        {/* ========================================================= */}
        <section className="bg-[#edebe4] rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] p-5 sm:p-8 lg:p-10 border border-black/[0.05] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            
            {/* Left: African university scholars working on computers */}
            <div className="lg:col-span-4 rounded-2xl sm:rounded-3xl overflow-hidden bg-[#d7f837] shadow-sm flex items-center justify-center">
              <img
                src="/images/landing/student-campus-lime.jpg"
                alt="University students working in campus computing laboratory"
                className="w-full h-auto aspect-square object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Right: Bold Call to Action Copy */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-[#111111] leading-tight">
                Your Journey to Smarter Attendance Starts with One Click.
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed font-medium">
                Import class lists seamlessly, conduct secure QR-based lecture attendance, prevent proxy check-ins, and export verified semester reports in Excel and PDF formats.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-3 bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-semibold pl-5 pr-2.5 py-3 rounded-full shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Access Workspace</span>
                  <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-xs">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>

                <Link
                  to="/register"
                  className="w-11 h-11 rounded-2xl bg-[#d7f837] hover:bg-[#c9ea28] text-black flex items-center justify-center transition-all shadow-xs"
                  aria-label="Create Lecturer Account"
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
        <footer className="bg-[#0c0c0c] text-white rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] p-8 sm:p-12 lg:p-16 border border-stone-800 space-y-12">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold text-xs shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-white tracking-tight text-xl">
                  CLASSMARK
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
                Production University Attendance Management Platform. Designed for Nigerian Universities and Tertiary Institutions.
              </p>
              <div className="pt-2 text-[11px] font-mono text-stone-500">
                ACC-ID: NUC-VERIFIED-2026
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Product
              </h5>
              <ul className="space-y-2 text-xs text-stone-400 font-medium">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Roster File Import
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Dynamic QR Check-in
                  </a>
                </li>
                <li>
                  <a href="#security" className="hover:text-white transition-colors">
                    Hardware Device Lock
                  </a>
                </li>
                <li>
                  <a href="#workflow" className="hover:text-white transition-colors">
                    Semester Excel & PDF
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Lecturer
              </h5>
              <ul className="space-y-2 text-xs text-stone-400 font-medium">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Workspace Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Register Account
                  </Link>
                </li>
                <li>
                  <Link to="/reset-password" className="hover:text-white transition-colors">
                    Password Reset
                  </Link>
                </li>
                <li>
                  <a href="#workflow" className="hover:text-white transition-colors">
                    Lecturer Guide
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Institutional (All clickable modals) */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Institutional
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
                    Department Audits
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("security")}
                    className="hover:text-[#d7f837] text-left transition-colors cursor-pointer"
                  >
                    Security Standards
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar (All clickable modals) */}
          <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
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
      {/* MOBILE & TABLET DRAWER OVERLAY */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={closeMenu}
          />
          <div className="relative ml-auto w-80 max-w-[85vw] bg-[#faf9f5] shadow-2xl flex flex-col h-full z-10 p-6 space-y-6">
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
                className="w-8 h-8 rounded-full bg-white border border-black/5 flex items-center justify-center text-stone-700 cursor-pointer"
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
                <span>Create Account</span>
              </Link>
            </div>

            <nav className="flex-1 space-y-3 text-sm font-semibold text-stone-700 pt-2">
              <a
                href="#features"
                onClick={closeMenu}
                className="block px-3 py-2 rounded-xl hover:bg-stone-200/60 transition-colors"
              >
                Core Features
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
                4-Step Lecturer Process
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
