import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { tokens } from "../../design-system/tokens";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  divider?: boolean;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
  className?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ items, children, className }) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleClick = () => setPosition(null);
    if (position) {
      window.addEventListener("click", handleClick);
    }
    return () => window.removeEventListener("click", handleClick);
  }, [position]);

  return (
    <div onContextMenu={handleContextMenu} className={className}>
      {children}
      <AnimatePresence>
        {position && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={tokens.springs.snappy}
            style={{
              top: `${position.y}px`,
              left: `${position.x}px`,
            }}
            className="fixed z-50 min-w-[180px] p-1.5 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-white/10 shadow-2xl text-xs flex flex-col gap-0.5"
          >
            {items.map((item) => {
              if (item.divider) {
                return <div key={item.id} className="h-px bg-white/10 my-1" />;
              }
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick?.();
                    setPosition(null);
                  }}
                  className={clsx(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors font-medium select-none",
                    item.danger
                      ? "text-rose-400 hover:bg-rose-500/20 hover:text-rose-300"
                      : "text-slate-200 hover:bg-white/10 hover:text-white",
                    item.disabled && "opacity-40 pointer-events-none"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  {item.shortcut && (
                    <span className="text-[10px] font-mono text-slate-500">{item.shortcut}</span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
