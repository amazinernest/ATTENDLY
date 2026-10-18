"use client";

import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, BookOpen, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NewCourseFormProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    institution?: string | null;
    department?: string | null;
  };
}

export function NewCourseForm({ user }: NewCourseFormProps) {
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    department: user.department || "",
    faculty: "",
    session: "2026/2027",
    semester: "First Semester",
    classGroup: "",
    description: "",
    expectedSessions: "14",
    attendanceThreshold: "60",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        department: formData.department.trim() || undefined,
        faculty: formData.faculty.trim() || undefined,
        session: formData.session.trim(),
        semester: formData.semester.trim(),
        classGroup: formData.classGroup.trim() || undefined,
        description: formData.description.trim() || undefined,
        expectedSessions: formData.expectedSessions ? parseInt(formData.expectedSessions, 10) : undefined,
        attendanceThreshold: parseFloat(formData.attendanceThreshold) || 60.0,
      };

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to create course.");
        return;
      }

      window.location.href = `/courses/${data.course.id}`;
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-2">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold shadow-xs">
            <BookOpen className="w-5 h-5 text-[#d7f837]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">Create New Academic Course</h1>
            <p className="text-xs text-stone-500 font-medium">
              Configure course metadata, academic session, and attendance requirements
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-black/[0.06] rounded-[28px] p-6 sm:p-8 shadow-xs">
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">Course Code *</label>
              <input
                type="text"
                name="code"
                required
                value={formData.code}
                onChange={handleChange}
                placeholder="CSC 201"
                className="mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">Course Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Data Structures and Algorithms"
                className="mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">Academic Session *</label>
              <input
                type="text"
                name="session"
                required
                value={formData.session}
                onChange={handleChange}
                placeholder="2026/2027"
                className="mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">Semester *</label>
              <select
                name="semester"
                required
                value={formData.semester}
                onChange={handleChange}
                className="mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium"
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
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">Department (Optional)</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Computer Science"
                className="mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">Faculty (Optional)</label>
              <input
                type="text"
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                placeholder="Faculty of Science"
                className="mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Expected Teaching Sessions
              </label>
              <input
                type="number"
                name="expectedSessions"
                min="1"
                max="60"
                value={formData.expectedSessions}
                onChange={handleChange}
                placeholder="14"
                className="mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              />
              <span className="text-[11px] text-stone-400 mt-1 block font-medium">Total planned lectures for the semester</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Required Attendance Threshold (%)
              </label>
              <input
                type="number"
                name="attendanceThreshold"
                min="1"
                max="100"
                value={formData.attendanceThreshold}
                onChange={handleChange}
                placeholder="60"
                className="mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
              />
              <span className="text-[11px] text-stone-400 mt-1 block font-medium">Standard university benchmark (e.g. 60% for exam eligibility)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">Course Description (Optional)</label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief course objectives and lecture outline..."
              className="mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
            />
          </div>

          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-end gap-3">
            <Link
              to="/courses"
              className="px-5 py-2.5 border border-black/10 text-xs font-bold text-stone-700 rounded-full hover:bg-black/5 transition-colors"
            >
              Cancel
            </Link>
            <Button type="submit" variant="primary" className="py-2.5 px-6" isLoading={isLoading}>
              <span>Create Course Workspace</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
