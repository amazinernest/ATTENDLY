import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SettingsForm } from "./SettingsForm";


export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER);

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Account & System Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure your lecturer profile, default attendance rules, and security preferences
          </p>
        </div>

        <SettingsForm user={user} smtpConfigured={smtpConfigured} />
      </div>
    </DashboardLayout>
  );
}
