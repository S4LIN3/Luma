import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { tokens } from "../../design-system/tokens";

export interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "surface" | "elevated" | "subtle" | "outline";
  hoverable?: boolean;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "surface", hoverable = false, children, ...props }, ref) => {
    const base = "rounded-2xl transition-colors duration-150 relative overflow-hidden";

    const variants = {
      surface:
        "bg-slate-900/70 dark:bg-slate-900/70 light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200/80 shadow-sm",
      elevated:
        "bg-slate-800/80 dark:bg-slate-850/80 light:bg-slate-50 border border-white/15 dark:border-white/15 light:border-slate-300 shadow-md",
      subtle:
        "bg-white/[0.03] dark:bg-white/[0.03] light:bg-slate-100/50 border border-white/5 dark:border-white/5 light:border-slate-200",
      outline:
        "bg-transparent border border-white/15 dark:border-white/15 light:border-slate-300",
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hoverable ? { y: -2, transition: tokens.springs.bouncy } : undefined}
        className={twMerge(clsx(base, variants[variant], className))}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
