import React, { useState, useEffect } from "react";
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
  PlusCircle,
  Sparkles,
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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-close drawer if screen is resized to desktop width (lg+)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setMobileOpen(false);
      }
    };
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    } finally {
      navigate("/login");
    }
  };

  const navLinks = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: "My Courses",
      href: "/courses",
      icon: BookOpen,
      active: pathname.startsWith("/courses") && !pathname.includes("/reports"),
    },
    {
      label: "Attendance Reports",
      href: "/courses",
      icon: FileSpreadsheet,
      active: pathname.includes("/reports"),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ];

  return (
    <>
      <header className="h-16 border-b border-black/[0.06] bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Hamburger button on screens smaller than lg */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-stone-700 hover:text-black rounded-full hover:bg-black/5 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Mobile brand indicator */}
          <Link to="/dashboard" className="flex lg:hidden items-center gap-2 focus:outline-none">
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-4 h-4 text-[#d7f837]" />
            </div>
            <span className="font-extrabold text-[#111111] text-sm tracking-tight">CLASSMARK</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Academic Portal Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Create Course shortcut on medium+ screens */}
          <Link
            to="/courses/new"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-full shadow-xs transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#d7f837]" />
            <span>Create Course</span>
          </Link>

          {/* Time Zone Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-[#edebe4] text-stone-700 rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <span>{user?.timeZone || "Africa/Lagos"}</span>
          </div>

          {/* User profile capsule */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-black/[0.06]">
            <div className="w-8 h-8 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-extrabold text-xs shadow-2xs border border-black/5">
              {user?.fullName ? user.fullName[0].toUpperCase() : "L"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-stone-900 leading-tight truncate max-w-[140px]">
                {user?.fullName || "Lecturer"}
              </p>
              <p className="text-[11px] text-stone-500 font-medium leading-tight truncate max-w-[140px]">
                {user?.institution || "Verified Staff"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="text-stone-400 hover:text-rose-600 p-2 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
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
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-76 max-w-[85vw] bg-[#faf9f5] shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-black/[0.06] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold shadow-xs">
                  <GraduationCap className="w-4 h-4 text-[#d7f837]" />
                </div>
                <div>
                  <h2 className="font-extrabold text-stone-900 text-sm leading-tight tracking-tight">CLASSMARK</h2>
                  <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                    Academic Portal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:text-black cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Pill in Drawer */}
            <div className="p-4 border-b border-black/[0.06] bg-[#edebe4]/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {user?.fullName ? user.fullName[0].toUpperCase() : "L"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-stone-900 truncate">
                    {user?.fullName || "Lecturer"}
                  </p>
                  <p className="text-xs text-stone-500 truncate">
                    {user?.email}
                  </p>
                  <p className="text-[11px] font-semibold text-stone-700 truncate">
                    {user?.institution || "Academic Staff"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action in Mobile Menu */}
            <div className="p-3 border-b border-black/[0.06]">
              <Link
                to="/courses/new"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-white bg-[#111111] hover:bg-black rounded-full shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-[#d7f837]" />
                <span>Create Academic Course</span>
              </Link>
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
              <p className="px-3 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Workspace
              </p>
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all",
                      item.active
                        ? "bg-[#111111] text-white shadow-xs"
                        : "text-stone-700 hover:bg-stone-200/60"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", item.active ? "text-[#d7f837]" : "text-stone-400")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer Details & Logout */}
            <div className="p-4 border-t border-black/[0.06] bg-white space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{user?.timeZone || "Africa/Lagos"}</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Online
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors cursor-pointer"
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
