import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface DashboardLayoutProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    institution?: string | null;
    timeZone?: string;
  };
  children: React.ReactNode;
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex bg-[#faf9f5] text-[#161616] font-sans antialiased selection:bg-[#d7f837] selection:text-black">
      {/* Persistent Left Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
