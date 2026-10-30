import React from "react";
import { NotificationState } from "../../core/types";
import { Card } from "../../components/common/Card";
import { Bell, Check, Sparkles, Calendar } from "lucide-react";

interface NotificationCenterProps {
  notifications: NotificationState | null;
  onDismiss: (id: number) => void;
  onClearAll: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onDismiss,
  onClearAll,
}) => {
  if (!notifications) return null;

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>Notifications ({notifications.items.length})</span>
        </div>
        {notifications.items.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.items.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500">
            No active notifications
          </div>
        ) : (
          notifications.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                {item.icon === "Calendar" ? (
                  <Calendar className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {item.summary}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.app_name}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                  {item.body}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(item.id)}
                className="text-slate-500 hover:text-slate-200 transition-colors shrink-0"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
