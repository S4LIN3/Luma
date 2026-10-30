import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { tokens } from "../../design-system/tokens";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled,
  size = "md",
  className,
  id,
}) => {
  const isSm = size === "sm";

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex flex-shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed",
        isSm ? "h-5 w-9" : "h-6 w-11",
        checked ? "bg-indigo-600" : "bg-slate-700/80 dark:bg-slate-800",
        className
      )}
    >
      <motion.span
        layout
        transition={tokens.springs.snappy}
        className={clsx(
          "pointer-events-none block rounded-full bg-white shadow-md ring-0",
          isSm ? "h-4 w-4" : "h-5 w-5",
          checked ? (isSm ? "translate-x-4" : "translate-x-5") : "translate-x-0"
        )}
      />
    </button>
  );
};
