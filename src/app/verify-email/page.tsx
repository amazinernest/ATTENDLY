"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState<string>(
    token ? "Verifying your email token..." : "Missing verification token. Please check your verification link."
  );

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. The token may be expired or invalid.");
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus("error");
        setMessage("A network error occurred. Please try again.");
      });

    return () => {
      isMounted = false;
    };
  }, [token, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-md bg-sky-800 text-white flex items-center justify-center font-bold shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">ClassMark</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xs border border-slate-200 rounded-lg sm:px-8 text-center">
          {status === "loading" && (
            <div className="py-6 flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-sky-800 animate-spin mb-4" />
              <h3 className="text-base font-semibold text-slate-900">Verifying Email Address</h3>
              <p className="text-xs text-slate-500 mt-2">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-6 flex flex-col items-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-4" />
              <h3 className="text-base font-semibold text-slate-900">Email Verified Successfully</h3>
              <p className="text-xs text-slate-600 mt-2 mb-6">{message}</p>
              <Button
                variant="primary"
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="py-6 flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-rose-600 mb-4" />
              <h3 className="text-base font-semibold text-slate-900">Verification Failed</h3>
              <p className="text-xs text-rose-700 mt-2 mb-6">{message}</p>
              <div className="space-y-3 w-full">
                <Link
                  href="/login"
                  className="block w-full py-2 px-4 text-xs font-semibold text-center text-white bg-sky-800 hover:bg-sky-900 rounded-md"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-800 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
