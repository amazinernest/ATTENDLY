"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NewCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    department: "",
    faculty: "",
    session: "2026/2027",
    semester: "First Semester",
    classGroup: "",
    description: "",
    expectedSessions: "14",
    attendanceThreshold: "75",
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
        attendanceThreshold: parseFloat(formData.attendanceThreshold) || 75.0,
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

      router.push(`/courses/${data.course.id}`);
      router.refresh();
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-sky-800 text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Create New Academic Course</h1>
              <p className="text-xs text-slate-500">
                Configure course metadata, academic session, and attendance requirements
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700">Course Code *</label>
                <input
                  type="text"
                  name="code"
                  required
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="CSC 201"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-sky-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">Course Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Data Structures and Algorithms"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Academic Session *</label>
                <input
                  type="text"
                  name="session"
                  required
                  value={formData.session}
                  onChange={handleChange}
                  placeholder="2026/2027"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Semester *</label>
                <select
                  name="semester"
                  required
                  value={formData.semester}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-700"
                >
                  <option value="First Semester">First Semester</option>
                  <option value="Second Semester">Second Semester</option>
                  <option value="Harmattan Semester">Harmattan Semester</option>
                  <option value="Rain Semester">Rain Semester</option>
                  <option value="Summer/Special Term">Summer/Special Term</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Department (Optional)</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Computer Science"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Faculty (Optional)</label>
                <input
                  type="text"
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  placeholder="Faculty of Science"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
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
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
                />
                <span className="text-[11px] text-slate-400">Total planned lectures for the semester</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Required Attendance Threshold (%)
                </label>
                <input
                  type="number"
                  name="attendanceThreshold"
                  min="1"
                  max="100"
                  value={formData.attendanceThreshold}
                  onChange={handleChange}
                  placeholder="75"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
                />
                <span className="text-[11px] text-slate-400">Standard benchmark (e.g. 75% for exam eligibility)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Course Description (Optional)</label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief course objectives and lecture outline..."
                className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                href="/courses"
                className="px-4 py-2 border border-slate-300 text-xs font-semibold text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <Button type="submit" variant="primary" isLoading={isLoading}>
                Create Course Workspace
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
