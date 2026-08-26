import React from 'react';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  activeTab?: string;
  onProfileClick?: () => void;
  onOpenStudyTracker?: () => void;
  todayStudySeconds?: number;
  isStreakAchievedToday?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  showBack = false,
  activeTab = 'Tests',
  onProfileClick,
  onOpenStudyTracker,
  todayStudySeconds,
  isStreakAchievedToday,
}) => {
  const formatBriefTime = (secs?: number) => {
    if (!secs) return '0h';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-[#fbf8ff]/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e3e1ea]/60">
      <div className="max-w-2xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6">
        {showBack ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full text-[#1a1b22] hover:bg-[#efedf6] active:scale-95 transition-all"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="font-bold text-[20px] sm:text-[22px] text-[#1a1b22] tracking-tight">
              {title || 'PrepPulse'}
            </h1>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEp7bHryNAIpMegEUR0fVHgB_i8C3Lab8dvqL4He3W4TiVbjspulT8HBOgrhnbY20JrvGR2iFIWR6bxYPRk3bcukywxzcnIkVKeAs0DusKGfbcA9YMXNwlLQv1KRWK4F0TExRw2Ue6ldBpjUEZv18doyfHw7dtlrLUAo6kSX7dZMDgyNkHME1jK0muGd0BIIzULQvqAF8-poxx6mp2JfwtHe9I0GbLh3n3S6sEzNLiNx6ZmC7Yl2VX1Q"
              alt="PrepPulse Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="font-bold text-[22px] text-[#24389c] tracking-tight">
              PrepPulse
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Study Tracker Quick Pill */}
          {onOpenStudyTracker && todayStudySeconds !== undefined && (
            <button
              type="button"
              onClick={onOpenStudyTracker}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[12px] font-black border transition-all cursor-pointer shadow-xs ${
                isStreakAchievedToday
                  ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                  : 'bg-[#dee0ff]/60 border-[#24389c]/30 text-[#24389c] hover:bg-[#dee0ff]'
              }`}
              title="Open Study Time Tracker & Streak"
            >
              <span className="material-symbols-outlined text-[16px] text-[#24389c]">timer</span>
              <span className="font-mono font-bold">{formatBriefTime(todayStudySeconds)}</span>
              <span>{isStreakAchievedToday ? '🔥' : '/ 4h'}</span>
            </button>
          )}

          {!showBack && (
            <span className="hidden md:inline-block text-[14px] font-semibold text-[#454652] bg-[#efedf6] px-3 py-1 rounded-full">
              {activeTab}
            </span>
          )}
          <button
            onClick={onProfileClick}
            className="rounded-full ring-2 ring-transparent hover:ring-[#3f51b5]/30 transition-all cursor-pointer focus:outline-none"
            aria-label="User profile"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVF2wKQMB8iGxlrpba4Ixllg9cZHIs4c0X4HOGu0RFDU4lT35uHeVmA1ylj2g1YoUdEzOLVyi3ZZYaTC74cLlA0wz_6Mr9XVmyqNkIDRvWVhjOA2FKDPmInR08eJ-QBq4cOEEUFGlCkjHMC-y53QxSnqc7jzeUoswVT61CFE2dAAq3FhTrHIurEpSUjUyD_NgByg3QC6_DTVJE9hAm8Q4Hari1ga0b4XuNWXHcbnQd5qhQbz3hM5dEDw"
              alt="Profile avatar"
              className="w-9 h-9 rounded-full object-cover shadow-sm border border-white"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

