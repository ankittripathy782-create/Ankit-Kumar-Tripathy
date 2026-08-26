import React from 'react';
import { formatSecondsToDigital, formatHoursAndMinutes, STREAK_THRESHOLD_SECONDS } from '../data/studyStorage';

interface FloatingStudyTimerProps {
  sessionSeconds: number;
  isRunning: boolean;
  selectedSubject: string;
  todayTotalSeconds: number;
  onMaximize: () => void;
  onToggleTimer: () => void;
  onSaveSession: () => void;
}

export const FloatingStudyTimer: React.FC<FloatingStudyTimerProps> = ({
  sessionSeconds,
  isRunning,
  selectedSubject,
  todayTotalSeconds,
  onMaximize,
  onToggleTimer,
  onSaveSession,
}) => {
  const projectedTotal = todayTotalSeconds + sessionSeconds;
  const isStreakAchieved = projectedTotal >= STREAK_THRESHOLD_SECONDS;
  const progressPercent = Math.min(100, Math.round((projectedTotal / STREAK_THRESHOLD_SECONDS) * 100));

  return (
    <aside
      aria-label="Active Study Session"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg bg-[#1a1b22]/95 backdrop-blur-xl text-white rounded-2xl p-3 sm:px-4 shadow-2xl border border-white/20 flex items-center justify-between gap-3 animate-fade-in"
    >
      <button
        type="button"
        onClick={onMaximize}
        className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer group"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-[#24389c] text-white flex items-center justify-center font-black text-[18px] group-hover:scale-105 transition-transform">
            ⏱️
          </div>
          {isRunning && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1a1b22] animate-pulse" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-black font-mono tracking-tight text-white">
              {formatSecondsToDigital(sessionSeconds)}
            </span>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-md font-bold truncate text-white/90">
              {selectedSubject}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isStreakAchieved ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-white/70 font-semibold whitespace-nowrap">
              {isStreakAchieved ? '🔥 Streak Hit!' : `${formatHoursAndMinutes(projectedTotal)} / 4h`}
            </span>
          </div>
        </div>
      </button>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onToggleTimer}
          className={`p-2 rounded-xl text-white font-bold transition-all cursor-pointer ${
            isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
          title={isRunning ? 'Pause timer' : 'Resume timer'}
        >
          <span className="material-symbols-outlined text-[20px] block">
            {isRunning ? 'pause' : 'play_arrow'}
          </span>
        </button>

        <button
          type="button"
          onClick={onSaveSession}
          className="px-3 py-1.5 rounded-xl bg-[#24389c] hover:bg-[#1a2b7b] text-white text-[12px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          title="Save and log this study time"
        >
          <span className="material-symbols-outlined text-[16px]">check</span>
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>
    </aside>
  );
};
