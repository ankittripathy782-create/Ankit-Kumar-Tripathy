import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export interface CelebrationData {
  id: string;
  title: string;
  message: string;
  addedTimeFormatted?: string;
  totalTimeFormatted: string;
  isStreakUnlocked?: boolean;
  streakDays?: number;
}

interface CelebrationToastProps {
  data: CelebrationData | null;
  onDismiss: () => void;
}

export const CelebrationToast: React.FC<CelebrationToastProps> = ({ data, onDismiss }) => {
  useEffect(() => {
    if (!data) return;

    // Fire celebratory confetti if streak unlocked or milestone reached
    try {
      if (data.isStreakUnlocked) {
        // Multi-stage confetti burst
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#24389c', '#34A853', '#FFD700', '#FF5722', '#6f48b2']
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#34A853', '#FFD700', '#24389c']
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#34A853', '#FFD700', '#24389c']
          });
        }, 300);
      } else {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.75 },
          colors: ['#24389c', '#34A853', '#FFD700']
        });
      }
    } catch {
      // ignore
    }

    // Auto dismiss after 6.5 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 6500);

    return () => clearTimeout(timer);
  }, [data, onDismiss]);

  if (!data) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-bounce-short shadow-2xl rounded-2xl overflow-hidden border border-amber-300/40 bg-gradient-to-r from-[#1a237e] via-[#24389c] to-[#311b92] text-white p-4.5 sm:p-5">
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-[26px] shrink-0 border border-white/30 shadow-inner">
          {data.isStreakUnlocked ? '🔥' : '🎉'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              {data.isStreakUnlocked ? '4-Hour Goal Achieved!' : 'Study Time Increased!'}
            </span>
            <button
              type="button"
              onClick={onDismiss}
              className="text-white/60 hover:text-white transition-colors p-1"
              aria-label="Close notification"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <h4 className="text-[17px] font-black text-white mt-1 leading-snug">
            {data.title}
          </h4>

          <p className="text-[13px] text-white/90 mt-1 leading-relaxed">
            {data.message}
          </p>

          <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-[12px]">
            {data.addedTimeFormatted && (
              <span className="font-bold text-emerald-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                +{data.addedTimeFormatted} Added
              </span>
            )}
            <span className="font-bold text-white/90 ml-auto">
              Today's Total: <strong className="text-white underline decoration-amber-400 font-black">{data.totalTimeFormatted}</strong>
            </span>
          </div>

          {data.isStreakUnlocked && (
            <div className="mt-2 text-center bg-amber-400/20 border border-amber-300/40 rounded-xl py-1.5 px-2 text-[12px] font-black text-amber-200">
              🏆 {data.streakDays || 8} Days Streak Active & Verified for Today!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
