import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DiscoveredApp } from "../../core/types";
import { LumaApi } from "../../core/services/tauri";
import { Search, X, Pin, PinOff, AppWindow } from "lucide-react";

interface AppLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (app: DiscoveredApp) => void;
  onTogglePin: (app: DiscoveredApp) => void;
  pinnedIds: Set<string>;
}

export const AppLauncherModal: React.FC<AppLauncherModalProps> = ({
  isOpen,
  onClose,
  onLaunch,
  onTogglePin,
  pinnedIds,
}) => {
  const [apps, setApps] = useState<DiscoveredApp[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      LumaApi.discoverApplications()
        .then((res) => setApps(res))
        .catch((e) => console.error("Failed to discover applications:", e))
        .finally(() => setIsLoading(false));
    } else {
      setSearchQuery("");
      setSelectedCategory("All");
    }
  }, [isOpen]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    apps.forEach((a) => a.categories.forEach((c) => cats.add(c)));
    return ["All", ...Array.from(cats).sort().slice(0, 8)];
  }, [apps]);

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === "All" || app.categories.includes(selectedCategory);

      return matchesSearch && matchesCat;
    });
  }, [apps, searchQuery, selectedCategory]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 max-h-[85vh] z-10 text-slate-100"
          >
            {/* Header & Search */}
            <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search installed applications..."
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Applications Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-3 sm:grid-cols-4 gap-3 min-h-[300px]">
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center text-slate-400 text-sm py-12">
                  Scanning system applications...
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center text-slate-400 text-sm py-12 gap-2">
                  <AppWindow className="w-8 h-8 opacity-40" />
                  <span>No applications found matching "{searchQuery}"</span>
                </div>
              ) : (
                filteredApps.map((app) => {
                  const isPinned = pinnedIds.has(app.id);

                  return (
                    <div
                      key={app.id}
                      className="group relative p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
                      onClick={() => onLaunch(app)}
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden p-1 bg-white/5 group-hover:scale-105 transition-transform">
                        {app.icon_data_url ? (
                          <img
                            src={app.icon_data_url}
                            alt={app.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <AppWindow className="w-7 h-7 text-indigo-400" />
                        )}
                      </div>

                      {/* App Name */}
                      <span className="text-xs font-medium text-slate-200 truncate w-full">
                        {app.name}
                      </span>

                      {/* Pin/Unpin Action Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(app);
                        }}
                        title={isPinned ? "Unpin from Dock" : "Pin to Dock"}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-black/40 text-slate-400 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {isPinned ? (
                          <PinOff className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <Pin className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary */}
            <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>{filteredApps.length} applications available</span>
              <span>Click to launch • Hover to pin</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
