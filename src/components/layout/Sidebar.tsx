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
    <aside className="hidden lg:flex w-64 border-r border-slate-200 bg-white flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-sky-800 text-white flex items-center justify-center font-bold shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-lg leading-tight">
              ClassMark
            </h1>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Academic Attendance
            </p>
          </div>
        </Link>
      </div>

      {/* Primary Action */}
      <div className="px-4 py-3">
        <Link
          to="/courses/new"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-md shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Course</span>
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                item.active
                  ? "bg-sky-50 text-sky-900 border-l-3 border-sky-800 font-semibold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4",
                  item.active ? "text-sky-800" : "text-slate-400"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.fullName || "Lecturer"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.institution || user?.email || "Academic Staff"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
