"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Trash2, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface DeleteCourseData {
  id: string;
  code: string;
  title: string;
  session?: string;
  semester?: string;
  _count?: {
    enrolments?: number;
    attendanceSessions?: number;
  };
}

interface DeleteCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: DeleteCourseData | null;
  onSuccess?: () => void;
}

export function DeleteCourseModal({
  isOpen,
  onClose,
  course,
  onSuccess,
}: DeleteCourseModalProps) {
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmInput("");
      setErrorMessage(null);
      setIsDeleting(false);
    }
  }, [isOpen]);

  if (!course) return null;

  const normalizedCode = course.code.trim().toUpperCase();
  const isConfirmed = confirmInput.trim().toUpperCase() === normalizedCode;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to delete course.");
        setIsDeleting(false);
        return;
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch {
      setErrorMessage("Network error occurred while deleting course.");
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Academic Course"
      description="This action is irreversible and permanently purges all course registers"
      maxWidth="md"
    >
      <form onSubmit={handleDelete} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Warning: Permanent Deletion</span>
          </div>
          <p className="text-rose-800 leading-relaxed font-medium">
            You are about to permanently delete{" "}
            <strong className="text-black font-extrabold">{course.code} - {course.title}</strong>.
          </p>
          <ul className="list-disc list-inside space-y-1 text-rose-800/90 pt-1 font-medium">
            <li>Course workspace and lecture schedule</li>
            <li>All student enrolments in this course</li>
            <li>All attendance session records, check-ins, and reports</li>
          </ul>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700">
            To confirm deletion, please type{" "}
            <span className="font-mono bg-stone-100 text-black px-1.5 py-0.5 rounded border border-stone-300 font-extrabold select-all">
              {course.code}
            </span>{" "}
            below:
          </label>
          <input
            type="text"
            required
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={`Type ${course.code} to confirm`}
            className="mt-2 block w-full px-3.5 py-2.5 text-sm border border-black/[0.15] rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white font-bold"
            autoFocus
          />
        </div>

        <div className="pt-4 border-t border-black/[0.06] flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={!isConfirmed || isDeleting}
            isLoading={isDeleting}
            className="py-2.5 px-5"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span>Permanently Delete Course</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
