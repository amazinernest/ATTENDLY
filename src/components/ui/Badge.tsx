import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "dark" | "success" | "warning" | "destructive" | "outline" | "slate";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-[#d7f837] text-black border-black/10 font-bold",
    accent: "bg-[#d7f837] text-black border-black/10 font-bold",
    dark: "bg-[#111111] text-white border-transparent font-semibold",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold",
    warning: "bg-amber-50 text-amber-900 border-amber-200 font-semibold",
    destructive: "bg-rose-50 text-rose-800 border-rose-200 font-semibold",
    outline: "bg-white/80 text-stone-700 border-black/10 font-medium",
    slate: "bg-[#edebe4] text-stone-800 border-black/5 font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border shadow-2xs",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
