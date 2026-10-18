import React, { useState } from "react";
import { Link, useNavigate, useSearchParams, redirect } from "react-router";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getUser } from "@/lib/session.server";

export async function loader({ request }: { request: Request }) {
  const user = await getUser(request);
  if (user) {
    throw redirect("/dashboard");
  }
  return null;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setUnverifiedEmail(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.unverified) {
          setUnverifiedEmail(data.email || email);
        }
        setErrorMessage(data.error || "Failed to sign in. Please verify your email and password.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Authentication successful! Entering your lecturer portal...");
      // Seamless immediate navigation
      window.location.href = from;
    } catch {
      setErrorMessage("Network error occurred. Please check your connection and try again.");
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
          Sign In
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-medium max-w-xs mx-auto">
          Manage university course registers, anti-proxy QR sessions, and semester reports
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-9 shadow-sm border border-black/[0.06] rounded-[28px] sm:rounded-[32px]">
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1 text-xs font-semibold">{successMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs leading-relaxed">
                <p className="font-semibold">{errorMessage}</p>
                {unverifiedEmail && (
                  <p className="mt-1.5 text-stone-600 font-medium">
                    Please check your institutional email inbox for your verification link.
                  </p>
                )}
                <p className="mt-2 text-rose-700">
                  Don&apos;t have an account yet?{" "}
                  <Link to="/register" className="font-bold underline hover:text-rose-900">
                    Register an account
                  </Link>
                </p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Institutional Email
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium"
                  placeholder="lecturer@university.edu.ng"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-stone-600 hover:text-black hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-11 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium"
                  placeholder="Enter your password"
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

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading}>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-black/[0.06] text-center">
            <p className="text-xs text-stone-500 font-medium">
              New lecturer on ClassMark?{" "}
              <Link to="/register" className="font-bold text-[#111111] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs font-semibold text-stone-500 hover:text-black transition-colors">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
