import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { tokens } from "../../design-system/tokens";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delayMs?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delayMs = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timer, setTimer] = useState<any>(null);

  const handleMouseEnter = () => {
    const t = setTimeout(() => setIsVisible(true), delayMs);
    setTimer(t);
  };

  const handleMouseLeave = () => {
    if (timer) clearTimeout(timer);
    setIsVisible(false);
  };

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={tokens.springs.snappy}
            className={clsx(
              "absolute z-50 px-2 py-1 rounded-md text-[11px] font-medium tracking-wide bg-slate-900 text-slate-100 border border-white/10 shadow-lg whitespace-nowrap pointer-events-none",
              positions[position]
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
