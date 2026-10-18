import React from "react";
import { useLoaderData } from "react-router";
import { requireUser } from "@/lib/session.server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SettingsForm } from "@/components/settings/SettingsForm";

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  const smtpConfigured = !!(
    process.env.RESEND_API_KEY ||
    (process.env.SMTP_HOST && process.env.SMTP_USER)
  );
  return { user, smtpConfigured };
}

export default function SettingsPage() {
  const { user, smtpConfigured } = useLoaderData<typeof loader>();

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111]">
            Account & System Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#777770] mt-1 font-medium">
            Configure your lecturer profile, default attendance rules, and security preferences
          </p>
        </div>

        <SettingsForm user={user} smtpConfigured={smtpConfigured} />
      </div>
    </DashboardLayout>
  );
}
