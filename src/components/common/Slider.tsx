import React from "react";
import { clsx } from "clsx";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  className?: string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
  disabled,
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={clsx("relative flex items-center w-full select-none touch-none", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
        style={{
          background: `linear-gradient(to right, rgb(99 102 241) ${percentage}%, rgb(30 41 59) ${percentage}%)`,
        }}
      />
    </div>
  );
};
