import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  Clock,
  Users,
  Copy,
  Check,
  PowerOff,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { requireUser } from "@/lib/session.server";

export async function loader({ request }: { request: Request }) {
  await requireUser(request);
  return null;
}

export default function LiveAttendanceSessionPage() {
  const params = useParams();
  const navigate = useNavigate();
  const courseId = params?.courseId as string;
  const sessionId = params?.sessionId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [closing, setClosing] = useState(false);
  const [extending, setExtending] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Manual Override Modal State
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedEnrolmentId, setSelectedEnrolmentId] = useState("");
  const [overrideStatus, setOverrideStatus] = useState<"PRESENT" | "ABSENT" | "EXCUSED" | "LATE">("PRESENT");
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // Fetch session data
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/sessions/${sessionId}`);
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (err) {
      console.error("Error polling session data:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId, sessionId]);

  // Initial fetch and 3-second polling for real-time register updates
  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 3000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  // Countdown timer calculation
  useEffect(() => {
    if (!data?.session) return;
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(data.session.expiresAt).getTime();
      const diff = expiry - now;

      if (data.session.status === "CLOSED" || diff <= 0) {
        setTimeLeft("Session Closed");
      } else {
        const mins = Math.floor(diff / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${mins}m ${secs < 10 ? "0" : ""}${secs}s remaining`);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [data]);

  const handleCopyLink = () => {
    const urlToCopy = data?.qrTargetUrl || data?.checkInUrl;
    if (!urlToCopy) return;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCloseSession = async () => {
    if (!confirm("Are you sure you want to close this attendance session? New student check-ins will be stopped.")) return;
    setClosing(true);
    try {
      await fetch(`/api/courses/${courseId}/sessions/${sessionId}/close`, {
        method: "POST",
      });
      fetchSession();
    } catch {
      alert("Failed to close session");
    } finally {
      setClosing(false);
    }
  };

  const handleExtendSession = async () => {
    setExtending(true);
    try {
      await fetch(`/api/courses/${courseId}/sessions/${sessionId}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes: 10 }),
      });
      fetchSession();
    } catch {
      alert("Failed to extend session");
    } finally {
      setExtending(false);
    }
  };

  const handleManualOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrolmentId) {
      setOverrideError("Please select a student");
      return;
    }
    if (!overrideReason.trim()) {
      setOverrideError("A valid reason for manual attendance correction is mandatory.");
      return;
    }

    setOverrideError(null);
    setOverrideSubmitting(true);

    try {
      const res = await fetch(`/api/courses/${courseId}/sessions/${sessionId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrolmentId: selectedEnrolmentId,
          status: overrideStatus,
          reason: overrideReason,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setOverrideError(resData.error || "Failed to record manual override.");
        return;
      }

      setOverrideModalOpen(false);
      setSelectedEnrolmentId("");
      setOverrideReason("");
      fetchSession();
    } catch {
      setOverrideError("Network error occurred.");
    } finally {
      setOverrideSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#111111] animate-spin" />
      </div>
    );
  }

  if (!data?.session) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-[28px] border border-[#e7e5df] shadow-sm max-w-sm">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h2 className="text-base font-extrabold text-[#111111]">Attendance Session Not Found</h2>
          <Link to={`/courses/${courseId}`} className="text-xs font-bold text-[#111111] underline mt-3 block hover:text-black">
            Return to course workspace
          </Link>
        </div>
      </div>
    );
  }

  const session = data.session;
  const isSessionClosed = session.status === "CLOSED" || new Date(session.expiresAt) < new Date();
  const presentCount = data.presentCount || 0;
  const totalEnrolled = data.totalEnrolled || 0;
  const percentPresent = totalEnrolled > 0 ? Math.round((presentCount / totalEnrolled) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#111111] pb-16">
      {/* Top Bar */}
      <div className="border-b border-[#e7e5df] bg-white sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/courses/${courseId}`}
            className="w-9 h-9 rounded-full bg-[#edebe4] text-[#444440] hover:bg-[#111111] hover:text-[#d7f837] flex items-center justify-center transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-[#111111] text-sm sm:text-base font-mono">
                {session.course?.code}
              </span>
              <Badge variant={isSessionClosed ? "slate" : "success"}>
                {isSessionClosed ? "CLOSED" : "ACTIVE SESSION"}
              </Badge>
            </div>
            <p className="text-xs text-[#777770] font-medium truncate max-w-sm">
              {session.topic || "Lecture Attendance Session"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {!isSessionClosed && (
            <>
              <button
                onClick={handleExtendSession}
                disabled={extending}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 border border-[#e7e5df] rounded-full text-xs font-bold text-[#111111] bg-white hover:bg-[#faf9f5] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>+10 Mins</span>
              </button>
              <button
                onClick={handleCloseSession}
                disabled={closing}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-full text-xs font-bold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
              >
                <PowerOff className="w-3.5 h-3.5" />
                <span>Close Attendance</span>
              </button>
            </>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setOverrideModalOpen(true)}
            className="gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Override</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Projector QR Code & Check-in Controls */}
          <div className="lg:col-span-5 space-y-5">
            {/* Projector-Ready QR Box */}
            <div className="bg-white border border-[#e7e5df] rounded-[28px] p-7 shadow-xs text-center flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3.5 border-b border-[#edebe4] text-xs">
                <span className="font-bold text-[#777770] uppercase tracking-wider">
                  Classroom QR Code
                </span>
                <span className="font-bold text-[#111111] bg-[#faf9f5] px-3 py-1 rounded-full border border-[#e7e5df]">{timeLeft}</span>
              </div>

              {/* Large QR image */}
              <div className="my-5 p-4 bg-white border border-[#e7e5df] rounded-2xl shadow-xs inline-block">
                {data.qrCodeDataUrl ? (
                  <img
                    src={data.qrCodeDataUrl}
                    alt="Attendance Check-In QR Code"
                    className="w-64 h-64 sm:w-72 sm:h-72 mx-auto"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-xs text-[#888880]">
                    Generating QR code...
                  </div>
                )}
              </div>

              {/* In-Class PIN Display */}
              {session.sessionPin && (
                <div className="w-full bg-[#faf9f5] border border-[#e7e5df] rounded-2xl p-4 mb-4">
                  <span className="text-[11px] font-bold text-[#777770] uppercase block tracking-wider">
                    In-Class Attendance PIN
                  </span>
                  <span className="text-3xl font-mono font-extrabold tracking-widest text-[#111111] mt-1 block">
                    {session.sessionPin}
                  </span>
                </div>
              )}

              {/* Copy Attendance Link */}
              <div className="w-full flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={data.qrTargetUrl || data.checkInUrl}
                  className="flex-1 px-4 py-2 text-xs bg-[#faf9f5] border border-[#e7e5df] rounded-full text-[#555550] font-mono truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 text-xs font-bold bg-[#111111] hover:bg-[#d7f837] hover:text-black text-white rounded-full flex items-center gap-1.5 shrink-0 cursor-pointer transition-all shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Link"}</span>
                </button>
              </div>
            </div>

            {/* Attendance Stats Capsule */}
            <div className="bg-white border border-[#e7e5df] rounded-[28px] p-6 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="font-bold text-[#777770] uppercase">Live Attendance Rate</span>
                <span className="font-extrabold text-[#111111]">{percentPresent}% Present</span>
              </div>
              <div className="w-full bg-[#edebe4] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#111111] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percentPresent}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs text-[#555550] mt-4 pt-3 border-t border-[#edebe4] font-medium">
                <span>
                  Present: <strong className="text-[#111111]">{presentCount}</strong> students
                </span>
                <span>
                  Total Enrolled: <strong className="text-[#111111]">{totalEnrolled}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Attendance Register Table */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#e7e5df] rounded-[28px] shadow-xs overflow-hidden flex flex-col h-full">
              <div className="px-6 py-5 border-b border-[#edebe4] flex items-center justify-between bg-[#faf9f5]">
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">
                    Live Session Register ({session.records.length})
                  </h3>
                  <p className="text-xs text-[#777770] mt-0.5">
                    Real-time check-in entries verified by ClassMark attendance server
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#777770] font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d7f837] border border-black animate-pulse"></span>
                  <span>Polling Active</span>
                </div>
              </div>

              <div className="overflow-x-auto flex-1 max-h-[600px] overflow-y-auto">
                {session.records.length === 0 ? (
                  <div className="py-20 text-center text-[#888880]">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#111111]" />
                    <p className="text-xs font-bold text-[#111111]">No student check-ins recorded yet</p>
                    <p className="text-[11px] mt-1 text-[#777770] max-w-xs mx-auto">
                      As students scan the QR code and verify identity, entries will appear here instantly.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#faf9f5] text-[#555550] font-bold border-b border-[#edebe4] sticky top-0">
                      <tr>
                        <th className="px-4 py-3">S/N</th>
                        <th className="px-4 py-3">Matriculation No</th>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Check-In Time</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edebe4]">
                      {session.records.map((rec: any, idx: number) => {
                        const student = rec.enrolment?.student;
                        return (
                          <tr key={rec.id} className="hover:bg-[#faf9f5] transition-colors">
                            <td className="px-4 py-2.5 text-[#999990]">{idx + 1}</td>
                            <td className="px-4 py-2.5 font-mono font-bold text-[#111111]">
                              {student?.matricNumber}
                            </td>
                            <td className="px-4 py-2.5 text-[#222220] font-medium">
                              {student?.fullName}
                            </td>
                            <td className="px-4 py-2.5 text-[#777770]">
                              {new Date(rec.checkInTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </td>
                            <td className="px-4 py-2.5">
                              <Badge
                                variant={
                                  rec.status === "PRESENT"
                                    ? "success"
                                    : rec.status === "EXCUSED"
                                    ? "warning"
                                    : "slate"
                                }
                              >
                                {rec.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-2.5 text-[#555550]">
                              {rec.isManualOverride ? (
                                <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                                  Manual Override
                                </span>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-semibold">
                                  Verified ({rec.verificationMethod})
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Attendance Override Modal */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title="Manual Attendance Correction"
        description="Record or adjust attendance for a student with mandatory audit logging."
        maxWidth="md"
      >
        <form onSubmit={handleManualOverride} className="space-y-4">
          {overrideError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
              {overrideError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#111111]">Select Student *</label>
            <select
              required
              value={selectedEnrolmentId}
              onChange={(e) => setSelectedEnrolmentId(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] font-medium"
            >
              <option value="">-- Choose enrolled student --</option>
              {data?.enrolledStudents?.map((s: any) => (
                <option key={s.enrolmentId} value={s.enrolmentId}>
                  {s.matricNumber} - {s.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111]">Attendance Status *</label>
            <select
              value={overrideStatus}
              onChange={(e: any) => setOverrideStatus(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] font-medium"
            >
              <option value="PRESENT">PRESENT</option>
              <option value="EXCUSED">EXCUSED ABSENCE</option>
              <option value="LATE">LATE ARRIVAL</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111]">
              Reason for Override / Adjustment *
            </label>
            <textarea
              required
              rows={3}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Student present in class; mobile device battery depleted / official medical excuse."
              className="mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
            />
            <span className="text-[11px] text-[#888880] mt-1 block">
              Required for institutional audit trail. Logged with your lecturer ID.
            </span>
          </div>

          <div className="pt-4 border-t border-[#edebe4] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setOverrideModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#777770] hover:text-[#111111] cursor-pointer"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" isLoading={overrideSubmitting}>
              Apply Correction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
