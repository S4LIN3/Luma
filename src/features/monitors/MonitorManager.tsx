import React from "react";
import { MonitorConfiguration } from "../../core/types";
import { Card } from "../../components/common/Card";
import { Monitor, CheckCircle2 } from "lucide-react";

interface MonitorManagerProps {
  monitors: MonitorConfiguration | null;
}

export const MonitorManager: React.FC<MonitorManagerProps> = ({ monitors }) => {
  if (!monitors) return null;

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Monitor className="w-3.5 h-3.5 text-indigo-400" />
          <span>Connected Displays</span>
        </div>
        <span className="text-[11px] text-slate-400">
          {monitors.monitors.length} Displays Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {monitors.monitors.map((mon) => (
          <div
            key={mon.id}
            className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 truncate">
                {mon.name}
              </span>
              {mon.is_primary && (
                <span className="flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Primary
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>
                {mon.width}x{mon.height} @ {mon.refresh_rate_hz}Hz
              </span>
              <span>Scale {mon.scale_factor}x</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
