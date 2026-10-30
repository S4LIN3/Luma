import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { X, Bell, Check, AlertCircle } from "lucide-react";
import { tokens } from "../../design-system/tokens";

export type NotificationVariant = "default" | "success" | "warning" | "error";

export interface NotificationElementProps {
  id: string | number;
  title: string;
  message: string;
  appName?: string;
  timestamp?: string;
  variant?: NotificationVariant;
  onDismiss?: (id: string | number) => void;
  actions?: { label: string; onClick: () => void }[];
  className?: string;
}

export const NotificationElement: React.FC<NotificationElementProps> = ({
  id,
  title,
  message,
  appName = "Luma",
  timestamp = "Now",
  variant = "default",
  onDismiss,
  actions,
  className,
}) => {
  const icons = {
    default: <Bell className="w-4 h-4 text-indigo-400" />,
    success: <Check className="w-4 h-4 text-emerald-400" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400" />,
    error: <X className="w-4 h-4 text-rose-400" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={tokens.springs.fluid}
      className={clsx(
        "relative flex flex-col p-3 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200 shadow-xl overflow-hidden backdrop-blur-xl gap-2",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/5 dark:bg-white/5 light:bg-slate-100 flex items-center justify-center shrink-0">
            {icons[variant]}
          </div>
          <span className="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-600">
            {appName}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">• {timestamp}</span>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={() => onDismiss(id)}
            className="p-1 rounded-md text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-0.5 px-0.5">
        <span className="text-xs font-semibold text-white dark:text-white light:text-slate-900">
          {title}
        </span>
        <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 line-clamp-2">
          {message}
        </p>
      </div>

      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          {actions.map((act, i) => (
            <button
              key={i}
              type="button"
              onClick={act.onClick}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-200 transition-colors"
            >
              {act.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
