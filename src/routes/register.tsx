import React, { useState } from "react";
import { Link, useNavigate, redirect } from "react-router";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Building,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    institution: "",
    department: "",
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<{
    fullName: string;
    email: string;
    institution?: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(5);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const enterPortal = () => {
    window.location.href = "/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage("Please accept the terms of service and privacy notice to continue.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Registration failed. Please check your information.");
        setIsLoading(false);
        return;
      }

      setRegisteredUser({
        fullName: formData.fullName,
        email: formData.email,
        institution: formData.institution,
      });

      // Start countdown to redirect
      let count = 5;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          window.location.href = "/dashboard";
        }
      }, 1000);
    } catch {
      setErrorMessage("Network error occurred. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#161616] font-sans flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#d7f837] selection:text-black">
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
          Create Lecturer Account
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-medium max-w-xs mx-auto">
          Set up your academic workspace for university attendance management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-9 shadow-sm border border-black/[0.06] rounded-[28px] sm:rounded-[32px]">
          {registeredUser ? (
            <div className="py-2 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#d7f837] text-black mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-9 h-9 text-black" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-semibold rounded-full mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#d7f837]" />
                  Registration Successful
                </span>
                <h3 className="text-xl font-extrabold text-[#111111]">
                  Welcome to ClassMark, {registeredUser.fullName}!
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                  Your academic lecturer workspace has been initialized. You now have full access to class rosters, dynamic QR sessions, and semester reports.
                </p>
              </div>

              <div className="p-4 bg-[#faf9f5] border border-black/[0.06] rounded-2xl text-left text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-black/[0.04]">
                  <span className="text-stone-500 font-medium">Lecturer Name:</span>
                  <span className="font-bold text-[#111111]">{registeredUser.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/[0.04]">
                  <span className="text-stone-500 font-medium">Institutional Email:</span>
                  <span className="font-bold text-[#111111]">{registeredUser.email}</span>
                </div>
                {registeredUser.institution && (
                  <div className="flex justify-between py-1 border-b border-black/[0.04]">
                    <span className="text-stone-500 font-medium">Institution:</span>
                    <span className="font-bold text-[#111111]">{registeredUser.institution}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-stone-500 font-medium">Session Status:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Verified & Logged In
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={enterPortal}
                  className="w-full py-3.5 px-4 bg-[#111111] hover:bg-black text-white font-bold text-sm rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                >
                  <span>Enter Lecturer Workspace</span>
                  <ArrowRight className="w-4 h-4 text-[#d7f837]" />
                </button>

                <p className="text-[11px] text-stone-400 font-medium">
                  Entering portal automatically in {countdown}s, or click the button above to enter immediately.
                </p>

                <div className="pt-2 border-t border-black/[0.06] flex items-center justify-center gap-4 text-xs text-stone-500">
                  <Link to="/login" className="text-black font-semibold hover:underline">
                    Sign In Screen
                  </Link>
                  <span>•</span>
                  <Link to="/courses/new" className="text-black font-semibold hover:underline">
                    Create Course Directly
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium"
                    placeholder="Dr. Samuel Adebayo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Institutional Email *
                </label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium"
                    placeholder="s.adebayo@university.edu.ng"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Institution (Optional)
                  </label>
                  <div className="mt-1.5 relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <input
                      name="institution"
                      type="text"
                      value={formData.institution}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium"
                      placeholder="University of Ibadan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Department (Optional)
                  </label>
                  <div className="mt-1.5 relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <input
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Password *
                  </label>
                  <div className="mt-1.5 relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={handleChange}
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
                    Confirm Password *
                  </label>
                  <div className="mt-1.5 relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-10 py-2.5 text-sm border border-black/[0.1] rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-stone-50/50 transition-all font-medium"
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-black/20 text-black focus:ring-black accent-black"
                  />
                  <span>
                    I confirm that I am an authorized academic lecturer and agree to the institutional terms of service and academic integrity standards.
                  </span>
                </label>
              </div>

              <div className="pt-3">
                <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading}>
                  <span>Register Academic Account</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-black/[0.06] text-center">
            <p className="text-xs text-stone-500 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-[#111111] hover:underline">
                Sign in to workspace
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
