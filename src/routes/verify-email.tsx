import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { GraduationCap, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
            window.location.href = "/dashboard";
          }, 1500);
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
  }, [token]);

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#161616] font-sans flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#d7f837] selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5 focus:outline-none group">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5 text-[#d7f837]" />
          </div>
          <span className="font-extrabold text-[#111111] tracking-tight text-2xl">
            CLASSMARK
          </span>
          <span className="w-2 h-2 rounded-full bg-[#d7f837]"></span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111]">
          Email Verification
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-medium max-w-xs mx-auto">
          Verifying your institutional lecturer identity
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-9 shadow-sm border border-black/[0.06] rounded-[28px] sm:rounded-[32px] text-center space-y-4">
          {status === "loading" && (
            <div className="space-y-4 py-4">
              <Loader2 className="w-10 h-10 text-black animate-spin mx-auto" />
              <p className="text-xs text-stone-600 font-medium">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4 py-2">
              <div className="w-14 h-14 rounded-full bg-[#d7f837] text-black mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">Verified Successfully!</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{message}</p>
              <div className="pt-2">
                <Button variant="primary" className="w-full py-3" onClick={() => (window.location.href = "/dashboard")}>
                  <span>Go to Workspace</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4 py-2">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">Verification Failed</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{message}</p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 text-xs font-bold text-white bg-[#111111] hover:bg-black rounded-full transition-all shadow-xs"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
