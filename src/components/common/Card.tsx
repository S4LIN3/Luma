import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "solid" | "bordered";
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = "glass",
  children,
  ...props
}) => {
  const baseStyles = "rounded-2xl transition-all duration-200";
  const variants = {
    glass: "bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20",
    solid: "bg-slate-900 border border-slate-800 shadow-md",
    bordered: "border border-white/15 bg-transparent",
  };

  return (
    <div className={twMerge(clsx(baseStyles, variants[variant], className))} {...props}>
      {children}
    </div>
  );
};
