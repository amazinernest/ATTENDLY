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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-md bg-sky-800 text-white flex items-center justify-center font-bold shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">ClassMark</span>
        </Link>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-slate-900">
          Create Lecturer Account
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Set up your private academic workspace for attendance management
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-8">
          {registeredUser ? (
            <div className="py-2 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Registration Successful
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Welcome to ClassMark, {registeredUser.fullName}!
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  You are successfully registered! Your academic lecturer account has been created and verified. You now have full access to your lecturer workspace.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Lecturer Name:</span>
                  <span className="font-semibold text-slate-900">{registeredUser.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Institutional Email:</span>
                  <span className="font-semibold text-slate-900">{registeredUser.email}</span>
                </div>
                {registeredUser.institution && (
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Institution:</span>
                    <span className="font-semibold text-slate-900">{registeredUser.institution}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Session Status:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Verified & Logged In
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={enterPortal}
                  className="w-full py-3 px-4 bg-sky-800 hover:bg-sky-900 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Enter the Portal</span>
                  <span className="text-xs bg-sky-700 px-2 py-0.5 rounded font-mono">Dashboard →</span>
                </button>

                <p className="text-[11px] text-slate-400">
                  Entering portal automatically in {countdown}s, or click the button above to enter immediately.
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500">
                  <Link to="/login" className="text-sky-700 hover:text-sky-900 font-medium hover:underline">
                    Sign In Screen
                  </Link>
                  <span>•</span>
                  <Link to="/courses/new" className="text-sky-700 hover:text-sky-900 font-medium hover:underline">
                    Create Course Directly
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-700 focus:border-sky-700"
                    placeholder="Dr. Samuel Adebayo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Institutional Email *</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-700 focus:border-sky-700"
                    placeholder="s.adebayo@university.edu.ng"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Institution (Optional)</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <input
                      name="institution"
                      type="text"
                      value={formData.institution}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-700 focus:border-sky-700"
                      placeholder="University of Ibadan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Department (Optional)</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <input
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-700 focus:border-sky-700"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Password *</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-700 focus:border-sky-700"
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Confirm Password *</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-700 focus:border-sky-700"
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-slate-300 text-sky-800 focus:ring-sky-700"
                  />
                  <span>
                    I confirm that I am an authorized academic lecturer and agree to the terms of service.
                  </span>
                </label>
              </div>

              <div className="pt-3">
                <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                  Register Academic Account
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-sky-700 hover:text-sky-800 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
