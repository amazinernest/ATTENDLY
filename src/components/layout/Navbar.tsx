import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Menu,
  X,
  GraduationCap,
  Clock,
  LogOut,
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
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Courses", href: "/courses", icon: BookOpen },
    { label: "Attendance Reports", href: "/courses", icon: FileSpreadsheet },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Hamburger button on screens smaller than lg */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-sky-700 cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="text-xs font-semibold text-slate-700 sm:hidden">Menu</span>
          </button>

          {/* Mobile brand indicator */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-7 h-7 rounded bg-sky-800 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">ClassMark</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Academic Portal Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Create Course shortcut on medium+ screens */}
          <Link
            to="/courses/new"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-800 hover:bg-sky-900 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <span>+ Create Course</span>
          </Link>

          {/* Time Zone Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{user?.timeZone || "Africa/Lagos"}</span>
          </div>

          {/* User profile capsule */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs border border-sky-200">
              {user?.fullName ? user.fullName[0].toUpperCase() : "L"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[140px]">
                {user?.fullName || "Lecturer"}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight truncate max-w-[140px]">
                {user?.institution || "Verified Staff"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col h-full z-10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-sky-800 text-white flex items-center justify-center font-bold shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base leading-tight">ClassMark</h2>
                  <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                    Academic Portal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Pill in Drawer */}
            <div className="p-4 border-b border-slate-100 bg-sky-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-800 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {user?.fullName ? user.fullName[0].toUpperCase() : "L"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {user?.fullName || "Lecturer"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                  <p className="text-[11px] font-medium text-sky-800 truncate">
                    {user?.institution || "Academic Staff"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action in Mobile Menu */}
            <div className="p-3 border-b border-slate-100">
              <Link
                to="/courses/new"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 text-xs font-bold text-white bg-sky-800 hover:bg-sky-900 rounded-md shadow-xs transition-colors"
              >
                <span>+ Create Academic Course</span>
              </Link>
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
              <p className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Navigation
              </p>
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-sky-50 text-sky-900 font-bold border-l-4 border-sky-800"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", active ? "text-sky-800" : "text-slate-400")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer Details & Logout */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.timeZone || "Africa/Lagos"}</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Online
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
