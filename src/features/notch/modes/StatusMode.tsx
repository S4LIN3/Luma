import React from "react";
import { BatteryStatus } from "../../../core/types";
import { Battery, BatteryCharging, CloudSun, Wind, Droplets } from "lucide-react";

interface StatusModeProps {
  battery: BatteryStatus | null;
}

export const StatusMode: React.FC<StatusModeProps> = ({ battery }) => {
  const isCharging = battery?.state === "Charging";

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="grid grid-cols-2 gap-2.5">
        {/* Battery Telemetry Card */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Power & Battery
            </span>
            {isCharging ? (
              <BatteryCharging className="w-4 h-4 text-amber-400" />
            ) : (
              <Battery className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-white">
                {battery?.percentage ?? 88}%
              </span>
              <span className="text-xs text-slate-400 capitalize">
                {battery?.state ?? "Discharging"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {battery?.time_to_empty_minutes
                ? `${Math.floor(battery.time_to_empty_minutes / 60)}h ${battery.time_to_empty_minutes % 60}m remaining`
                : battery?.time_to_full_minutes
                ? `${Math.floor(battery.time_to_full_minutes / 60)}h ${battery.time_to_full_minutes % 60}m to full`
                : `${battery?.power_profile || "Balanced"} Profile`}
              {battery?.energy_rate_watts ? ` • ${battery.energy_rate_watts.toFixed(1)}W` : ""}
            </p>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full"
              style={{ width: `${battery?.percentage ?? 88}%` }}
            />
          </div>
        </div>

        {/* Weather Card */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Pop!_OS Studio
            </span>
            <CloudSun className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-white">21°C</span>
              <span className="text-xs text-slate-400">Partly Sunny</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-cyan-400" />
                12 km/h
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-blue-400" />
                48%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
