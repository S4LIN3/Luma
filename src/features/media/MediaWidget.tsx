import React from "react";
import { MediaStatus } from "../../core/types";
import { Card } from "../../components/common/Card";
import { Music, Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface MediaWidgetProps {
  media: MediaStatus | null;
  onTogglePlayPause: () => void;
}

export const MediaWidget: React.FC<MediaWidgetProps> = ({ media, onTogglePlayPause }) => {
  if (!media) return null;

  const track = media.current_track;
  const progressPercent = track
    ? Math.min(100, (track.position_seconds / track.duration_seconds) * 100)
    : 0;

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Music className="w-3.5 h-3.5 text-indigo-400" />
          <span>Now Playing (MPRIS)</span>
        </div>
        <span className="text-[11px] text-slate-400">{media.active_player || "Media"}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Music className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">
            {track?.title || "No Media Playing"}
          </h4>
          <p className="text-xs text-slate-400 truncate">
            {track ? `${track.artist} — ${track.album}` : "System MPRIS Ready"}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onTogglePlayPause}
            className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-transform active:scale-95"
          >
            {media.playback_state === "Playing" ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </Card>
  );
};
