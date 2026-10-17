import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, QrCode, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/session.server";

export async function loader({ request }: { request: Request }) {
  await requireUser(request);
  return null;
}

export default function NewAttendanceSessionPage() {
  const params = useParams();
  const navigate = useNavigate();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<{ code: string; title: string } | null>(null);
  const [topic, setTopic] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [verificationMethod, setVerificationMethod] = useState<"STUDENT_PIN" | "EMAIL_OTP" | "OPEN_CHECKIN">("OPEN_CHECKIN");
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

      navigate(`/courses/${courseId}/attendance/${data.session.id}`);
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#111111] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <Link
            to={`/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#777770] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course Workspace</span>
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#111111] text-[#d7f837] flex items-center justify-center font-bold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                Start Lecture Attendance: {course?.code || "Course"}
              </h1>
              <p className="text-xs text-[#777770] font-medium">{course?.title}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e7e5df] rounded-[28px] p-7 shadow-xs">
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#111111]">
                Lecture Topic or Session Title (Optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Week 4: Recursion & Binary Trees"
                className="mt-1.5 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
              />
              <span className="text-[11px] text-[#888880] mt-1 block">
                Helps identify this class in the semester attendance matrix
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111]">
                Check-in Window Duration
              </label>
              <div className="mt-2 grid grid-cols-4 gap-2.5">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-2 text-xs font-bold rounded-full border text-center transition-all cursor-pointer ${
                      durationMinutes === mins
                        ? "bg-[#111111] border-[#111111] text-white shadow-xs"
                        : "bg-white border-[#e7e5df] text-[#555550] hover:bg-[#faf9f5]"
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-2">
                Student Identity Verification Method
              </label>
              <div className="space-y-2.5">
                <label className={`flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer transition-all ${verificationMethod === "OPEN_CHECKIN" ? "border-[#111111] bg-[#faf9f5]" : "border-[#e7e5df] bg-white hover:border-[#ccc]"}`}>
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="OPEN_CHECKIN"
                    checked={verificationMethod === "OPEN_CHECKIN"}
                    onChange={() => setVerificationMethod("OPEN_CHECKIN")}
                    className="mt-1 accent-black"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#111111] flex items-center gap-2">
                      <span>In-Class QR Code & PIN</span>
                      <span className="text-[10px] bg-[#d7f837] text-black px-2 py-0.5 rounded-full font-bold">Recommended</span>
                    </span>
                    <span className="text-[11px] text-[#777770] leading-relaxed block mt-0.5">
                      Fastest & most seamless. Scanning the classroom QR code auto-verifies physical presence and pre-fills the PIN for students.
                    </span>
                  </div>
                </label>

                <label className={`flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer transition-all ${verificationMethod === "STUDENT_PIN" ? "border-[#111111] bg-[#faf9f5]" : "border-[#e7e5df] bg-white hover:border-[#ccc]"}`}>
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="STUDENT_PIN"
                    checked={verificationMethod === "STUDENT_PIN"}
                    onChange={() => setVerificationMethod("STUDENT_PIN")}
                    className="mt-1 accent-black"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#111111] block">Personal Student PIN</span>
                    <span className="text-[11px] text-[#777770] leading-relaxed block mt-0.5">
                      Requires students to enter an individual security PIN previously assigned to their matriculation number.
                    </span>
                  </div>
                </label>

                <label className={`flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer transition-all ${verificationMethod === "EMAIL_OTP" ? "border-[#111111] bg-[#faf9f5]" : "border-[#e7e5df] bg-white hover:border-[#ccc]"}`}>
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="EMAIL_OTP"
                    checked={verificationMethod === "EMAIL_OTP"}
                    onChange={() => setVerificationMethod("EMAIL_OTP")}
                    className="mt-1 accent-black"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#111111] block">Institutional Email Passcode (OTP)</span>
                    <span className="text-[11px] text-[#777770] leading-relaxed block mt-0.5">
                      Dispatches a single-use numeric code to the student&apos;s registered institutional inbox.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* In-class display PIN */}
            <div className="p-4 bg-[#faf9f5] border border-[#e7e5df] rounded-2xl">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#111111] block">Project In-Class Session PIN</span>
                  <span className="text-[11px] text-[#777770] block mt-0.5">
                    Displays a 4-digit code on the classroom projector screen to verify physical attendance.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableInClassPin}
                  onChange={(e) => setEnableInClassPin(e.target.checked)}
                  className="rounded accent-black w-4 h-4 cursor-pointer"
                />
              </label>

              {enableInClassPin && (
                <div className="mt-3.5 pt-3.5 border-t border-[#edebe4] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#777770]">Projected Code:</span>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-base font-extrabold text-[#111111] bg-white px-3.5 py-1 rounded-full border border-[#e7e5df] tracking-widest shadow-xs">
                      {sessionPin}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSessionPin(Math.floor(1000 + Math.random() * 9000).toString())}
                      className="text-xs text-[#111111] hover:underline font-bold cursor-pointer"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full py-3 font-bold" isLoading={submitting}>
                Start Attendance & Display QR
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
