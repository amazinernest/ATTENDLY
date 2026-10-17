import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  Settings,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user?: {
    fullName: string;
    email: string;
    institution?: string | null;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const navItems = [
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    } finally {
      navigate("/login");
    }
  };

  return (
    <aside className="hidden lg:flex w-64 border-r border-black/[0.06] bg-white flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-black/[0.06]">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5 text-[#d7f837]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-[#111111] tracking-tight text-lg leading-tight">
                CLASSMARK
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d7f837]"></span>
            </div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
              Academic Attendance
            </p>
          </div>
        </Link>
      </div>

      {/* Primary Action */}
      <div className="px-4 py-3.5">
        <Link
          to="/courses/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-white bg-[#111111] hover:bg-black rounded-full shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4 text-[#d7f837]" />
          <span>Create Course</span>
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3.5 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all",
                item.active
                  ? "bg-[#111111] text-white shadow-xs"
                  : "text-stone-600 hover:bg-[#edebe4]/60 hover:text-black"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  item.active ? "text-[#d7f837]" : "text-stone-400"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-black/[0.06] bg-[#faf9f5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
            <div className="w-8 h-8 rounded-full bg-[#d7f837] text-black flex items-center justify-center font-extrabold text-xs shadow-2xs border border-black/5 shrink-0">
              {user?.fullName ? user.fullName[0].toUpperCase() : "L"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-stone-900 truncate">
                {user?.fullName || "Lecturer"}
              </p>
              <p className="text-[11px] text-stone-500 font-medium truncate">
                {user?.institution || user?.email || "Academic Staff"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
