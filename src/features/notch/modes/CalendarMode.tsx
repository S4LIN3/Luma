import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Timer, Play, Pause, RotateCcw } from "lucide-react";
import { clsx } from "clsx";

export const CalendarMode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"agenda" | "pomodoro">("agenda");

  // Pomodoro timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(3);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      setCompletedSessions((s) => s + 1);
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  const timerProgress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 self-start text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("agenda")}
          className={clsx(
            "px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5",
            activeTab === "agenda" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          Agenda
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pomodoro")}
          className={clsx(
            "px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5",
            activeTab === "pomodoro" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
          )}
        >
          <Timer className="w-3.5 h-3.5" />
          Focus Pomodoro
        </button>
      </div>

      {activeTab === "agenda" ? (
        /* Calendar Agenda */
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex flex-col items-center justify-center shrink-0">
                <span className="text-[9px] uppercase font-semibold text-indigo-300">OCT</span>
                <span className="text-sm font-bold text-white leading-none">31</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  Pop!_OS COSMIC Milestone Review
                </span>
                <span className="text-[10px] text-slate-400">
                  10:30 AM — 11:30 AM • Orbit Conference Room
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Next: Rust Systems Sync</span>
            <span>2:00 PM</span>
          </div>
        </div>
      ) : (
        /* Pomodoro Timer */
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 gap-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold font-mono text-white tracking-wider">
              {timeFormatted}
            </span>
            <span className="text-[10px] text-slate-400">
              Session {completedSessions + 1} • {completedSessions} Completed today
            </span>
            <div className="w-32 bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${timerProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 active:scale-95 transition-transform"
            >
              {isTimerRunning ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTimerRunning(false);
                setTimeLeft(25 * 60);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
