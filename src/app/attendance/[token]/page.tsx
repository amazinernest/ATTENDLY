"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Mail,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SessionInfo {
  courseCode: string;
  courseTitle: string;
  academicSession: string;
  semester: string;
  topic: string;
  status: "OPEN" | "CLOSED";
  verificationMethod: "EMAIL_OTP" | "STUDENT_PIN" | "OPEN_CHECKIN";
  requiresInClassPin: boolean;
  expiresAt: string;
}

export default function StudentCheckInPage() {
  const params = useParams();
  const token = params?.token as string;

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Form states
  const [matricNumber, setMatricNumber] = useState("");
  const [sessionPin, setSessionPin] = useState("");
  const [studentPin, setStudentPin] = useState("");
  const [otpCode, setOtpCode] = useState("");

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
    checkInTime: string;
  } | null>(null);

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
        body: JSON.stringify({ matricNumber }),
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

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/attendance/${token}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricNumber,
          sessionPin,
          studentPin,
          otpCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Attendance check-in was declined.");
      } else {
        setConfirmation({
          studentName: data.studentName,
          matricNumber: data.matricNumber,
          checkInTime: data.checkInTime,
        });
      }
    } catch {
      setFormError("Network connection interrupted. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-sky-800 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Verifying session credentials...</p>
        </div>
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-lg p-6 shadow-xs text-center">
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
    <div className="min-h-screen bg-slate-100/60 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Course Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-sky-800 text-white shadow-xs mb-3">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">{session.courseCode}</h1>
        <p className="text-xs text-slate-600 font-medium">{session.courseTitle}</p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-200 text-slate-600">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{session.academicSession} • {session.semester}</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-5 sm:px-7 shadow-xs border border-slate-200 rounded-lg">
          {confirmation ? (
            /* Success confirmation */
            <div className="text-center py-4 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">Attendance Confirmed</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your physical presence has been authenticated and recorded in the course register.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-semibold text-slate-900">{confirmation.studentName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Matriculation No:</span>
                  <span className="font-mono font-semibold text-slate-900">{confirmation.matricNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Course:</span>
                  <span className="font-semibold text-slate-900">{session.courseCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verified Timestamp:</span>
                  <span className="font-semibold text-emerald-700">
                    {new Date(confirmation.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 pt-2">
                You may now close this window or return to your lecture.
              </p>
            </div>
          ) : isClosed ? (
            /* Closed Session Notice */
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Session Closed</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                Attendance for this lecture is now closed. Check-in submissions are no longer accepted.
              </p>
              <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                If you were in class and missed check-in, notify your lecturer before lecture concludes.
              </p>
            </div>
          ) : (
            /* Check-in Form */
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Student Attendance Verification</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {session.topic || "Verify your physical attendance in this lecture"}
                </p>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Matriculation Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Matriculation / Student Registration No. *
                </label>
                <input
                  type="text"
                  required
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. CSC/2024/001"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-sky-700"
                />
              </div>

              {/* In-Class Projected Session PIN (if lecturer set a session PIN) */}
              {session.requiresInClassPin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    In-Class PIN (Projected on Board) *
                  </label>
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
                      placeholder="4-digit code shown in lecture"
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-sky-700"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Enter the code displayed by your lecturer on the classroom screen.
                  </span>
                </div>
              )}

              {/* Student Personal PIN Verification */}
              {session.verificationMethod === "STUDENT_PIN" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Student Verification PIN (Optional or Provided)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={studentPin}
                    onChange={(e) => setStudentPin(e.target.value)}
                    placeholder="Enter assigned PIN if issued"
                    className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-sky-700"
                  />
                  <span className="text-[11px] text-slate-400">
                    Your personal attendance security PIN issued for this course
                  </span>
                </div>
              )}

              {/* Institutional Email OTP Verification */}
              {session.verificationMethod === "EMAIL_OTP" && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Email Passcode Verification *
                    </label>
                    {!otpSent && (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={sendingOtp || !matricNumber.trim()}
                        className="text-xs font-semibold text-sky-800 hover:text-sky-900 disabled:opacity-50"
                      >
                        {sendingOtp ? "Sending code..." : "Get Code via Email"}
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
                          Development Passcode: <strong>{devOtp}</strong>
                        </p>
                      )}
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.trim())}
                        placeholder="Enter 6-digit code"
                        className="block w-full px-3 py-2 text-center text-lg font-mono tracking-widest border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
                      />
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
                      Enter your matriculation number above and tap <strong>Get Code via Email</strong> to receive your check-in passcode.
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-2.5 font-bold"
                  isLoading={isSubmitting}
                >
                  Confirm Physical Attendance
                </Button>
              </div>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-400">
                  Protected university academic record. Proxy attendance is strictly prohibited.
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
