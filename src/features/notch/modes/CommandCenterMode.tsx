import React from "react";
import { AudioStatus, NetworkStatus, BluetoothStatus, BrightnessStatus } from "../../../core/types";
import { Slider } from "../../../components/ui/Slider";
import { Wifi, WifiOff, Bluetooth, Volume2, VolumeX, Sun } from "lucide-react";
import { clsx } from "clsx";

interface CommandCenterModeProps {
  audio: AudioStatus | null;
  network: NetworkStatus | null;
  bluetooth: BluetoothStatus | null;
  brightness: BrightnessStatus | null;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleWifi: () => void;
  onToggleBluetooth: () => void;
  onBrightnessChange: (percent: number) => void;
}

export const CommandCenterMode: React.FC<CommandCenterModeProps> = ({
  audio,
  network,
  bluetooth,
  brightness,
  onVolumeChange,
  onToggleMute,
  onToggleWifi,
  onToggleBluetooth,
  onBrightnessChange,
}) => {
  const isWifiEnabled = network?.wifi_enabled ?? true;
  const isConnected = network?.is_connected ?? false;
  const isBluetoothEnabled = bluetooth?.is_enabled ?? false;
  const connectedBtDevice = bluetooth?.devices?.find((d) => d.is_connected);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Quick Toggles Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Wi-Fi Control */}
        <button
          type="button"
          onClick={onToggleWifi}
          className={clsx(
            "p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all",
            isWifiEnabled
              ? "bg-indigo-600/20 border-indigo-500/40 text-white"
              : "bg-white/5 border-white/5 text-slate-400 hover:text-slate-200"
          )}
        >
          <div
            className={clsx(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
              isWifiEnabled ? "bg-indigo-600 text-white" : "bg-white/10 text-slate-400"
            )}
          >
            {isWifiEnabled && isConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate">
              {isWifiEnabled
                ? network?.ssid || (isConnected ? "Connected" : "Wi-Fi On")
                : "Wi-Fi Off"}
            </span>
            <span className="text-[10px] text-slate-400">
              {isWifiEnabled && isConnected
                ? `${network?.signal_strength || 80}% • ${network?.interface_name || "wlan0"}`
                : isWifiEnabled
                ? "Searching..."
                : "Disabled"}
            </span>
          </div>
        </button>

        {/* Bluetooth Control */}
        <button
          type="button"
          onClick={onToggleBluetooth}
          className={clsx(
            "p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all",
            isBluetoothEnabled
              ? "bg-purple-600/20 border-purple-500/40 text-white"
              : "bg-white/5 border-white/5 text-slate-400 hover:text-slate-200"
          )}
        >
          <div
            className={clsx(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
              isBluetoothEnabled ? "bg-purple-600 text-white" : "bg-white/10 text-slate-400"
            )}
          >
            <Bluetooth className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate">
              {isBluetoothEnabled
                ? connectedBtDevice?.name || bluetooth?.adapter_name || "Bluetooth"
                : "Bluetooth Off"}
            </span>
            <span className="text-[10px] text-slate-400">
              {isBluetoothEnabled
                ? `${bluetooth?.devices?.length || 0} Paired Devices`
                : "Disabled"}
            </span>
          </div>
        </button>
      </div>

      {/* Sliders for Volume & Display Brightness */}
      <div className="flex flex-col gap-2 pt-1">
        {/* PipeWire Volume Slider */}
        <div className="flex items-center gap-2.5 bg-white/5 p-2 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={onToggleMute}
            className="text-slate-400 hover:text-white transition-colors"
            title={audio?.is_muted ? "Unmute" : "Mute"}
          >
            {audio?.is_muted || audio?.volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            )}
          </button>
          <Slider
            value={audio?.is_muted ? 0 : audio?.volume ?? 80}
            min={0}
            max={100}
            onChange={onVolumeChange}
            showValue
            unit="%"
          />
        </div>

        {/* Screen Backlight Brightness Slider */}
        <div className="flex items-center gap-2.5 bg-white/5 p-2 rounded-xl border border-white/5">
          <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          <Slider
            value={brightness?.percentage ?? 75}
            min={1}
            max={100}
            onChange={onBrightnessChange}
            showValue
            unit="%"
          />
        </div>
      </div>
    </div>
  );
};
