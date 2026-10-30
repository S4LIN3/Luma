import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { tokens } from "../../design-system/tokens";

export interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  align = "center",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const alignments = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 10, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={tokens.springs.gentle}
            className={clsx(
              "absolute z-50 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-3",
              alignments[align],
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
