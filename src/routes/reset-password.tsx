import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { GraduationCap, Lock, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage("Missing or invalid password reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to reset password.");
      } else {
        setSuccess(true);
      }
    } catch {
      setErrorMessage("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          Create New Password
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-medium max-w-xs mx-auto">
          Choose a secure password for your lecturer account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-9 shadow-sm border border-black/[0.06] rounded-[28px] sm:rounded-[32px]">
          {success ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-full bg-[#d7f837] text-black mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">Password Reset Complete</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Your password has been successfully updated. You may now sign in with your new credentials.
              </p>
              <div className="pt-2">
                <Button variant="primary" className="w-full py-3" onClick={() => navigate("/login")}>
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  New Password
                </label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading}>
                  <span>Update Password</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-black hover:underline"
                >
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
