"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Check, BookOpen, ArrowRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface CourseData {
  id: string;
  code: string;
  title: string;
  department?: string | null;
  faculty?: string | null;
  session: string;
  semester: string;
  classGroup?: string | null;
  description?: string | null;
  expectedSessions?: number | null;
  attendanceThreshold: number;
  status: "ACTIVE" | "ARCHIVED";
}

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseData | null;
  onSuccess?: (updatedCourse: CourseData) => void;
}

export function EditCourseModal({
  isOpen,
  onClose,
  course,
  onSuccess,
}: EditCourseModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    department: "",
    faculty: "",
    session: "",
    semester: "First Semester",
    classGroup: "",
    description: "",
    expectedSessions: "14",
    attendanceThreshold: "75",
    status: "ACTIVE" as "ACTIVE" | "ARCHIVED",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (course) {
      setFormData({
        code: course.code || "",
        title: course.title || "",
        department: course.department || "",
        faculty: course.faculty || "",
        session: course.session || "2026/2027",
        semester: course.semester || "First Semester",
        classGroup: course.classGroup || "",
        description: course.description || "",
        expectedSessions: course.expectedSessions ? course.expectedSessions.toString() : "",
        attendanceThreshold: course.attendanceThreshold ? course.attendanceThreshold.toString() : "75",
        status: course.status || "ACTIVE",
      });
      setErrorMessage(null);
    }
  }, [course, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        department: formData.department.trim() || null,
        faculty: formData.faculty.trim() || null,
        session: formData.session.trim(),
        semester: formData.semester.trim(),
        classGroup: formData.classGroup.trim() || null,
        description: formData.description.trim() || null,
        expectedSessions: formData.expectedSessions ? parseInt(formData.expectedSessions, 10) : null,
        attendanceThreshold: parseFloat(formData.attendanceThreshold) || 75.0,
        status: formData.status,
      };

      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to update course.");
        return;
      }

      if (onSuccess) {
        onSuccess(data.course);
      }
      onClose();
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!course) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Course: ${course.code}`}
      description="Update course details, academic terms, and attendance benchmarks"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Code & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Course Code *
            </label>
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
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Course Title *
            </label>
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

        {/* Session & Semester */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Academic Session *
            </label>
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
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Semester *
            </label>
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

        {/* Department & Faculty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Department (Optional)
            </label>
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
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Faculty (Optional)
            </label>
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

        {/* Expected Sessions & Attendance Threshold & Course Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Expected Sessions
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
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Threshold (%) *
            </label>
            <input
              type="number"
              name="attendanceThreshold"
              min="1"
              max="100"
              required
              value={formData.attendanceThreshold}
              onChange={handleChange}
              placeholder="75"
              className="mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
            Course Description (Optional)
          </label>
          <textarea
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
            placeholder="Course syllabus outline or lecture overview..."
            className="mt-1.5 block w-full px-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 font-medium"
          />
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-black/[0.06] flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="py-2.5 px-6"
            isLoading={isLoading}
          >
            <Check className="w-4 h-4 mr-1.5 text-[#d7f837]" />
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
