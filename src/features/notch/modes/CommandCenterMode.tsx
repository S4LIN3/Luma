import React, { useState } from "react";
import { AudioStatus, NetworkStatus, BluetoothStatus } from "../../../core/types";
import { Slider } from "../../../components/ui/Slider";
import { Wifi, WifiOff, Bluetooth, Volume2, VolumeX, Sun } from "lucide-react";
import { clsx } from "clsx";

interface CommandCenterModeProps {
  audio: AudioStatus | null;
  network: NetworkStatus | null;
  bluetooth: BluetoothStatus | null;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleBluetooth: () => void;
}

export const CommandCenterMode: React.FC<CommandCenterModeProps> = ({
  audio,
  network,
  bluetooth,
  onVolumeChange,
  onToggleMute,
  onToggleBluetooth,
}) => {
  const [brightness, setBrightness] = useState(85);
  const [wifiEnabled, setWifiEnabled] = useState(network?.is_connected ?? true);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Quick Toggles Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Wi-Fi Control */}
        <button
          type="button"
          onClick={() => setWifiEnabled(!wifiEnabled)}
          className={clsx(
            "p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all",
            wifiEnabled
              ? "bg-indigo-600/20 border-indigo-500/40 text-white"
              : "bg-white/5 border-white/5 text-slate-400 hover:text-slate-200"
          )}
        >
          <div
            className={clsx(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
              wifiEnabled ? "bg-indigo-600 text-white" : "bg-white/10 text-slate-400"
            )}
          >
            {wifiEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate">
              {wifiEnabled ? network?.ssid || "Wi-Fi" : "Disconnected"}
            </span>
            <span className="text-[10px] text-slate-400">
              {wifiEnabled ? `${network?.signal_strength || 84}% • 5GHz` : "Off"}
            </span>
          </div>
        </button>

        {/* Bluetooth Control */}
        <button
          type="button"
          onClick={onToggleBluetooth}
          className={clsx(
            "p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all",
            bluetooth?.is_enabled
              ? "bg-purple-600/20 border-purple-500/40 text-white"
              : "bg-white/5 border-white/5 text-slate-400 hover:text-slate-200"
          )}
        >
          <div
            className={clsx(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
              bluetooth?.is_enabled ? "bg-purple-600 text-white" : "bg-white/10 text-slate-400"
            )}
          >
            <Bluetooth className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate">
              {bluetooth?.is_enabled
                ? bluetooth.devices[0]?.name || "Bluetooth"
                : "Bluetooth Off"}
            </span>
            <span className="text-[10px] text-slate-400">
              {bluetooth?.is_enabled
                ? `${bluetooth.devices.length} Devices`
                : "Disabled"}
            </span>
          </div>
        </button>
      </div>

      {/* Sliders for Volume & Display Brightness */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Volume Slider */}
        <div className="flex items-center gap-2.5 bg-white/5 p-2 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={onToggleMute}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {audio?.is_muted || audio?.volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            )}
          </button>
          <Slider
            value={audio?.is_muted ? 0 : audio?.volume ?? 68}
            min={0}
            max={100}
            onChange={onVolumeChange}
            showValue
            unit="%"
          />
        </div>

        {/* Brightness Slider */}
        <div className="flex items-center gap-2.5 bg-white/5 p-2 rounded-xl border border-white/5">
          <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          <Slider
            value={brightness}
            min={10}
            max={100}
            onChange={setBrightness}
            showValue
            unit="%"
          />
        </div>
      </div>
    </div>
  );
};
