"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, QrCode, Clock, ShieldCheck, KeyRound, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NewAttendanceSessionPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<{ code: string; title: string } | null>(null);
  const [topic, setTopic] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [verificationMethod, setVerificationMethod] = useState<"STUDENT_PIN" | "EMAIL_OTP" | "OPEN_CHECKIN">("STUDENT_PIN");
  const [sessionPin, setSessionPin] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [enableInClassPin, setEnableInClassPin] = useState(true);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/courses`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.courses?.find((c: any) => c.id === courseId);
        if (found) {
          setCourse({ code: found.code, title: found.title });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/courses/${courseId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim() || undefined,
          durationMinutes,
          verificationMethod,
          sessionPin: enableInClassPin ? sessionPin : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to start attendance session.");
        return;
      }

      router.push(`/courses/${courseId}/attendance/${data.session.id}`);
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course Workspace</span>
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-sky-800 text-white flex items-center justify-center font-bold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Start Lecture Attendance: {course?.code || "Course"}
              </h1>
              <p className="text-xs text-slate-500">{course?.title}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
          {errorMessage && (
            <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Lecture Topic or Session Title (Optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Week 4: Recursion & Binary Trees"
                className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
              />
              <span className="text-[11px] text-slate-400">
                Helps identify this class in the semester attendance matrix
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Check-in Window Duration
              </label>
              <div className="mt-1.5 grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-2 text-xs font-semibold rounded-md border text-center transition-colors ${
                      durationMinutes === mins
                        ? "bg-sky-50 border-sky-700 text-sky-900"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Student Identity Verification Method
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="STUDENT_PIN"
                    checked={verificationMethod === "STUDENT_PIN"}
                    onChange={() => setVerificationMethod("STUDENT_PIN")}
                    className="mt-0.5 text-sky-800 focus:ring-sky-700"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Student PIN (Recommended)</span>
                    <span className="text-[11px] text-slate-500 leading-relaxed block">
                      Students verify with their assigned confidential student PIN along with matric number.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="EMAIL_OTP"
                    checked={verificationMethod === "EMAIL_OTP"}
                    onChange={() => setVerificationMethod("EMAIL_OTP")}
                    className="mt-0.5 text-sky-800 focus:ring-sky-700"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Institutional Email Passcode (OTP)</span>
                    <span className="text-[11px] text-slate-500 leading-relaxed block">
                      Dispatches a single-use numeric code to the student&apos;s registered institutional inbox.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="OPEN_CHECKIN"
                    checked={verificationMethod === "OPEN_CHECKIN"}
                    onChange={() => setVerificationMethod("OPEN_CHECKIN")}
                    className="mt-0.5 text-sky-800 focus:ring-sky-700"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">In-Class PIN Only</span>
                    <span className="text-[11px] text-slate-500 leading-relaxed block">
                      Students enter the 4-digit in-class PIN projected on the classroom board to authenticate presence.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* In-class display PIN */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Project In-Class Session PIN</span>
                  <span className="text-[11px] text-slate-500 block">
                    Displays a 4-digit code on the classroom projector screen to verify physical attendance.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableInClassPin}
                  onChange={(e) => setEnableInClassPin(e.target.checked)}
                  className="rounded text-sky-800 focus:ring-sky-700"
                />
              </label>

              {enableInClassPin && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Projected Code:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-sky-900 bg-white px-3 py-1 rounded border border-slate-300 tracking-widest">
                      {sessionPin}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSessionPin(Math.floor(1000 + Math.random() * 9000).toString())}
                      className="text-[11px] text-sky-700 hover:text-sky-800 font-semibold underline"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full py-2.5 font-bold" isLoading={submitting}>
                Start Attendance & Display QR
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
