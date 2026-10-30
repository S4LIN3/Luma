import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { tokens } from "../../design-system/tokens";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "subtle" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-xl select-none transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:opacity-40 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30",
      secondary:
        "bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-800 text-slate-100 border border-white/10 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-slate-100 dark:border-white/10 light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-800 light:border-slate-300",
      subtle:
        "bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-200 border border-white/5",
      ghost:
        "bg-transparent hover:bg-white/5 active:bg-white/10 text-slate-300 hover:text-white",
      danger:
        "bg-rose-600/90 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm shadow-rose-600/20",
    };

    const sizes = {
      sm: "px-2.5 py-1 text-xs gap-1.5",
      md: "px-3.5 py-1.5 text-sm gap-2",
      lg: "px-4.5 py-2 text-base gap-2.5",
      icon: "p-2 rounded-xl",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled ? 1 : 0.96 }}
        transition={tokens.springs.snappy}
        disabled={disabled}
        className={twMerge(clsx(base, variants[variant], sizes[size], className))}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
