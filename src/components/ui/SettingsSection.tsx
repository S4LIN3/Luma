import React from "react";
import { clsx } from "clsx";
import { Card } from "./Card";

export interface SettingsRowProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  borderBottom?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  title,
  description,
  icon,
  children,
  borderBottom = true,
}) => {
  return (
    <div
      className={clsx(
        "flex items-center justify-between p-4 gap-4",
        borderBottom && "border-b border-white/5 dark:border-white/5 light:border-slate-100"
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 dark:text-indigo-400 light:text-indigo-600 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-slate-100 dark:text-slate-100 light:text-slate-900 truncate">
            {title}
          </span>
          {description && (
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0 flex items-center">{children}</div>
    </div>
  );
};

export interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      {title && (
        <div className="px-1 flex flex-col">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-600">
            {title}
          </h3>
          {description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-500 light:text-slate-400">
              {description}
            </p>
          )}
        </div>
      )}
      <Card variant="surface" className="flex flex-col divide-y-0">
        {children}
      </Card>
    </div>
  );
};
