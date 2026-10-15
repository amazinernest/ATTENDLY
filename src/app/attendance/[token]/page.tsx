"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Mail,
  Clock,
  Sparkles,
  Loader2,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SessionInfo {
  courseCode: string;
  courseTitle: string;
  lecturerName?: string;
  academicSession: string;
  semester: string;
  topic: string;
  status: "OPEN" | "CLOSED";
  verificationMethod: "EMAIL_OTP" | "STUDENT_PIN" | "OPEN_CHECKIN";
  requiresInClassPin: boolean;
  expiresAt: string;
}

interface StudentLookupState {
  isChecking: boolean;
  found: boolean;
  studentName?: string;
  matricNumber?: string;
  department?: string;
  hasStudentPin?: boolean;
  devStudentPin?: string;
  alreadyRecorded?: boolean;
  formattedCheckInTime?: string;
  error?: string;
}

function StudentCheckInContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params?.token as string;
  const pinFromUrl = searchParams?.get("pin") || "";

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Form states
  const [matricNumber, setMatricNumber] = useState("");
  const [sessionPin, setSessionPin] = useState(pinFromUrl);
  const [studentPin, setStudentPin] = useState("");
  const [showStudentPin, setShowStudentPin] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Student identification state
  const [studentLookup, setStudentLookup] = useState<StudentLookupState>({
    isChecking: false,
    found: false,
  });

  // OTP flow states
  const [otpSent, setOtpSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    studentName: string;
    matricNumber: string;
    courseCode: string;
    checkInTime: string;
  } | null>(null);

  // Auto-fill from localStorage on mobile device
  useEffect(() => {
    try {
      const savedMatric = localStorage.getItem("classmark_student_matric");
      if (savedMatric && !matricNumber) {
        setMatricNumber(savedMatric);
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  // Update PIN if received from URL
  useEffect(() => {
    if (pinFromUrl && !sessionPin) {
      setSessionPin(pinFromUrl);
    }
  }, [pinFromUrl, sessionPin]);

  // Fetch session details on mount
  useEffect(() => {
    if (!token) return;

    fetch(`/api/attendance/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setSessionError(data.error);
        } else {
          setSession(data);
        }
      })
      .catch(() => {
        setSessionError("Failed to connect to university attendance server.");
      })
      .finally(() => {
        setLoadingSession(false);
      });
  }, [token]);

  // Fast debounced real-time student verification lookup
  const lookupStudent = useCallback(
    async (matric: string) => {
      const clean = matric.trim().toUpperCase().replace(/\\/g, "/");
      if (clean.length < 3) {
        setStudentLookup({ isChecking: false, found: false });
        return;
      }

      setStudentLookup((prev) => ({ ...prev, isChecking: true }));

      try {
        const res = await fetch(
          `/api/attendance/${token}/lookup?matric=${encodeURIComponent(clean)}`
        );
        const data = await res.json();

        if (res.ok && data.found) {
          setStudentLookup({
            isChecking: false,
            found: true,
            studentName: data.student.fullName,
            matricNumber: data.student.matricNumber,
            department: data.student.department,
            hasStudentPin: data.student.hasStudentPin,
            devStudentPin: data.student.devStudentPin,
            alreadyRecorded: data.alreadyRecorded,
            formattedCheckInTime: data.formattedCheckInTime,
          });
        } else {
          setStudentLookup({
            isChecking: false,
            found: false,
            error: data.message || "Matriculation number not found in course register.",
          });
        }
      } catch {
        setStudentLookup({
          isChecking: false,
          found: false,
        });
      }
    },
    [token]
  );

  // Trigger lookup on matric change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (matricNumber.trim().length >= 3) {
        lookupStudent(matricNumber);
      } else {
        setStudentLookup({ isChecking: false, found: false });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [matricNumber, lookupStudent]);

  const handleRequestOtp = async () => {
    if (!matricNumber.trim()) {
      setFormError("Please enter your matriculation number first.");
      return;
    }

    setFormError(null);
    setSendingOtp(true);

    try {
      const res = await fetch(`/api/attendance/${token}/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricNumber: matricNumber.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to send verification code.");
      } else {
        setOtpSent(true);
        setMaskedEmail(data.maskedEmail);
        if (data.devOtp) setDevOtp(data.devOtp);
      }
    } catch {
      setFormError("Network error occurred while requesting verification code.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleClearSavedStudent = () => {
    try {
      localStorage.removeItem("classmark_student_matric");
    } catch {}
    setMatricNumber("");
    setStudentLookup({ isChecking: false, found: false });
    setFormError(null);
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const cleanMatric = matricNumber.trim().toUpperCase().replace(/\\/g, "/");

    try {
      const res = await fetch(`/api/attendance/${token}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricNumber: cleanMatric,
          sessionPin: sessionPin.trim(),
          studentPin: studentPin.trim(),
          otpCode: otpCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.alreadyRecorded) {
          setConfirmation({
            studentName: data.studentName || studentLookup.studentName || "Enrolled Student",
            matricNumber: data.matricNumber || cleanMatric,
            courseCode: data.courseCode || session?.courseCode || "Course Attendance",
            checkInTime: data.checkInTime || new Date().toISOString(),
          });
        } else {
          setFormError(data.error || "Attendance check-in was declined.");
        }
      } else {
        // Save matriculation number to localStorage for seamless next-time check-in
        try {
          localStorage.setItem("classmark_student_matric", cleanMatric);
        } catch {}

        setConfirmation({
          studentName: data.studentName,
          matricNumber: data.matricNumber,
          courseCode: data.courseCode,
          checkInTime: data.checkInTime,
        });
      }
    } catch {
      setFormError("Network connection interrupted. Please check your data connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-sky-800 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Connecting to lecture hall register...</p>
        </div>
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">Attendance Session Unavailable</h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {sessionError || "The attendance session could not be found or the link has expired."}
          </p>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              Please notify your lecturer if you are physically in class and unable to connect.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isClosed = session.status === "CLOSED";

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8">
      {/* Course Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-800 text-white shadow-sm mb-2.5">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {session.courseCode}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium px-2">
          {session.courseTitle}
        </p>
        {session.lecturerName && (
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            Lecturer: {session.lecturerName}
          </p>
        )}
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-sky-700" />
          <span>{session.academicSession} • {session.semester}</span>
        </div>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-5 sm:px-7 shadow-md border border-slate-200/80 rounded-2xl">
          {confirmation ? (
            /* Celebration confirmation */
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Attendance Confirmed
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  You are Marked PRESENT!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your classroom presence has been verified in the university register.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2.5">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Student Name:</span>
                  <span className="font-bold text-slate-900">{confirmation.studentName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Matriculation No:</span>
                  <span className="font-mono font-bold text-slate-900">{confirmation.matricNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Course:</span>
                  <span className="font-bold text-slate-900">{confirmation.courseCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Recorded Time:</span>
                  <span className="font-bold text-emerald-700">
                    {new Date(confirmation.checkInTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 pt-1">
                Your matric number is saved on this device for 1-tap check-in next time!
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => window.close()}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : isClosed ? (
            /* Closed Session Notice */
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Attendance Session Closed</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                Attendance submissions for this lecture have ended. Check-ins are no longer accepted.
              </p>
              <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                If you were physically in class and missed the window, please notify your lecturer immediately.
              </p>
            </div>
          ) : (
            /* Seamless Check-in Form */
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Lecture Check-In</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Register
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {session.topic || "Confirm your physical classroom presence"}
                </p>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{formError}</span>
                </div>
              )}

              {/* Already Checked-in Alert */}
              {studentLookup.alreadyRecorded && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">You are already marked present!</p>
                    <p className="mt-0.5 text-emerald-800">
                      Attendance for <strong>{studentLookup.studentName}</strong> was already recorded at {studentLookup.formattedCheckInTime}. You do not need to sign in again.
                    </p>
                  </div>
                </div>
              )}

              {/* Matriculation Number */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Matriculation / Student ID *
                  </label>
                  {studentLookup.found && (
                    <button
                      type="button"
                      onClick={handleClearSavedStudent}
                      className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Change ID</span>
                    </button>
                  )}
                </div>

                <div className="mt-1 relative">
                  <input
                    type="text"
                    required
                    autoFocus={!matricNumber}
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. CSC/2024/001"
                    className="block w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-lg uppercase font-mono tracking-wide placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-sky-700 bg-white"
                  />
                  {studentLookup.isChecking && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Loader2 className="w-4 h-4 text-sky-700 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Instant Student Identification Feedback Pill */}
                {studentLookup.found ? (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-xs text-emerald-900">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate">{studentLookup.studentName}</p>
                      <p className="text-[11px] text-emerald-700 truncate">
                        {studentLookup.department || "Enrolled Student"} • {studentLookup.matricNumber}
                      </p>
                    </div>
                  </div>
                ) : studentLookup.error && matricNumber.trim().length >= 3 ? (
                  <p className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{studentLookup.error}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Device will remember your matriculation number for future lectures.
                  </p>
                )}
              </div>

              {/* In-Class PIN Input */}
              {session.requiresInClassPin && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      In-Class PIN (Projected on Board) *
                    </label>
                    {pinFromUrl && sessionPin === pinFromUrl && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Auto-filled from QR code
                      </span>
                    )}
                  </div>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={sessionPin}
                      onChange={(e) => setSessionPin(e.target.value.trim())}
                      placeholder="4-digit PIN on classroom screen"
                      className="block w-full pl-9 pr-3 py-2.5 text-base border border-slate-300 rounded-lg font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-sky-700 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Student Personal PIN */}
              {session.verificationMethod === "STUDENT_PIN" && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Personal Student Security PIN *
                    </label>
                    {studentLookup.devStudentPin && (
                      <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-mono">
                        Dev / Test PIN: {studentLookup.devStudentPin}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showStudentPin ? "text" : "password"}
                      required
                      maxLength={6}
                      value={studentPin}
                      onChange={(e) => setStudentPin(e.target.value)}
                      placeholder="Enter your personal 4-digit PIN"
                      className="block w-full pl-9 pr-10 py-2.5 text-base border border-slate-300 rounded-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-sky-700 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentPin(!showStudentPin)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showStudentPin ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Confidential personal PIN assigned on course roster
                  </span>
                </div>
              )}

              {/* Email OTP Verification */}
              {session.verificationMethod === "EMAIL_OTP" && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Email Passcode *
                    </label>
                    {!otpSent && (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={sendingOtp || !matricNumber.trim()}
                        className="text-xs font-bold text-sky-800 hover:text-sky-900 disabled:opacity-50"
                      >
                        {sendingOtp ? "Sending code..." : "Send Code to My Email"}
                      </button>
                    )}
                  </div>

                  {otpSent ? (
                    <div>
                      <p className="text-xs text-emerald-700 mb-2">
                        Passcode sent to <strong>{maskedEmail}</strong>.
                      </p>
                      {devOtp && (
                        <p className="text-[11px] text-sky-800 bg-sky-50 p-2 rounded mb-2 border border-sky-200">
                          Dev Passcode: <strong>{devOtp}</strong>
                        </p>
                      )}
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.trim())}
                        placeholder="Enter 6-digit code"
                        className="block w-full px-3 py-2 text-center text-lg font-mono tracking-widest border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-700"
                      />
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                      Tap <strong>Send Code to My Email</strong> to receive your check-in passcode.
                    </div>
                  )}
                </div>
              )}

              {/* Giant Seamless Check-in Button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3.5 text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all rounded-xl"
                  isLoading={isSubmitting}
                  disabled={studentLookup.alreadyRecorded}
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  <span>
                    {studentLookup.alreadyRecorded
                      ? "Attendance Already Confirmed"
                      : "Confirm My Attendance"}
                  </span>
                </Button>
              </div>

              <div className="pt-1 text-center">
                <span className="text-[11px] text-slate-400">
                  Physical presence required. Institutional attendance policy applies.
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentCheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-sky-800 animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-600">Loading attendance portal...</p>
          </div>
        </div>
      }
    >
      <StudentCheckInContent />
    </Suspense>
  );
}
