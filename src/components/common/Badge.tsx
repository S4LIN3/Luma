import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "neutral";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  children,
  ...props
}) => {
  const base = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide transition-colors";
  const variants = {
    primary: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
    secondary: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    danger: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    neutral: "bg-slate-800/60 text-slate-300 border border-slate-700/50",
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], className))} {...props}>
      {children}
    </span>
  );
};
