import React from "react";
import { clsx } from "clsx";

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  className?: string;
  disabled?: boolean;
  showValue?: boolean;
  unit?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
  disabled,
  showValue = false,
  unit = "",
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div
      className={clsx("relative flex items-center w-full select-none gap-3", className)}
    >
      <div className="relative flex-1 flex items-center h-5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-700/60 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none transition-all"
          style={{
            background: `linear-gradient(to right, rgb(99 102 241) ${percentage}%, rgb(30 41 59) ${percentage}%)`,
          }}
        />
      </div>

      {showValue && (
        <span className="text-xs font-mono text-slate-400 dark:text-slate-400 min-w-[36px] text-right">
          {value}
          {unit}
        </span>
      )}
    </div>
  );
};
