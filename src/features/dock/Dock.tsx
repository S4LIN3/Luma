import React, { useState } from "react";
import { DockConfig, DockItem, DockPosition } from "../../core/types";
import {
  Terminal,
  Folder,
  Globe,
  Settings,
  Sparkles,
  AppWindow,
} from "lucide-react";
import { clsx } from "clsx";

interface DockProps {
  config: DockConfig;
  onPositionChange: (pos: DockPosition) => void;
  onItemClick?: (item: DockItem) => void;
}

const getLucideIcon = (iconName: string) => {
  switch (iconName.toLowerCase()) {
    case "terminal":
      return Terminal;
    case "folder":
      return Folder;
    case "globe":
      return Globe;
    case "settings":
      return Settings;
    case "sparkles":
      return Sparkles;
    default:
      return AppWindow;
  }
};

export const Dock: React.FC<DockProps> = ({ config, onItemClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex items-center justify-center p-3">
      <div
        className={clsx(
          "flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-slate-900/70 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40 transition-all duration-300",
          config.position === "Left" || config.position === "Right" ? "flex-col" : "flex-row"
        )}
      >
        {config.items.map((item, index) => {
          const IconComponent = getLucideIcon(item.icon);
          const isHovered = hoveredIndex === index;
          const isNeighbor =
            hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;

          let scale = 1;
          if (config.magnification) {
            if (isHovered) scale = config.magnification_scale;
            else if (isNeighbor) scale = 1 + (config.magnification_scale - 1) * 0.45;
          }

          return (
            <div
              key={item.id}
              className="relative flex flex-col items-center group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onItemClick && onItemClick(item)}
            >
              {/* Tooltip */}
              <div
                className={clsx(
                  "absolute -top-9 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-100 border border-white/10 shadow-md whitespace-nowrap pointer-events-none transition-all duration-150 z-30",
                  isHovered ? "opacity-100 -translate-y-1" : "opacity-0 translate-y-0"
                )}
              >
                {item.title}
              </div>

              {/* Icon Container */}
              <div
                style={{
                  transform: `scale(${scale})`,
                  width: `${config.icon_size}px`,
                  height: `${config.icon_size}px`,
                }}
                className={clsx(
                  "rounded-xl flex items-center justify-center transition-transform duration-150 ease-out bg-gradient-to-br from-slate-800/90 to-slate-950/90 border border-white/10 hover:border-indigo-400/50 shadow-md"
                )}
              >
                <IconComponent className="w-6 h-6 text-slate-200 group-hover:text-indigo-300 transition-colors" />
              </div>

              {/* Running dot indicator */}
              {item.is_running && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 shadow-sm shadow-indigo-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
