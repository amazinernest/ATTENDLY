"use client";

import React, { useState } from "react";
import { User, Lock, Clock, ShieldCheck, Check, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SettingsFormProps {
  user: any;
  smtpConfigured: boolean;
}

export function SettingsForm({ user, smtpConfigured }: SettingsFormProps) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    institution: user.institution || "",
    department: user.department || "",
    timeZone: user.timeZone || "Africa/Lagos",
    defaultThreshold: user.defaultThreshold?.toString() || "75",
    defaultSessionDuration: user.defaultSessionDuration?.toString() || "30",
    defaultVerificationMethod: user.defaultVerificationMethod || "STUDENT_PIN",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setErrorMsg("New passwords do not match.");
        return;
      }
      if (!formData.currentPassword) {
        setErrorMsg("Please provide your current password to update it.");
        return;
      }
    }

    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          institution: formData.institution,
          department: formData.department,
          timeZone: formData.timeZone,
          defaultThreshold: parseFloat(formData.defaultThreshold) || 75.0,
          defaultSessionDuration: parseInt(formData.defaultSessionDuration, 10) || 30,
          defaultVerificationMethod: formData.defaultVerificationMethod,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update settings.");
      } else {
        setSuccessMsg("Settings updated successfully.");
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }
    } catch {
      setErrorMsg("Network error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Lecturer Profile */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-sky-800" />
          <span>Lecturer Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700">Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700">Institutional Email</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="mt-1 block w-full px-3 py-2 text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-md cursor-not-allowed"
            />
            <span className="text-[11px] text-slate-400">Email address cannot be changed directly</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700">University / Tertiary Institution</label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              placeholder="e.g. Obafemi Awolowo University"
              className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g. Computer Science & Engineering"
              className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
            />
          </div>
        </div>
      </div>

      {/* Attendance Defaults & System Preferences */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-800" />
          <span>Attendance Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700">Default Time Zone</label>
            <select
              value={formData.timeZone}
              onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
              className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-700"
            >
              <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
              <option value="UTC">UTC</option>
              <option value="Africa/Accra">Africa/Accra (GMT)</option>
              <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, UTC+2)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700">Default Session Duration</label>
            <select
              value={formData.defaultSessionDuration}
              onChange={(e) => setFormData({ ...formData, defaultSessionDuration: e.target.value })}
              className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sky-700"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700">Default Attendance Threshold (%)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.defaultThreshold}
              onChange={(e) => setFormData({ ...formData, defaultThreshold: e.target.value })}
              className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
            />
          </div>
        </div>
      </div>

      {/* Security & Password */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-sky-800" />
          <span>Security & Password Update</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700">Current Password</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="Enter current password"
              className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700">New Password</label>
            <input
              type="password"
              minLength={8}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="Min. 8 characters"
              className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700">Confirm New Password</label>
            <input
              type="password"
              minLength={8}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
              className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700"
            />
          </div>
        </div>
      </div>

      {/* System Diagnostics Box */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
          <Info className="w-4 h-4 text-sky-800" />
          <span>System Environment & Mail Dispatch Status</span>
        </div>
        <p className="mt-1">
          {smtpConfigured
            ? "Production SMTP server is actively connected for transactional email dispatch."
            : "Running in local development mode: verification links and OTP codes are safely transparent and logged directly to the server terminal."}
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" isLoading={saving}>
          Save Preferences
        </Button>
      </div>
    </form>
  );
}
