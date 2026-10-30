import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { clsx } from "clsx";
import { tokens } from "../../design-system/tokens";

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface DropdownProps<T = string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (val: T) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Dropdown<T extends string | number>({
  value,
  options,
  onChange,
  disabled,
  className,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={clsx("relative inline-block w-full text-left", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 dark:bg-slate-900 border border-white/10 text-slate-200 hover:border-white/20 transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40",
          isOpen && "border-indigo-500/50"
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          {selectedOption?.label}
        </span>
        <ChevronDown
          className={clsx(
            "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180 text-white"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={tokens.springs.snappy}
            className="absolute left-0 right-0 z-50 p-1 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col gap-0.5">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors",
                      isSelected
                        ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opt.icon}
                      {opt.label}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 ml-2 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
