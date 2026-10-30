import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "secondary",
  size = "md",
  children,
  ...props
}) => {
  const base = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25",
    secondary: "bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-white/10",
    ghost: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white",
    danger: "bg-rose-600/80 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-2.5",
    icon: "p-2 rounded-xl",
  };

  return (
    <button className={twMerge(clsx(base, variants[variant], sizes[size], className))} {...props}>
      {children}
    </button>
  );
};
