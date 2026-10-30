import React from "react";
import { BluetoothStatus } from "../../core/types";
import { Card } from "../../components/common/Card";
import { Toggle } from "../../components/common/Toggle";
import { Bluetooth, Headphones, MousePointer } from "lucide-react";

interface BluetoothWidgetProps {
  bluetooth: BluetoothStatus | null;
  onToggle: () => void;
}

export const BluetoothWidget: React.FC<BluetoothWidgetProps> = ({
  bluetooth,
  onToggle,
}) => {
  if (!bluetooth) return null;

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Bluetooth className="w-3.5 h-3.5 text-indigo-400" />
          <span>Bluetooth</span>
        </div>
        <Toggle checked={bluetooth.is_enabled} onChange={onToggle} />
      </div>

      <div className="space-y-2">
        {bluetooth.devices.map((device) => (
          <div
            key={device.address}
            className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs"
          >
            <div className="flex items-center gap-2.5">
              {device.name.toLowerCase().includes("mouse") ? (
                <MousePointer className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Headphones className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span className="text-slate-200 font-medium truncate max-w-[130px]">
                {device.name}
              </span>
            </div>
            {device.battery_percentage && (
              <span className="text-[11px] font-mono text-slate-400">
                {device.battery_percentage}%
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
