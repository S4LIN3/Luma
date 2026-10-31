import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DockConfig, DockItem, DockPosition, DiscoveredApp } from "../../core/types";
import { AppLauncherModal } from "./AppLauncherModal";
import { LumaApi } from "../../core/services/tauri";
import {
  AppWindow,
  LayoutGrid,
  Pin,
  PinOff,
  Play,
} from "lucide-react";
import { clsx } from "clsx";

interface DockProps {
  config: DockConfig;
  onPositionChange: (pos: DockPosition) => void;
  onItemClick?: (item: DockItem) => void;
  onConfigUpdate?: (newConfig: DockConfig) => void;
}

export const Dock: React.FC<DockProps> = ({
  config,
  onItemClick,
  onConfigUpdate,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    item: DockItem;
    x: number;
    y: number;
  } | null>(null);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  // Group items if separate_pinned_and_running is active
  const pinnedItems = config.items.filter((it) => it.is_pinned);
  const runningOnlyItems = config.items.filter((it) => !it.is_pinned && it.is_running);

  const displayItems = config.separate_pinned_and_running
    ? [...pinnedItems, ...runningOnlyItems]
    : config.items;

  const handleLaunch = async (item: DockItem | DiscoveredApp) => {
    try {
      await LumaApi.launchApplication(item.id);
    } catch (e) {
      console.error("Failed to launch application:", e);
    }
    if (onItemClick && "title" in item) {
      onItemClick(item as DockItem);
    }
  };

  const handleTogglePin = async (item: DockItem | DiscoveredApp) => {
    try {
      let updated: DockConfig;
      if (item.is_pinned) {
        updated = await LumaApi.unpinApplication(item.id);
      } else {
        updated = await LumaApi.pinApplication(item.id);
      }
      if (onConfigUpdate) onConfigUpdate(updated);
    } catch (e) {
      console.error("Failed to toggle pin:", e);
    }
    setContextMenu(null);
  };

  // Drag and Drop reordering
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const currentOrder = config.items.filter((i) => i.is_pinned).map((i) => i.id);
    const fromIndex = currentOrder.indexOf(draggedId);
    const toIndex = currentOrder.indexOf(targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const newOrder = [...currentOrder];
      const [moved] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, moved);

      try {
        const updated = await LumaApi.reorderDockItems(newOrder);
        if (onConfigUpdate) onConfigUpdate(updated);
      } catch (err) {
        console.error("Failed to reorder dock items:", err);
      }
    }
    setDraggedId(null);
  };

  const handleContextMenu = (e: React.MouseEvent, item: DockItem) => {
    e.preventDefault();
    setContextMenu({
      item,
      x: e.clientX,
      y: e.clientY - 90,
    });
  };

  const isVertical = config.position === "Left" || config.position === "Right";
  const pinnedIds = new Set(config.items.filter((i) => i.is_pinned).map((i) => i.id));

  return (
    <>
      <div
        className="flex items-center justify-center p-3 select-none"
        onClick={() => setContextMenu(null)}
      >
        <motion.div
          layout
          style={{
            gap: `${config.spacing || 8}px`,
          }}
          className={clsx(
            "flex items-center px-3 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 transition-all duration-300",
            isVertical ? "flex-col" : "flex-row"
          )}
        >
          {displayItems.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const isNeighbor =
              hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;

            let scale = 1;
            if (config.magnification) {
              if (isHovered) scale = config.magnification_scale;
              else if (isNeighbor) scale = 1 + (config.magnification_scale - 1) * 0.45;
            }

            // Divider between pinned and running apps
            const showDivider =
              config.separate_pinned_and_running &&
              !item.is_pinned &&
              index > 0 &&
              displayItems[index - 1]?.is_pinned;

            return (
              <React.Fragment key={item.id}>
                {showDivider && (
                  <div
                    className={clsx(
                      "bg-white/15 rounded-full shrink-0",
                      isVertical ? "w-6 h-0.5 my-1" : "h-6 w-0.5 mx-1"
                    )}
                  />
                )}

                <div
                  draggable={item.is_pinned}
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item.id)}
                  onContextMenu={(e) => handleContextMenu(e, item)}
                  className="relative flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handleLaunch(item)}
                >
                  {/* Tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className={clsx(
                          "absolute px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-100 border border-white/10 shadow-xl whitespace-nowrap pointer-events-none z-30",
                          isVertical ? "left-full ml-3 top-1/2 -translate-y-1/2" : "-top-10"
                        )}
                      >
                        {item.title}
                        {item.active_instances > 1 && (
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                            {item.active_instances}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Icon Container with Fluid Scaling */}
                  <motion.div
                    animate={{ scale }}
                    transition={{ type: "spring", stiffness: 450, damping: 25 }}
                    style={{
                      width: `${config.icon_size}px`,
                      height: `${config.icon_size}px`,
                    }}
                    className={clsx(
                      "rounded-xl flex items-center justify-center p-1.5 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-indigo-400/50 shadow-lg transition-colors overflow-hidden",
                      draggedId === item.id ? "opacity-40" : "opacity-100"
                    )}
                  >
                    {item.icon_data_url ? (
                      <img
                        src={item.icon_data_url}
                        alt={item.title}
                        className="w-full h-full object-contain pointer-events-none drop-shadow"
                      />
                    ) : (
                      <AppWindow className="w-6 h-6 text-indigo-400" />
                    )}
                  </motion.div>

                  {/* Running Indicator Dot */}
                  {item.is_running && (
                    <motion.div
                      layoutId={`running-${item.id}`}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 shadow-sm shadow-indigo-400"
                    />
                  )}
                </div>
              </React.Fragment>
            );
          })}

          {/* Divider Before App Launcher Button */}
          <div
            className={clsx(
              "bg-white/15 rounded-full shrink-0",
              isVertical ? "w-6 h-0.5 my-1" : "h-6 w-0.5 mx-1"
            )}
          />

          {/* Application Launcher Grid Button */}
          <button
            type="button"
            onClick={() => setIsLauncherOpen(true)}
            title="App Launcher (Applications)"
            style={{
              width: `${config.icon_size}px`,
              height: `${config.icon_size}px`,
            }}
            className="rounded-xl flex items-center justify-center p-1.5 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 hover:border-indigo-400 hover:scale-105 shadow-md transition-all text-indigo-300 hover:text-white"
          >
            <LayoutGrid className="w-6 h-6" />
          </button>
        </motion.div>
      </div>

      {/* Floating Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
            }}
            className="fixed z-50 min-w-[160px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 shadow-2xl text-xs text-slate-200 flex flex-col gap-1"
          >
            <div className="px-2 py-1 font-semibold text-slate-400 border-b border-white/5 truncate">
              {contextMenu.item.title}
            </div>

            <button
              type="button"
              onClick={() => {
                handleLaunch(contextMenu.item);
                setContextMenu(null);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-left transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-indigo-400" />
              Open
            </button>

            <button
              type="button"
              onClick={() => handleTogglePin(contextMenu.item)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-left transition-colors"
            >
              {contextMenu.item.is_pinned ? (
                <>
                  <PinOff className="w-3.5 h-3.5 text-rose-400" />
                  Unpin from Dock
                </>
              ) : (
                <>
                  <Pin className="w-3.5 h-3.5 text-emerald-400" />
                  Pin to Dock
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full XDG Applications Launcher Modal */}
      <AppLauncherModal
        isOpen={isLauncherOpen}
        onClose={() => setIsLauncherOpen(false)}
        onLaunch={handleLaunch}
        onTogglePin={handleTogglePin}
        pinnedIds={pinnedIds}
      />
    </>
  );
};
