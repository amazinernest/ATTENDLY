import React, { useState } from "react";
import { Link } from "react-router";
import { GraduationCap, Mail, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit request.");
      } else {
        setMessage(data.message);
      }
    } catch {
      setError("A network error occurred. Please try again.");
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
          Reset Your Password
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-medium max-w-xs mx-auto">
          Enter your registered institutional email address to receive password reset instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-9 shadow-sm border border-black/[0.06] rounded-[28px] sm:rounded-[32px]">
          {message ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold text-emerald-900">Request Received</p>
                  <p className="mt-1 text-emerald-700">{message}</p>
                </div>
              </div>
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-black hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to sign in</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Registered Institutional Email
                </label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium"
                    placeholder="lecturer@university.edu.ng"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading}>
                  <span>Send Reset Email</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-black hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to sign in</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
