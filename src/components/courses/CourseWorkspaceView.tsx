"use client";

import { useState } from "react";
import { Link, useNavigate, useRevalidator } from "react-router";
import {
  BookOpen,
  Users,
  QrCode,
  FileSpreadsheet,
  Settings,
  Upload,
  UserPlus,
  Download,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Trash2,
  Edit,
  FileText,
  Check,
  AlertCircle,
  Loader2,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { DeleteCourseModal } from "@/components/courses/DeleteCourseModal";
import { formatDate } from "@/lib/utils";

interface CourseWorkspaceProps {
  course: any;
  reportData: any;
  initialTab: string;
  user: any;
}

export function CourseWorkspaceView({
  course,
  reportData,
  initialTab,
  user,
}: CourseWorkspaceProps) {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Search and filter in Roster
  const [searchTerm, setSearchTerm] = useState("");
  const [filterThreshold, setFilterThreshold] = useState<"all" | "deficient" | "qualified">("all");

  // Import Modal States
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Manual Add Student Modal States
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    matricNumber: "",
    fullName: "",
    email: "",
    department: course.department || "",
    level: "100",
  });
  const [addingStudent, setAddingStudent] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit Course Settings States
  const [settingsForm, setSettingsForm] = useState({
    code: course.code,
    title: course.title,
    department: course.department || "",
    faculty: course.faculty || "",
    session: course.session,
    semester: course.semester,
    classGroup: course.classGroup || "",
    description: course.description || "",
    expectedSessions: course.expectedSessions ? course.expectedSessions.toString() : "",
    attendanceThreshold: course.attendanceThreshold.toString(),
    status: course.status || "ACTIVE",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Handle file selection for import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError(null);
    setPreviewData(null);
    setImportSuccess(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/courses/${course.id}/import`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error || "Failed to parse roster file.");
      } else {
        setPreviewData(data);
      }
    } catch {
      setImportError("Network error occurred while uploading class list.");
    } finally {
      setIsUploading(false);
    }
  };

  // Commit imported students to course roster
  const handleCommitImport = async () => {
    if (!previewData?.validRows || previewData.validRows.length === 0) return;

    setIsCommitting(true);
    setImportError(null);

    try {
      const res = await fetch(`/api/courses/${course.id}/import/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: previewData.validRows,
          actionOnExisting: "update",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error || "Failed to commit students into roster.");
      } else {
        setImportSuccess(data.message);
        setTimeout(() => {
          setImportModalOpen(false);
          setPreviewData(null);
          setImportFile(null);
          setImportSuccess(null);
          revalidator.revalidate();
        }, 1500);
      }
    } catch {
      setImportError("Network error occurred during commit.");
    } finally {
      setIsCommitting(false);
    }
  };

  // Add single student manually
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddingStudent(true);

    try {
      const res = await fetch(`/api/courses/${course.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          matricNumber: newStudent.matricNumber,
          fullName: newStudent.fullName,
          email: newStudent.email || undefined,
          department: newStudent.department || undefined,
          level: newStudent.level || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || "Failed to add student.");
      } else {
        setAddStudentModalOpen(false);
        setNewStudent({
          matricNumber: "",
          fullName: "",
          email: "",
          department: course.department || "",
          level: "100",
        });
        revalidator.revalidate();
      }
    } catch {
      setAddError("Network error occurred.");
    } finally {
      setAddingStudent(false);
    }
  };

  // Withdraw student from course
  const handleWithdrawStudent = async (studentId: string, studentName: string) => {
    if (
      !confirm(
        `Are you sure you want to withdraw ${studentName}? Historical attendance records will remain preserved in audit logs.`
      )
    )
      return;

    try {
      await fetch(`/api/courses/${course.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "withdraw",
          studentId,
          reason: "Lecturer withdrawal from course roster",
        }),
      });
      revalidator.revalidate();
    } catch {
      alert("Failed to withdraw student.");
    }
  };

  // Re-enroll withdrawn student
  const handleReEnrollStudent = async (studentId: string) => {
    try {
      await fetch(`/api/courses/${course.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "re-enroll", studentId }),
      });
      revalidator.revalidate();
    } catch {
      alert("Failed to re-enroll student.");
    }
  };

  // Save Course Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage(null);
    setSettingsError(null);

    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: settingsForm.code.trim().toUpperCase(),
          title: settingsForm.title.trim(),
          department: settingsForm.department.trim() || null,
          faculty: settingsForm.faculty.trim() || null,
          session: settingsForm.session.trim(),
          semester: settingsForm.semester.trim(),
          classGroup: settingsForm.classGroup.trim() || null,
          description: settingsForm.description.trim() || null,
          expectedSessions: settingsForm.expectedSessions ? parseInt(settingsForm.expectedSessions, 10) : null,
          attendanceThreshold: parseFloat(settingsForm.attendanceThreshold) || 75.0,
          status: settingsForm.status,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSettingsMessage("Course settings updated successfully.");
        revalidator.revalidate();
      } else {
        setSettingsError(data.error || "Failed to update settings.");
      }
    } catch {
      setSettingsError("Network error occurred.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered student list for Roster tab
  const filteredStudents = reportData.studentSummaries.filter((s: any) => {
    const matchesSearch =
      s.matricNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterThreshold === "deficient") return s.isBelowThreshold;
    if (filterThreshold === "qualified") return !s.isBelowThreshold;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Course Workspace Header */}
      <div className="bg-white border border-[#e7e5df] rounded-[28px] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-black bg-[#d7f837] px-3 py-1 rounded-full shadow-xs">
                {course.code}
              </span>
              <Badge variant={course.status === "ACTIVE" ? "success" : "slate"}>
                {course.status}
              </Badge>
              <span className="text-xs text-[#777770]">
                Threshold: <strong className="text-[#111111]">{course.attendanceThreshold}%</strong>
              </span>
            </div>

            <h1 className="mt-3 text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
              {course.title}
            </h1>

            <p className="text-xs text-[#777770] mt-1 font-medium">
              {course.session} • {course.semester} • {course.department || "Departmental Course"}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <Link
              to={`/courses/${course.id}/attendance/new`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-[#d7f837] hover:text-black text-white text-xs font-bold rounded-full shadow-sm transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Start Attendance Session</span>
            </Link>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-[#111111] text-white border-black"
                  : "bg-white text-stone-700 border-black/10 hover:bg-stone-50"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Course Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="p-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-black/10 hover:border-rose-200 rounded-full transition-all cursor-pointer"
              title="Delete Course"
              aria-label="Delete Course"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-t border-[#edebe4] mt-6 pt-4 overflow-x-auto text-xs font-bold scrollbar-none">
          {[
            { id: "overview", label: "Overview", icon: BookOpen },
            { id: "roster", label: `Student Roster (${reportData.totalStudents})`, icon: Users },
            { id: "sessions", label: `Attendance Sessions (${course.attendanceSessions.length})`, icon: Clock },
            { id: "reports", label: "Reports & Exports", icon: FileSpreadsheet },
            { id: "settings", label: "Course Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? "border-[#111111] text-[#111111]"
                    : "border-transparent text-[#777770] hover:text-[#111111]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-[#111111]" : "text-[#999990]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Real Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-[#e7e5df] rounded-[24px] shadow-xs">
              <span className="text-[11px] font-bold text-[#777770] uppercase tracking-wider block">
                Enrolled Students
              </span>
              <span className="text-2xl font-extrabold text-[#111111] mt-1 block">
                {reportData.totalStudents}
              </span>
              <span className="text-[11px] text-[#999990]">Class roster size</span>
            </div>

            <div className="p-5 bg-white border border-[#e7e5df] rounded-[24px] shadow-xs">
              <span className="text-[11px] font-bold text-[#777770] uppercase tracking-wider block">
                Sessions Conducted
              </span>
              <span className="text-2xl font-extrabold text-[#111111] mt-1 block">
                {reportData.totalSessions}
              </span>
              <span className="text-[11px] text-[#999990]">Total lectures held</span>
            </div>

            <div className="p-5 bg-white border border-[#e7e5df] rounded-[24px] shadow-xs">
              <span className="text-[11px] font-bold text-[#777770] uppercase tracking-wider block">
                Overall Attendance
              </span>
              <span className="text-2xl font-extrabold text-[#111111] mt-1 block">
                {reportData.overallAttendanceRate}%
              </span>
              <span className="text-[11px] text-[#999990]">Average student check-in</span>
            </div>

            <div className="p-5 bg-white border border-[#e7e5df] rounded-[24px] shadow-xs">
              <span className="text-[11px] font-bold text-[#777770] uppercase tracking-wider block">
                Below Threshold
              </span>
              <span className={`text-2xl font-extrabold mt-1 block ${reportData.studentsBelowThresholdCount > 0 ? "text-rose-600" : "text-[#111111]"}`}>
                {reportData.studentsBelowThresholdCount}
              </span>
              <span className="text-[11px] text-[#999990]">Students &lt; {course.attendanceThreshold}%</span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="p-6 bg-white border border-[#e7e5df] rounded-[28px] shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">Lecture Quick Actions</h3>
              <p className="text-xs text-[#777770]">Fast shortcuts for taking attendance and managing records</p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportModalOpen(true)}
                className="gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Class List</span>
              </Button>
              <a
                href={`/api/courses/${course.id}/reports/excel`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-[#e7e5df] rounded-full text-[#111111] bg-white hover:bg-[#faf9f5] transition-all shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Export Excel</span>
              </a>
              <a
                href={`/api/courses/${course.id}/reports/pdf`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-[#e7e5df] rounded-full text-[#111111] bg-white hover:bg-[#faf9f5] transition-all shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-rose-700" />
                <span>Export PDF</span>
              </a>
            </div>
          </div>

          {/* Recent Course Sessions */}
          <div className="bg-white border border-[#e7e5df] rounded-[28px] shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#111111]">Latest Attendance Sessions</h3>
              <button
                onClick={() => setActiveTab("sessions")}
                className="text-xs font-bold text-[#111111] hover:underline"
              >
                View all sessions ({course.attendanceSessions.length})
              </button>
            </div>

            {course.attendanceSessions.length === 0 ? (
              <div className="text-center py-10 text-[#888880]">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#111111]" />
                <p className="text-xs">No attendance sessions recorded yet for this course.</p>
                <Link
                  to={`/courses/${course.id}/attendance/new`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] hover:underline"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Start First Session</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#edebe4] text-xs">
                {course.attendanceSessions.slice(0, 5).map((session: any) => (
                  <div
                    key={session.id}
                    className="py-3.5 flex items-center justify-between hover:bg-[#faf9f5] px-3 rounded-xl transition-colors"
                  >
                    <div>
                      <p className="font-bold text-[#111111]">
                        {session.topic || "Lecture Attendance Session"}
                      </p>
                      <p className="text-[11px] text-[#777770]">
                        {formatDate(session.sessionDate)} • {session._count.records} present
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={session.status === "OPEN" ? "warning" : "slate"}>
                        {session.status}
                      </Badge>
                      <Link
                        to={`/courses/${course.id}/attendance/${session.id}`}
                        className="text-xs font-bold text-[#111111] hover:underline"
                      >
                        Open Session
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT ROSTER */}
      {activeTab === "roster" && (
        <div className="space-y-4">
          {/* Controls: Search, Filter, Add, Import */}
          <div className="bg-white border border-[#e7e5df] rounded-[24px] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#999990] absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student name or matric number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-[#e7e5df] rounded-full focus:outline-none focus:ring-2 focus:ring-[#111111]"
                />
              </div>

              <select
                value={filterThreshold}
                onChange={(e: any) => setFilterThreshold(e.target.value)}
                className="px-3.5 py-2 text-xs border border-[#e7e5df] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]"
              >
                <option value="all">All Students</option>
                <option value="deficient">Below Threshold (&lt;{course.attendanceThreshold}%)</option>
                <option value="qualified">Qualified</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddStudentModalOpen(true)}
                className="gap-1 text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setImportModalOpen(true)}
                className="gap-1 text-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Class List</span>
              </Button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">S/N</th>
                    <th className="px-4 py-3">Matriculation No.</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3 text-center">Security PIN</th>
                    <th className="px-4 py-3 text-center">Attended / Eligible</th>
                    <th className="px-4 py-3 text-center">Attendance %</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        No students match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s: any, idx: number) => (
                      <tr key={s.studentId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          {s.matricNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-900 font-medium">{s.fullName}</td>
                        <td className="px-4 py-3 text-slate-500">{s.department || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          {s.studentPin ? (
                            <span className="font-mono font-bold text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                              {s.studentPin}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-700">
                          <strong>{s.attendedSessions}</strong> / {s.eligibleSessions}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.attendancePercentage !== null ? (
                            <span
                              className={`font-bold ${
                                s.isBelowThreshold ? "text-rose-600" : "text-emerald-700"
                              }`}
                            >
                              {s.attendancePercentage}%
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={s.isBelowThreshold ? "destructive" : "success"}>
                            {s.isBelowThreshold ? "DEFICIENT" : "QUALIFIED"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {s.enrolmentStatus === "ACTIVE" ? (
                            <button
                              onClick={() => handleWithdrawStudent(s.studentId, s.fullName)}
                              className="text-slate-400 hover:text-rose-600 font-semibold text-[11px]"
                            >
                              Withdraw
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReEnrollStudent(s.studentId)}
                              className="text-[#111111] hover:underline font-bold text-[11px]"
                            >
                              Re-enroll
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE SESSIONS */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#e7e5df] rounded-[24px] p-5 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">Course Attendance Sessions</h3>
              <p className="text-xs text-[#777770]">History of all classes and live attendance registers</p>
            </div>
            <Link
              to={`/courses/${course.id}/attendance/new`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] text-white rounded-full text-xs font-bold hover:bg-[#d7f837] hover:text-black shadow-xs transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Start New Session</span>
            </Link>
          </div>

          <div className="bg-white border border-[#e7e5df] rounded-[28px] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f5] text-[#555550] font-bold border-b border-[#edebe4]">
                <tr>
                  <th className="px-5 py-3.5">Lecture Date</th>
                  <th className="px-5 py-3.5">Topic / Description</th>
                  <th className="px-5 py-3.5 text-center">Students Present</th>
                  <th className="px-5 py-3.5 text-center">Attendance %</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edebe4]">
                {course.attendanceSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#888880]">
                      No attendance sessions conducted for this course yet.
                    </td>
                  </tr>
                ) : (
                  course.attendanceSessions.map((session: any) => {
                    const present = session._count.records;
                    const total = reportData.totalStudents;
                    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
                    return (
                      <tr key={session.id} className="hover:bg-[#faf9f5] transition-colors">
                        <td className="px-5 py-3.5 font-medium text-[#111111]">
                          {formatDate(session.sessionDate)}
                        </td>
                        <td className="px-5 py-3.5 text-[#555550]">
                          {session.topic || "Lecture Attendance Session"}
                        </td>
                        <td className="px-5 py-3.5 text-center font-bold text-[#111111]">
                          {present} / {total}
                        </td>
                        <td className="px-5 py-3.5 text-center font-extrabold text-[#111111]">
                          {percent}%
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge variant={session.status === "OPEN" ? "warning" : "slate"}>
                            {session.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            to={`/courses/${course.id}/attendance/${session.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#111111] hover:underline"
                          >
                            <span>Open Session</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: REPORTS & EXPORTS */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#e7e5df] rounded-[28px] p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">
                Official Semester Attendance Reports
              </h3>
              <p className="text-xs text-[#777770] mt-0.5">
                Download verified semester registers formatted for departmental records and exam clearance
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href={`/api/courses/${course.id}/reports/excel`}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold shadow-xs transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Excel (.xlsx)</span>
              </a>

              <a
                href={`/api/courses/${course.id}/reports/pdf`}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-800 hover:bg-rose-900 text-white rounded-full text-xs font-bold shadow-xs transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Download PDF (.pdf)</span>
              </a>
            </div>
          </div>

          {/* Matrix & Statistics Preview */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Attendance Roster & Exam Clearance Status
            </h4>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-slate-200 rounded">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5">S/N</th>
                    <th className="px-4 py-2.5">Matriculation No.</th>
                    <th className="px-4 py-2.5">Student Full Name</th>
                    <th className="px-4 py-2.5 text-center">Eligible Classes</th>
                    <th className="px-4 py-2.5 text-center">Present</th>
                    <th className="px-4 py-2.5 text-center">Absent</th>
                    <th className="px-4 py-2.5 text-center">Percentage</th>
                    <th className="px-4 py-2.5 text-center">Clearance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.studentSummaries.map((s: any, idx: number) => (
                    <tr key={s.studentId} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2 text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-2 font-mono font-bold text-slate-900">
                        {s.matricNumber}
                      </td>
                      <td className="px-4 py-2 text-slate-800">{s.fullName}</td>
                      <td className="px-4 py-2 text-center text-slate-600">{s.eligibleSessions}</td>
                      <td className="px-4 py-2 text-center font-bold text-emerald-700">
                        {s.attendedSessions}
                      </td>
                      <td className="px-4 py-2 text-center font-bold text-rose-600">
                        {s.absentSessions}
                      </td>
                      <td className="px-4 py-2 text-center font-bold">
                        {s.attendancePercentage !== null ? `${s.attendancePercentage}%` : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            s.isBelowThreshold
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {s.isBelowThreshold ? "DEFICIENT (Below Threshold)" : "QUALIFIED"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COURSE SETTINGS */}
      {activeTab === "settings" && (
        <div className="bg-white border border-[#e7e5df] rounded-[28px] p-7 shadow-xs max-w-3xl space-y-8">
          <div>
            <h3 className="text-base font-extrabold text-[#111111] mb-1 tracking-tight">
              Course Configuration & Metadata
            </h3>
            <p className="text-xs text-[#777770]">
              Modify course details, academic semester, required attendance threshold, and course status
            </p>
          </div>

          {settingsMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{settingsMessage}</span>
            </div>
          )}

          {settingsError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{settingsError}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block font-bold text-[#111111] uppercase tracking-wider text-[11px]">
                  Course Code *
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.code}
                  onChange={(e) => setSettingsForm({ ...settingsForm, code: e.target.value.toUpperCase() })}
                  className="mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#111111] uppercase tracking-wider text-[11px]">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.title}
                  onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                  className="mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#111111] uppercase tracking-wider text-[11px]">
                  Academic Session *
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.session}
                  onChange={(e) => setSettingsForm({ ...settingsForm, session: e.target.value })}
                  className="mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] uppercase tracking-wider text-[11px]">
                  Semester *
                </label>
                <select
                  value={settingsForm.semester}
                  onChange={(e) => setSettingsForm({ ...settingsForm, semester: e.target.value })}
                  className="mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] font-medium"
                >
                  <option value="First Semester">First Semester</option>
                  <option value="Second Semester">Second Semester</option>
                  <option value="Harmattan Semester">Harmattan Semester</option>
                  <option value="Rain Semester">Rain Semester</option>
                  <option value="Summer/Special Term">Summer/Special Term</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#111111] uppercase tracking-wider text-[11px]">
                  Department (Optional)
                </label>
                <input
                  type="text"
                  value={settingsForm.department}
                  onChange={(e) => setSettingsForm({ ...settingsForm, department: e.target.value })}
                  className="mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] uppercase tracking-wider text-[11px]">
                  Faculty (Optional)
                </label>
                <input
                  type="text"
                  value={settingsForm.faculty}
                  onChange={(e) => setSettingsForm({ ...settingsForm, faculty: e.target.value })}
                  className="mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-[#111111] uppercase tracking-wider text-[11px]">
                  Expected Lectures
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settingsForm.expectedSessions}
                  onChange={(e) => setSettingsForm({ ...settingsForm, expectedSessions: e.target.value })}
                  placeholder="14"
                  className="mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] uppercase tracking-wider text-[11px]">
                  Threshold (%) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={settingsForm.attendanceThreshold}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, attendanceThreshold: e.target.value })
                  }
                  className="mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] uppercase tracking-wider text-[11px]">
                  Course Status *
                </label>
                <select
                  value={settingsForm.status}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      status: e.target.value as "ACTIVE" | "ARCHIVED",
                    })
                  }
                  className="mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] font-medium"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#111111] uppercase tracking-wider text-[11px]">
                Course Description (Optional)
              </label>
              <textarea
                rows={2}
                value={settingsForm.description}
                onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                placeholder="Course outline or lecture summary..."
                className="mt-1.5 block w-full px-3.5 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
              />
            </div>

            <div className="pt-3 border-t border-[#edebe4] flex justify-end">
              <Button type="submit" variant="primary" isLoading={savingSettings}>
                <Check className="w-4 h-4 mr-1 text-[#d7f837]" />
                <span>Save Course Changes</span>
              </Button>
            </div>
          </form>

          {/* DANGER ZONE: Delete Course */}
          <div className="pt-6 border-t border-rose-200">
            <div className="p-5 sm:p-6 bg-rose-50/70 border border-rose-200 rounded-[24px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-extrabold text-rose-950 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Danger Zone: Permanent Deletion</span>
                  </h4>
                  <p className="text-xs text-rose-800/90 mt-1 max-w-md font-medium leading-relaxed">
                    Permanently delete this course, including student enrolments, attendance sessions, and check-in history. This cannot be undone.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteModalOpen(true)}
                  className="self-start sm:self-auto shrink-0 py-2.5 px-4 text-xs font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Delete Course</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Class List File Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setPreviewData(null);
          setImportFile(null);
          setImportError(null);
        }}
        title="Import Student Class List"
        description="Upload an Excel (.xlsx, .xls), CSV (.csv), Word (.docx), or selectable PDF (.pdf) roster."
        maxWidth="xl"
      >
        <div className="space-y-4">
          {importError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{importError}</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{importSuccess}</span>
            </div>
          )}

          {!previewData ? (
            <div className="space-y-4">
              {/* Drag & Drop Upload Zone */}
              <div className="border-2 border-dashed border-[#e7e5df] rounded-[24px] p-8 text-center hover:border-[#111111] transition-colors bg-[#faf9f5]">
                <FileUp className="w-10 h-10 text-[#999990] mx-auto mb-3" />
                <p className="text-xs font-bold text-[#111111]">
                  Drag and drop your class list file here, or click to browse
                </p>
                <p className="text-[11px] text-[#777770] mt-1">
                  Supports Excel (.xlsx, .xls), CSV, Word (.docx), and selectable text PDFs (max 10MB)
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.docx,.doc,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="class-list-file-input"
                />
                <label
                  htmlFor="class-list-file-input"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-[#d7f837] hover:text-black transition-all shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                </label>
              </div>

              {isUploading && (
                <div className="flex items-center justify-center gap-2 text-xs text-[#111111] py-3 font-semibold">
                  <Loader2 className="w-4 h-4 text-[#111111] animate-spin" />
                  <span>Extracting student records and verifying leading zeros...</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-xs text-[#777770] border-t border-[#edebe4]">
                <span>Need a standard spreadsheet template?</span>
                <a
                  href="/api/courses/template/excel"
                  className="font-bold text-[#111111] hover:underline inline-flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Blank Excel Template</span>
                </a>
              </div>
            </div>
          ) : (
            /* Preview & Reconciliation Table */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs bg-[#faf9f5] p-3.5 rounded-2xl border border-[#e7e5df]">
                <div>
                  <span className="font-bold text-[#111111]">
                    File: {previewData.fileName}
                  </span>
                  <p className="text-[11px] text-[#777770] mt-0.5">
                    Found <strong>{previewData.validRows.length}</strong> valid student records.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPreviewData(null);
                    setImportFile(null);
                  }}
                  className="text-xs text-[#111111] hover:underline font-bold"
                >
                  Upload different file
                </button>
              </div>

              {/* Preview table */}
              <div className="max-h-60 overflow-y-auto border border-[#e7e5df] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf9f5] text-[#555550] sticky top-0 border-b border-[#edebe4] font-bold">
                    <tr>
                      <th className="px-3 py-2.5">Matric No.</th>
                      <th className="px-3 py-2.5">Student Name</th>
                      <th className="px-3 py-2.5">Department</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edebe4]">
                    {previewData.validRows.slice(0, 50).map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-[#faf9f5]">
                        <td className="px-3 py-2 font-mono font-bold text-[#111111]">
                          {row.matricNumber}
                        </td>
                        <td className="px-3 py-2 text-[#222220] font-medium">{row.fullName}</td>
                        <td className="px-3 py-2 text-[#777770]">{row.department || "—"}</td>
                        <td className="px-3 py-2">
                          {row.isAlreadyEnrolled ? (
                            <span className="text-[10px] bg-[#edebe4] text-[#444440] px-2 py-0.5 rounded-full font-semibold">
                              Already Enrolled (Update)
                            </span>
                          ) : (
                            <span className="text-[10px] bg-[#d7f837] text-black px-2 py-0.5 rounded-full font-bold">
                              New Enrolment
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 border-t border-[#edebe4] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setImportModalOpen(false);
                    setPreviewData(null);
                  }}
                  className="px-4 py-2 text-xs text-[#777770] font-bold hover:text-[#111111]"
                >
                  Cancel
                </button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleCommitImport}
                  isLoading={isCommitting}
                >
                  Confirm & Commit {previewData.validRows.length} Students
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 2: Add Single Student Manually */}
      <Modal
        isOpen={addStudentModalOpen}
        onClose={() => setAddStudentModalOpen(false)}
        title="Add Student Manually"
        description="Add an individual student to this course roster."
        maxWidth="md"
      >
        <form onSubmit={handleAddStudent} className="space-y-4">
          {addError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
              {addError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#111111]">
              Matriculation Number *
            </label>
            <input
              type="text"
              required
              value={newStudent.matricNumber}
              onChange={(e) =>
                setNewStudent({ ...newStudent, matricNumber: e.target.value.toUpperCase() })
              }
              placeholder="e.g. CSC/2024/045"
              className="mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111]">Full Name *</label>
            <input
              type="text"
              required
              value={newStudent.fullName}
              onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
              placeholder="Surname Firstname Middlename"
              className="mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111]">
              Institutional Email (Optional)
            </label>
            <input
              type="email"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              placeholder="student@university.edu.ng"
              className="mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111111]">Department</label>
              <input
                type="text"
                value={newStudent.department}
                onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                className="mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111111] bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111111]">Level</label>
              <select
                value={newStudent.level}
                onChange={(e) => setNewStudent({ ...newStudent, level: e.target.value })}
                className="mt-1 block w-full px-4 py-2.5 text-xs border border-[#e7e5df] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] font-medium"
              >
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[#edebe4] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setAddStudentModalOpen(false)}
              className="px-4 py-2 text-xs text-[#777770] font-bold hover:text-[#111111]"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" isLoading={addingStudent}>
              Add to Roster
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Delete Course Modal */}
      <DeleteCourseModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        course={course}
        onSuccess={() => {
          navigate("/courses");
        }}
      />
    </div>
  );
}
