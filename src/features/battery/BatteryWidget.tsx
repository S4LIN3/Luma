import React from "react";
import { BatteryStatus } from "../../core/types";
import { Card } from "../../components/common/Card";
import { Battery, BatteryCharging, Zap } from "lucide-react";

interface BatteryWidgetProps {
  battery: BatteryStatus | null;
}

export const BatteryWidget: React.FC<BatteryWidgetProps> = ({ battery }) => {
  if (!battery) return null;

  const isCharging = battery.state === "Charging";

  return (
    <Card className="p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Power & Battery</span>
        </div>
        <span className="text-xs font-mono font-medium text-slate-200">
          {battery.percentage}%
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            {isCharging ? (
              <BatteryCharging className="w-5 h-5 text-amber-400" />
            ) : (
              <Battery className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white capitalize">
              {battery.state}
            </span>
            <span className="text-[11px] text-slate-400">
              {battery.time_to_empty_minutes
                ? `${Math.floor(battery.time_to_empty_minutes / 60)}h ${battery.time_to_empty_minutes % 60}m remaining`
                : "Profile: " + battery.power_profile}
            </span>
          </div>
        </div>
      </div>

      {/* Battery level indicator */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${battery.percentage}%` }}
        />
      </div>
    </Card>
  );
};
