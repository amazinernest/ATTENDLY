"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  GraduationCap,
  Clock,
  LogOut,
  User,
  Settings,
  BookOpen,
  LayoutDashboard,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user?: {
    fullName: string;
    email: string;
    institution?: string | null;
    timeZone?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      window.location.href = "/login";
    }
  };

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Courses", href: "/courses", icon: BookOpen },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Academic Portal Active</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Zone Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{user?.timeZone || "Africa/Lagos"}</span>
          </div>

          {/* User profile capsule */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs border border-slate-300">
              {user?.fullName ? user.fullName[0].toUpperCase() : "L"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.fullName || "Lecturer"}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                {user?.institution || "Verified Staff"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/50">
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <GraduationCap className="w-6 h-6 text-sky-800" />
                <span>ClassMark</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-md text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="mt-4 space-y-1 flex-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium",
                      pathname === item.href
                        ? "bg-sky-50 text-sky-900 font-semibold"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
