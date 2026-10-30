import React from "react";
import { AudioStatus } from "../../core/types";
import { Card } from "../../components/common/Card";
import { Slider } from "../../components/common/Slider";
import { Volume2, VolumeX, Speaker } from "lucide-react";

interface AudioWidgetProps {
  audio: AudioStatus | null;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
}

export const AudioWidget: React.FC<AudioWidgetProps> = ({
  audio,
  onVolumeChange,
  onToggleMute,
}) => {
  if (!audio) return null;

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Speaker className="w-3.5 h-3.5 text-blue-400" />
          <span>Audio ({audio.backend})</span>
        </div>
        <span className="text-xs font-mono font-medium text-slate-300">
          {audio.is_muted ? "MUTED" : `${audio.volume}%`}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMute}
          className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
        >
          {audio.is_muted || audio.volume === 0 ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-blue-400" />
          )}
        </button>

        <Slider
          value={audio.is_muted ? 0 : audio.volume}
          min={0}
          max={100}
          onChange={onVolumeChange}
        />
      </div>

      <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>Sink: {audio.default_sink.name}</span>
      </div>
    </Card>
  );
};
