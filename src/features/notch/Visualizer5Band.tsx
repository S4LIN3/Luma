import React from "react";
import { motion } from "framer-motion";
import { VisualizerBands } from "../../core/types";

interface Visualizer5BandProps {
  bands: VisualizerBands;
  isPlaying: boolean;
  className?: string;
}

export const Visualizer5Band: React.FC<Visualizer5BandProps> = ({
  bands,
  isPlaying,
  className = "",
}) => {
  const bandValues = [
    { label: "60Hz", value: bands.sub_bass },
    { label: "250Hz", value: bands.bass },
    { label: "1kHz", value: bands.midrange },
    { label: "4kHz", value: bands.upper_mid },
    { label: "16kHz", value: bands.treble },
  ];

  return (
    <div className={`flex items-end justify-between gap-1.5 h-10 px-2 select-none ${className}`}>
      {bandValues.map((band, idx) => {
        const heightPercent = isPlaying ? Math.max(15, Math.min(100, band.value * 100)) : 10;
        return (
          <div key={idx} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full bg-white/5 rounded-full h-8 flex items-end p-0.5 overflow-hidden">
              <motion.div
                animate={{ height: `${heightPercent}%` }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                  mass: 0.5,
                }}
                className={`w-full rounded-full transition-colors ${
                  idx === 0
                    ? "bg-indigo-500"
                    : idx === 1
                    ? "bg-purple-500"
                    : idx === 2
                    ? "bg-cyan-400"
                    : idx === 3
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }`}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-400 opacity-60">
              {band.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
