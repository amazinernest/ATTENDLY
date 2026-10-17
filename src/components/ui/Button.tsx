import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variantStyles = {
      primary: "bg-[#111111] text-white hover:bg-black active:bg-stone-900 shadow-xs rounded-full hover:scale-[1.01] active:scale-[0.99]",
      accent: "bg-[#d7f837] text-black hover:bg-[#cbf028] active:bg-[#bedf20] font-bold rounded-full shadow-xs hover:scale-[1.01] active:scale-[0.99]",
      secondary: "bg-[#edebe4] text-stone-900 hover:bg-[#e4e2db] active:bg-[#dbd9d2] rounded-full",
      outline: "border border-black/[0.12] bg-white text-stone-800 hover:bg-[#faf9f5] active:bg-[#f0eee8] rounded-full shadow-2xs",
      destructive: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-xs rounded-full",
      ghost: "text-stone-600 hover:text-stone-900 hover:bg-black/5 rounded-full",
    };

    const sizeStyles = {
      sm: "h-8 px-3.5 text-xs gap-1.5",
      md: "h-9 px-4 text-xs sm:text-sm gap-2",
      lg: "h-11 px-6 text-sm sm:text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
