import React from 'react';
import { ExamType, UserProfile } from '../types';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  activeTab?: string;
  onProfileClick?: () => void;
  onOpenStudyTracker?: () => void;
  todayStudySeconds?: number;
  isStreakAchievedToday?: boolean;
  userProfile?: UserProfile;
  selectedExam?: ExamType;
  onSelectExam?: (exam: ExamType) => void;
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
  userProfile,
  selectedExam = 'NEET',
  onSelectExam,
}) => {
  const formatBriefTime = (secs?: number) => {
    if (!secs) return '0h';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const avatarSrc = userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80';
  const userName = userProfile?.name || 'Student Profile';

  return (
    <header className="fixed top-0 w-full z-40 bg-[#fbf8ff]/95 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e3e1ea]/70">
      <div className="max-w-2xl mx-auto h-16 flex items-center justify-between px-3 sm:px-6 gap-2">
        {showBack ? (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onBack}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-[#1a1b22] hover:bg-[#efedf6] active:scale-95 transition-all cursor-pointer shrink-0"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[22px] sm:text-[24px]">arrow_back</span>
            </button>
            <h1 className="font-bold text-[18px] sm:text-[22px] text-[#1a1b22] tracking-tight truncate">
              {title || 'PrepPulse'}
            </h1>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEp7bHryNAIpMegEUR0fVHgB_i8C3Lab8dvqL4He3W4TiVbjspulT8HBOgrhnbY20JrvGR2iFIWR6bxYPRk3bcukywxzcnIkVKeAs0DusKGfbcA9YMXNwlLQv1KRWK4F0TExRw2Ue6ldBpjUEZv18doyfHw7dtlrLUAo6kSX7dZMDgyNkHME1jK0muGd0BIIzULQvqAF8-poxx6mp2JfwtHe9I0GbLh3n3S6sEzNLiNx6ZmC7Yl2VX1Q"
              alt="PrepPulse Logo"
              className="h-7 sm:h-8 w-auto object-contain"
            />
            <span className="font-bold text-[18px] sm:text-[22px] text-[#24389c] tracking-tight hidden xs:inline">
              PrepPulse
            </span>
          </div>
        )}

        {/* TOP EXAM PREFERENCE SELECTOR (NEET / JEE) */}
        <div className="flex items-center bg-[#efedf6] p-0.5 sm:p-1 rounded-full border border-[#d8d6e3] shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => onSelectExam?.('NEET')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-[12px] font-black transition-all cursor-pointer ${
              selectedExam === 'NEET'
                ? 'bg-[#24389c] text-white shadow-xs scale-[1.02]'
                : 'text-[#454652] hover:text-[#1a1b22] hover:bg-white/60'
            }`}
            title="NEET (Physics, Chemistry, Botany, Zoology)"
          >
            <span className="text-[12px] sm:text-[13px]">🩺</span>
            <span>NEET</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectExam?.('JEE')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-[12px] font-black transition-all cursor-pointer ${
              selectedExam === 'JEE'
                ? 'bg-[#24389c] text-white shadow-xs scale-[1.02]'
                : 'text-[#454652] hover:text-[#1a1b22] hover:bg-white/60'
            }`}
            title="JEE (Physics, Chemistry, Mathematics)"
          >
            <span className="text-[12px] sm:text-[13px]">📐</span>
            <span>JEE</span>
          </button>
        </div>

        {/* Right side widgets & Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Study Tracker Quick Pill */}
          {onOpenStudyTracker && todayStudySeconds !== undefined && (
            <button
              type="button"
              onClick={onOpenStudyTracker}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-[12px] font-black border transition-all cursor-pointer shadow-xs ${
                isStreakAchievedToday
                  ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                  : 'bg-[#dee0ff]/60 border-[#24389c]/30 text-[#24389c] hover:bg-[#dee0ff]'
              }`}
              title="Open Study Time Tracker & Streak"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-[#24389c]">timer</span>
              <span className="font-mono font-bold">{formatBriefTime(todayStudySeconds)}</span>
              <span className="hidden xs:inline">{isStreakAchievedToday ? '🔥' : '/4h'}</span>
            </button>
          )}

          <button
            onClick={onProfileClick}
            className="rounded-full ring-2 ring-transparent hover:ring-[#24389c]/40 transition-all cursor-pointer focus:outline-none flex items-center p-0.5"
            aria-label="User profile"
            title={`Logged in as ${userName} (${selectedExam})`}
          >
            <img
              src={avatarSrc}
              alt={userName}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shadow-sm border border-white bg-gray-100"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

