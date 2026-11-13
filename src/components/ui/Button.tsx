"use client";
import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-navy-700 text-white hover:bg-navy-800",
  secondary:
    "border border-line bg-white text-ink hover:border-navy-200 hover:bg-navy-50",
  ghost: "text-muted hover:bg-navy-50 hover:text-navy-700",
  danger:
    "bg-red-50 text-red-600 ring-1 ring-red-100 hover:bg-red-600 hover:text-white",
};

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4.5 text-sm gap-2",
};

/** Pill button with brand variants and a subtle press animation. */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", size = "md", ...props }, ref) => {
    const mergedClasses = [
      "inline-flex cursor-pointer select-none items-center justify-center rounded-full font-semibold whitespace-nowrap",
      "transition-colors duration-150",
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy-500/20",
      "disabled:pointer-events-none disabled:opacity-50",
      variants[variant],
      sizes[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button className={mergedClasses} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
