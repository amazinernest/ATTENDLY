"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  QrCode,
  Clock,
  Users,
  Copy,
  Check,
  PowerOff,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function LiveAttendanceSessionPage() {
  const params = useParams();
  const router = useRouter();
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
    if (!data?.checkInUrl) return;
    navigator.clipboard.writeText(data.checkInUrl);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-sky-800 animate-spin" />
      </div>
    );
  }

  if (!data?.session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-800">Attendance Session Not Found</h2>
          <Link href={`/courses/${courseId}`} className="text-xs text-sky-800 underline mt-2 block">
            Return to course
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Bar */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${courseId}`}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base font-mono">
                {session.course?.code}
              </span>
              <Badge variant={isSessionClosed ? "slate" : "success"}>
                {isSessionClosed ? "CLOSED" : "ACTIVE SESSION"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-sm">
              {session.topic || "Lecture Attendance Session"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isSessionClosed && (
            <>
              <button
                onClick={handleExtendSession}
                disabled={extending}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>+10 Mins</span>
              </button>
              <button
                onClick={handleCloseSession}
                disabled={closing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-semibold shadow-xs disabled:opacity-50"
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
            className="gap-1.5"
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
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs text-center flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">
                  Classroom QR Code
                </span>
                <span className="font-semibold text-sky-800">{timeLeft}</span>
              </div>

              {/* Large QR image */}
              <div className="my-5 p-3 bg-white border border-slate-200 rounded-lg shadow-xs inline-block">
                {data.qrCodeDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={data.qrCodeDataUrl}
                    alt="Attendance Check-In QR Code"
                    className="w-64 h-64 sm:w-72 sm:h-72 mx-auto"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-xs text-slate-400">
                    Generating QR code...
                  </div>
                )}
              </div>

              {/* In-Class PIN Display */}
              {session.sessionPin && (
                <div className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 mb-4">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block tracking-wider">
                    In-Class Attendance PIN
                  </span>
                  <span className="text-3xl font-mono font-extrabold tracking-widest text-sky-950 mt-1 block">
                    {session.sessionPin}
                  </span>
                </div>
              )}

              {/* Copy Attendance Link */}
              <div className="w-full flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={data.checkInUrl}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-600 font-mono truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 text-xs font-semibold bg-sky-800 text-white rounded hover:bg-sky-900 flex items-center gap-1 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Link"}</span>
                </button>
              </div>
            </div>

            {/* Attendance Stats Capsule */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-500 uppercase">Live Attendance Rate</span>
                <span className="font-bold text-sky-900">{percentPresent}% Present</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-sky-800 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${percentPresent}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                <span>
                  Present: <strong>{presentCount}</strong> students
                </span>
                <span>
                  Total Enrolled: <strong>{totalEnrolled}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Attendance Register Table */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col h-full">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Live Session Register ({session.records.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time check-in entries verified by ClassMark attendance server
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Polling Active</span>
                </div>
              </div>

              <div className="overflow-x-auto flex-1 max-h-[600px] overflow-y-auto">
                {session.records.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-medium">No student check-ins recorded yet</p>
                    <p className="text-[11px] mt-1 text-slate-400">
                      As students scan the QR code and verify identity, entries will appear here instantly.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-2.5">S/N</th>
                        <th className="px-4 py-2.5">Matriculation No</th>
                        <th className="px-4 py-2.5">Student Name</th>
                        <th className="px-4 py-2.5">Check-In Time</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {session.records.map((rec: any, idx: number) => {
                        const student = rec.enrolment?.student;
                        return (
                          <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-2 text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-2 font-mono font-bold text-slate-900">
                              {student?.matricNumber}
                            </td>
                            <td className="px-4 py-2 text-slate-800 font-medium">
                              {student?.fullName}
                            </td>
                            <td className="px-4 py-2 text-slate-500">
                              {new Date(rec.checkInTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </td>
                            <td className="px-4 py-2">
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
                            <td className="px-4 py-2 text-slate-500">
                              {rec.isManualOverride ? (
                                <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                                  Manual Override
                                </span>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-medium">
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
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800">
              {overrideError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Select Student *</label>
            <select
              required
              value={selectedEnrolmentId}
              onChange={(e) => setSelectedEnrolmentId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-700"
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
            <label className="block text-xs font-semibold text-slate-700">Attendance Status *</label>
            <select
              value={overrideStatus}
              onChange={(e: any) => setOverrideStatus(e.target.value)}
              className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-700"
            >
              <option value="PRESENT">PRESENT</option>
              <option value="EXCUSED">EXCUSED ABSENCE</option>
              <option value="LATE">LATE ARRIVAL</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Reason for Override / Adjustment *
            </label>
            <textarea
              required
              rows={3}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Student present in class; mobile device battery depleted / official medical excuse."
              className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
            />
            <span className="text-[11px] text-slate-400">
              Required for institutional audit trail. Logged with your lecturer ID.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOverrideModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
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
