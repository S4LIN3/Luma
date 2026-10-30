import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NotchState,
  MediaStatus,
  AudioStatus,
  NetworkStatus,
  BluetoothStatus,
  BatteryStatus,
  NotificationState,
  VisualizerBands,
} from "../../core/types";
import { MusicMode } from "./modes/MusicMode";
import { CommandCenterMode } from "./modes/CommandCenterMode";
import { StatusMode } from "./modes/StatusMode";
import { CalendarMode } from "./modes/CalendarMode";
import { LumaApi } from "../../core/services/tauri";
import { tokens } from "../../design-system/tokens";
import {
  Music,
  Sliders,
  Battery,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { clsx } from "clsx";

export type ActiveNotchTab = "music" | "command" | "status" | "calendar";

interface NotchIslandProps {
  notch: NotchState;
  media: MediaStatus | null;
  audio: AudioStatus | null;
  network: NetworkStatus | null;
  bluetooth: BluetoothStatus | null;
  battery: BatteryStatus | null;
  notifications: NotificationState | null;
  onMediaToggle: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleBluetooth: () => void;
}

export const NotchIsland: React.FC<NotchIslandProps> = ({
  notch,
  media,
  audio,
  network,
  bluetooth,
  battery,
  onMediaToggle,
  onVolumeChange,
  onToggleMute,
  onToggleBluetooth,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveNotchTab>("music");
  const [isHovered, setIsHovered] = useState(false);
  const [bands, setBands] = useState<VisualizerBands>({
    sub_bass: 0.7,
    bass: 0.85,
    midrange: 0.6,
    upper_mid: 0.45,
    treble: 0.35,
    is_live_dsp: false,
  });

  // Poll visualizer bands when music is playing and notch is expanded
  useEffect(() => {
    let animId: any = null;
    let isMounted = true;

    const pollBands = async () => {
      if (isExpanded && activeTab === "music" && media?.playback_state === "Playing") {
        try {
          const b = await LumaApi.getVisualizerBands();
          if (isMounted) setBands(b);
        } catch {
          // fallback
        }
      }
      animId = setTimeout(pollBands, 80);
    };

    pollBands();
    return () => {
      isMounted = false;
      if (animId) clearTimeout(animId);
    };
  }, [isExpanded, activeTab, media?.playback_state]);

  // Synchronize native window dimensions with expanded/collapsed state
  useEffect(() => {
    const targetWidth = isExpanded ? 460 : notch.geometry.width;
    const targetHeight = isExpanded ? 340 : notch.geometry.height;
    LumaApi.resizeNotchSurface(targetWidth, targetHeight).catch(() => {});
  }, [isExpanded, notch.geometry.width, notch.geometry.height]);

  // Handle transport controls
  const handleNext = async () => {
    await LumaApi.mediaNext();
  };

  const handlePrevious = async () => {
    await LumaApi.mediaPrevious();
  };

  const isPlaying = media?.playback_state === "Playing";

  return (
    <div className="flex flex-col items-center select-none w-full">
      <motion.div
        layout
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{
          width: isExpanded ? 460 : notch.geometry.width,
          minHeight: isExpanded ? 340 : notch.geometry.height,
          borderRadius: isExpanded ? 24 : notch.geometry.border_radius,
        }}
        transition={tokens.springs.fluid}
        className={clsx(
          "relative bg-slate-950/90 dark:bg-slate-950/90 light:bg-white/95 text-slate-100 dark:text-slate-100 light:text-slate-900 border border-white/10 dark:border-white/10 light:border-slate-300 shadow-2xl backdrop-blur-2xl overflow-hidden p-2 flex flex-col justify-between cursor-pointer",
          isHovered && !isExpanded && "scale-[1.02] border-indigo-500/30"
        )}
      >
        {/* Top Header Row (Always visible) */}
        <div className="flex items-center justify-between px-2.5 py-0.5 w-full h-7">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "w-2 h-2 rounded-full transition-colors",
                isPlaying ? "bg-emerald-400 animate-pulse" : "bg-indigo-400"
              )}
            />
            <span className="text-xs font-semibold tracking-wide truncate max-w-[140px]">
              {isPlaying && media?.current_track
                ? media.current_track.title
                : notch.active_title || "Luma Desktop"}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            {/* Visualizer wave icon in header when playing in compact mode */}
            {isPlaying && !isExpanded && (
              <span className="flex items-center gap-0.5 text-indigo-400">
                <span className="w-0.5 h-2 bg-indigo-400 animate-pulse rounded-full" />
                <span className="w-0.5 h-3.5 bg-indigo-400 animate-pulse delay-75 rounded-full" />
                <span className="w-0.5 h-2 bg-indigo-400 animate-pulse delay-150 rounded-full" />
              </span>
            )}

            {/* Battery Pill */}
            {battery && (
              <div className="flex items-center gap-1 text-[11px] font-mono">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                <span>{battery.percentage}%</span>
              </div>
            )}

            {/* Expand / Collapse Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Body Content */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              key="expanded-content"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="px-2.5 py-2 flex flex-col gap-3 flex-1 justify-between"
            >
              {/* Notch Mode Switcher Navigation */}
              <div className="flex items-center justify-between border-t border-white/10 pt-2">
                <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab("music");
                    }}
                    className={clsx(
                      "px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors",
                      activeTab === "music"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Music className="w-3.5 h-3.5" />
                    Music
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab("command");
                    }}
                    className={clsx(
                      "px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors",
                      activeTab === "command"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Controls
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab("status");
                    }}
                    className={clsx(
                      "px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors",
                      activeTab === "status"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Battery className="w-3.5 h-3.5" />
                    Status
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab("calendar");
                    }}
                    className={clsx(
                      "px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors",
                      activeTab === "calendar"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Focus
                  </button>
                </div>

                <span className="text-[10px] text-slate-500 font-mono">Luma Notch</span>
              </div>

              {/* Mode Views */}
              <div className="flex-1 flex items-center">
                {activeTab === "music" && (
                  <MusicMode
                    media={media}
                    bands={bands}
                    onPlayPause={onMediaToggle}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                  />
                )}
                {activeTab === "command" && (
                  <CommandCenterMode
                    audio={audio}
                    network={network}
                    bluetooth={bluetooth}
                    onVolumeChange={onVolumeChange}
                    onToggleMute={onToggleMute}
                    onToggleBluetooth={onToggleBluetooth}
                  />
                )}
                {activeTab === "status" && <StatusMode battery={battery} />}
                {activeTab === "calendar" && <CalendarMode />}
              </div>

              {/* Footer status row */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-1.5 px-0.5">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  COSMIC Wayland Surface
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="hover:text-white underline transition-colors"
                >
                  Collapse
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
