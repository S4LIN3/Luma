import React from "react";
import { MediaStatus, VisualizerBands } from "../../../core/types";
import { Visualizer5Band } from "../Visualizer5Band";
import { Play, Pause, SkipBack, SkipForward, Music } from "lucide-react";

interface MusicModeProps {
  media: MediaStatus | null;
  bands: VisualizerBands;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const MusicMode: React.FC<MusicModeProps> = ({
  media,
  bands,
  onPlayPause,
  onNext,
  onPrevious,
}) => {
  const isPlaying = media?.playback_state === "Playing";
  const track = media?.current_track;
  const progressPercent = track && track.duration_seconds > 0
    ? Math.min(100, (track.position_seconds / track.duration_seconds) * 100)
    : 35;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between gap-3">
        {/* Album Artwork or Stylized Placeholder */}
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shrink-0 shadow-md border border-white/10">
          {track?.art_url ? (
            <img
              src={track.art_url}
              alt={track.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to icon on broken image
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <Music className="w-7 h-7 text-white/90" />
          )}
        </div>

        {/* Track Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              {media?.active_player || "MPRIS Player"}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-white truncate leading-snug">
            {track?.title || "No Media Playing"}
          </h4>
          <p className="text-xs text-slate-400 truncate">
            {track ? `${track.artist} • ${track.album}` : "Launch Spotify, VLC or Firefox"}
          </p>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevious}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
            title="Previous track"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onPlayPause}
            className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-transform active:scale-90"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
            title="Next track"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Durations */}
      <div className="flex flex-col gap-1">
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>{formatTime(track?.position_seconds || 0)}</span>
          <span>{formatTime(track?.duration_seconds || 0)}</span>
        </div>
      </div>

      {/* 5-Band Audio Visualizer */}
      <div className="pt-1 border-t border-white/5 flex flex-col gap-1">
        <div className="flex items-center justify-between px-1 text-[10px] text-slate-400 font-medium">
          <span>Spectrum Visualizer</span>
          <span className="text-[9px] font-mono text-indigo-400">
            {bands.is_live_dsp ? "PipeWire Stream" : "Harmonic DSP Mode"}
          </span>
        </div>
        <Visualizer5Band bands={bands} isPlaying={isPlaying} />
      </div>
    </div>
  );
};
