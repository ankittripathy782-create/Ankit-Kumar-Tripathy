import React from 'react';
import { TestConfig, TimetableSlot } from '../types';
import { formatTime24to12, calculateTotalPlannedMinutes, formatDurationHuman } from '../data/timetableStorage';

interface HomeScreenProps {
  onStartQuickDPP: () => void;
  onNavigateToTests: () => void;
  onOpenTestResultsDemo: () => void;
  onOpenSyllabusTracker: (subjectKey?: string) => void;
  onStartFullMock: (examType: 'NEET' | 'JEE') => void;
  onOpenStudyTracker: () => void;
  onNavigateToTimetable: () => void;
  timetableSlots?: TimetableSlot[];
  todayStudySeconds: number;
  currentStreakDays: number;
  isStreakAchievedToday: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartQuickDPP,
  onNavigateToTests,
  onOpenTestResultsDemo,
  onOpenSyllabusTracker,
  onStartFullMock,
  onOpenStudyTracker,
  onNavigateToTimetable,
  timetableSlots = [],
  todayStudySeconds,
  currentStreakDays,
  isStreakAchievedToday,
}) => {

  const STREAK_GOAL_SECONDS = 14400; // 4 Hours
  const progressPercent = Math.min(100, Math.round((todayStudySeconds / STREAK_GOAL_SECONDS) * 100));
  const remainingSeconds = Math.max(0, STREAK_GOAL_SECONDS - todayStudySeconds);

  const { totalPlannedMins, totalCompletedMins, studySlotCount, completedSlotCount } =
    calculateTotalPlannedMinutes(timetableSlots, 'all');

  const upcomingSlots = timetableSlots
    .filter((s) => !s.isCompleted)
    .slice(0, 3);

  const formatHoursMins = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-28 gap-6">
      {/* Welcome & 4-Hour Day Streak Banner */}
      <div className="bg-gradient-to-r from-[#24389c] via-[#311b92] to-[#4a148c] text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4">
          
          {/* Creator Watermark Tag */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 bg-black/30 border border-white/20 px-3 py-1 rounded-full text-white/95 text-[11px] sm:text-[12px] font-extrabold tracking-wide backdrop-blur-md shadow-xs">
              <span className="material-symbols-outlined text-[15px] text-amber-300">verified</span>
              <span>PrepPulse by - ANKIT KUMAR TRIPATHY</span>
            </div>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Min 4h/Day Streak
            </span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-white/20 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                  NEET & JEE MASTER PREP
                </span>
              </div>
              <h2 className="text-[24px] font-black tracking-tight">Welcome back, Ankit! 👋</h2>
              <p className="text-[14px] text-white/80 mt-0.5">
                Target: 180 Qs full syllabus mastery & daily 4-hour deep study
              </p>
            </div>

            {/* Streak Counter Badge */}
            <div className={`backdrop-blur-md rounded-2xl p-3.5 text-center border flex flex-col items-center shrink-0 min-w-[76px] transition-all shadow-md ${
              isStreakAchievedToday
                ? 'bg-amber-400/25 border-amber-300/50 text-amber-200'
                : 'bg-white/15 border-white/20 text-white'
            }`}>
              <span className="text-[24px] leading-none animate-pulse">🔥</span>
              <span className="text-[20px] font-black leading-tight mt-1">{currentStreakDays}</span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider opacity-90">
                {isStreakAchievedToday ? 'Active Days' : 'Day Streak'}
              </span>
            </div>
          </div>

          {/* Dedicated 4-Hour Day Streak Progress Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between text-[13px] font-bold mb-2">
              <span className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-[20px] text-amber-300">timer</span>
                Today's Study Time: <strong className="text-amber-300 text-[14px]">{formatHoursMins(todayStudySeconds)} / 4h 00m</strong>
              </span>
              <span className="text-amber-200 font-extrabold text-[13px]">
                {progressPercent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden p-0.5 flex">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isStreakAchievedToday
                    ? 'bg-gradient-to-r from-amber-400 to-amber-300'
                    : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Status & CTA Row */}
            <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
              <div className="text-[12px] font-medium text-white/90">
                {isStreakAchievedToday ? (
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    4-Hour Day Streak requirement completed today!
                  </span>
                ) : (
                  <span>
                    ⏳ Study <strong className="text-white">{formatHoursMins(remainingSeconds)}</strong> more today to earn your Day Streak!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenStudyTracker}
                  className="bg-white text-[#24389c] text-[12px] font-black px-3.5 py-1.5 rounded-xl shadow-sm hover:bg-[#dee0ff] transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  Start Study Timer
                </button>
              </div>
            </div>
          </div>

          {/* Quick Suggested DPP Action */}
          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[13px]">
            <span className="text-white/90">
              Today's Suggested DPP: <strong className="text-white">Organic Mechanisms (38-Yr PYQs)</strong>
            </span>
            <button
              type="button"
              onClick={onStartQuickDPP}
              className="text-amber-300 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Start Drill
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>


      {/* NEW: Full Mark Exam Presets (180 Qs - 720 Marks NEET / 75 Qs - 300 Marks JEE) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-bold text-[#1a1b22] uppercase tracking-wider opacity-80">
            FULL MARKS OFFICIAL EXAM SIMULATORS
          </h3>
          <span className="text-[11px] font-bold text-[#24389c] bg-[#24389c]/10 px-2 py-0.5 rounded-full">
            Real NTA Pattern
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* NEET 180 Qs - 720 Marks Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#e3e1ea] shadow-sm hover:shadow-md hover:border-[#34A853] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black bg-[#34A853]/15 text-[#2e7d32] px-2.5 py-0.5 rounded-full uppercase">
                  NEET (UG) Full Mock
                </span>
                <span className="text-[14px] font-black text-[#1a1b22]">
                  720 Marks
                </span>
              </div>
              <h4 className="text-[16px] font-black text-[#1a1b22]">
                180 Questions Mega Test
              </h4>
              <p className="text-[12px] text-[#454652] mt-1">
                45 Physics • 45 Chemistry (Physical/Org/Inorg) • 45 Botany • 45 Zoology
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#e3e1ea] flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6b6d7c] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">timer</span>
                200 Mins (+4, -1)
              </span>
              <button
                type="button"
                onClick={() => onStartFullMock('NEET')}
                className="px-3.5 py-1.5 rounded-xl bg-[#2e7d32] text-white text-[12px] font-bold hover:bg-[#1b5e20] transition-colors cursor-pointer flex items-center gap-1"
              >
                Launch 720M
                <span className="material-symbols-outlined text-[15px]">play_arrow</span>
              </button>
            </div>
          </div>

          {/* JEE Main Full Mock Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#e3e1ea] shadow-sm hover:shadow-md hover:border-[#24389c] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black bg-[#24389c]/15 text-[#24389c] px-2.5 py-0.5 rounded-full uppercase">
                  JEE Main Official Pattern
                </span>
                <span className="text-[14px] font-black text-[#24389c]">
                  300 Full Marks
                </span>
              </div>
              <h4 className="text-[16px] font-black text-[#1a1b22]">
                75 Questions Mega Test
              </h4>
              <p className="text-[12px] text-[#454652] mt-1">
                25 Physics (100M) • 25 Chemistry (Physical/Org/Inorg, 100M) • 25 Mathematics (100M)
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#e3e1ea] flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6b6d7c] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">timer</span>
                180 Mins (+4, -1)
              </span>
              <button
                type="button"
                onClick={() => onStartFullMock('JEE')}
                className="px-3.5 py-1.5 rounded-xl bg-[#24389c] text-white text-[12px] font-bold hover:bg-[#1a2b7b] transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              >
                Launch 300M JEE
                <span className="material-symbols-outlined text-[15px]">play_arrow</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Full Syllabus PDFs & Chapter Marking Sheets Section */}
      <div className="bg-[#f8f9ff] rounded-2xl p-4 sm:p-5 border border-[#dee0ff]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#24389c] text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            </div>
            <div>
              <h3 className="text-[15px] font-black text-[#1a1b22]">
                Full Subject Syllabus & Printable Marking Sheets
              </h3>
              <p className="text-[12px] text-[#454652]">
                Track NCERT chapters, record mock scores & print offline revision sheets
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenSyllabusTracker('all')}
            className="px-3 py-1.5 rounded-xl bg-[#24389c] text-white text-[12px] font-bold hover:bg-[#1a2b7b] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            Open Master Tracker
          </button>
        </div>

        {/* Individual Subject Sub-Discipline Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mt-4">
          <button
            type="button"
            onClick={() => onOpenSyllabusTracker('physics')}
            className="p-3 bg-white rounded-xl border border-[#e3e1ea] hover:border-[#24389c] hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <div className="text-[16px] mb-1">⚡</div>
            <div className="text-[13px] font-bold text-[#1a1b22] group-hover:text-[#24389c]">Physics</div>
            <div className="text-[11px] text-[#6b6d7c]">29 Chapters (11 & 12)</div>
          </button>

          <button
            type="button"
            onClick={() => onOpenSyllabusTracker('chemistry_physical')}
            className="p-3 bg-white rounded-xl border border-[#e3e1ea] hover:border-[#24389c] hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <div className="text-[16px] mb-1">🧪</div>
            <div className="text-[13px] font-bold text-[#1a1b22] group-hover:text-[#24389c]">Physical Chem</div>
            <div className="text-[11px] text-[#6b6d7c]">8 Chapters</div>
          </button>

          <button
            type="button"
            onClick={() => onOpenSyllabusTracker('chemistry_inorganic')}
            className="p-3 bg-white rounded-xl border border-[#e3e1ea] hover:border-[#24389c] hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <div className="text-[16px] mb-1">🔬</div>
            <div className="text-[13px] font-bold text-[#1a1b22] group-hover:text-[#24389c]">Inorganic Chem</div>
            <div className="text-[11px] text-[#6b6d7c]">7 Chapters</div>
          </button>

          <button
            type="button"
            onClick={() => onOpenSyllabusTracker('chemistry_organic')}
            className="p-3 bg-white rounded-xl border border-[#e3e1ea] hover:border-[#24389c] hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <div className="text-[16px] mb-1">⚗️</div>
            <div className="text-[13px] font-bold text-[#1a1b22] group-hover:text-[#24389c]">Organic Chem</div>
            <div className="text-[11px] text-[#6b6d7c]">7 Chapters</div>
          </button>

          <button
            type="button"
            onClick={() => onOpenSyllabusTracker('biology_botany')}
            className="p-3 bg-white rounded-xl border border-[#e3e1ea] hover:border-[#2e7d32] hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <div className="text-[16px] mb-1">🌿</div>
            <div className="text-[13px] font-bold text-[#1a1b22] group-hover:text-[#2e7d32]">Botany (NEET)</div>
            <div className="text-[11px] text-[#6b6d7c]">17 Chapters</div>
          </button>

          <button
            type="button"
            onClick={() => onOpenSyllabusTracker('biology_zoology')}
            className="p-3 bg-white rounded-xl border border-[#e3e1ea] hover:border-[#2e7d32] hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <div className="text-[16px] mb-1">🐾</div>
            <div className="text-[13px] font-bold text-[#1a1b22] group-hover:text-[#2e7d32]">Zoology (NEET)</div>
            <div className="text-[11px] text-[#6b6d7c]">15 Chapters</div>
          </button>

          <button
            type="button"
            onClick={() => onOpenSyllabusTracker('mathematics')}
            className="p-3 bg-white rounded-xl border border-[#e3e1ea] hover:border-[#24389c] hover:shadow-sm text-left transition-all cursor-pointer group col-span-2 sm:col-span-1 md:col-span-2"
          >
            <div className="text-[16px] mb-1">📐</div>
            <div className="text-[13px] font-bold text-[#1a1b22] group-hover:text-[#24389c]">Mathematics (JEE)</div>
            <div className="text-[11px] text-[#6b6d7c]">23 Chapters • Calculus & Algebra</div>
          </button>
        </div>
      </div>

      {/* Quick Practice Cards */}
      <div>
        <h3 className="text-[14px] font-bold text-[#1a1b22] uppercase tracking-wider opacity-80 mb-3">
          QUICK PRACTICE & TEST CREATION
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onNavigateToTests}
            className="p-4 rounded-2xl bg-white border border-[#e3e1ea] shadow-sm hover:shadow-md hover:border-[#24389c] transition-all text-left group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#24389c]/10 text-[#24389c] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">tune</span>
            </div>
            <h4 className="text-[15px] font-bold text-[#1a1b22]">Custom Test Designer</h4>
            <p className="text-[12px] text-[#454652] mt-0.5">
              Design by chapter, difficulty, timing & custom question mix
            </p>
          </button>

          <button
            type="button"
            onClick={onStartQuickDPP}
            className="p-4 rounded-2xl bg-white border border-[#e3e1ea] shadow-sm hover:shadow-md hover:border-[#6f48b2] transition-all text-left group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#6f48b2]/10 text-[#6f48b2] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">bolt</span>
            </div>
            <h4 className="text-[15px] font-bold text-[#1a1b22]">Daily Speed Drill (DPP)</h4>
            <p className="text-[12px] text-[#454652] mt-0.5">
              Instant 45-minute timed test with step-by-step solutions
            </p>
          </button>
        </div>
      </div>


      {/* Daily Study Time & Streak Hub */}
      <div className="bg-white rounded-3xl p-5 border border-[#e3e1ea] shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#24389c]/10 text-[#24389c] flex items-center justify-center font-black">
              ⏱️
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#1a1b22]">
                Daily Study Timer & Streak Hub
              </h3>
              <p className="text-[12px] text-[#454652]">
                4-Hour Daily Threshold for Streak Validation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenStudyTracker}
            className="px-3.5 py-1.5 rounded-xl bg-[#24389c] text-white text-[12px] font-bold hover:bg-[#1a2b7b] transition-all shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">timer</span>
            Open Timer
          </button>
        </div>

        {/* 2-Column Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#f8f9ff] p-3.5 rounded-2xl border border-[#dee0ff]">
            <span className="text-[11px] font-bold text-[#454652] block uppercase tracking-wider">
              Today's Focus Time
            </span>
            <span className="text-[20px] font-black text-[#24389c] block mt-0.5">
              {formatHoursMins(todayStudySeconds)}
            </span>
            <span className="text-[11px] text-[#6b6d7c] font-medium block mt-0.5">
              Target: 4 Hours / Day
            </span>
          </div>

          <div className="bg-[#fdfaf2] p-3.5 rounded-2xl border border-[#fae5b8]">
            <span className="text-[11px] font-bold text-amber-800 block uppercase tracking-wider">
              Streak Status
            </span>
            <span className="text-[20px] font-black text-amber-600 flex items-center gap-1 mt-0.5">
              🔥 {currentStreakDays} Days
            </span>
            <span className="text-[11px] font-semibold text-amber-700 block mt-0.5">
              {isStreakAchievedToday ? '✓ 4h Target Hit Today!' : '⏳ In Progress'}
            </span>
          </div>
        </div>

        {/* Quick Launch Study Timer Strip */}
        <div className="bg-[#f4f2fc] p-3.5 rounded-2xl flex items-center justify-between flex-wrap gap-2">
          <div className="text-[13px] font-semibold text-[#1a1b22]">
            Ready to log chapter study or solve PYQs?
          </div>
          <button
            type="button"
            onClick={onOpenStudyTracker}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#24389c] text-[#24389c] hover:bg-[#dee0ff] text-[12px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[15px]">play_circle</span>
            Start Live Tracker
          </button>
        </div>
      </div>

      {/* Daily Timetable & Mission Planner Hub */}
      <div className="bg-white rounded-3xl p-5 border border-[#e3e1ea] shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#6f48b2]/10 text-[#6f48b2] flex items-center justify-center font-black text-[20px]">
              📅
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#1a1b22]">
                Today's Study Timetable & Schedule
              </h3>
              <p className="text-[12px] text-[#454652]">
                Planned: <strong className="text-[#24389c]">{formatDurationHuman(totalPlannedMins)}</strong> • {completedSlotCount}/{studySlotCount} tasks completed
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToTimetable}
            className="px-3.5 py-1.5 rounded-xl bg-[#24389c] text-white text-[12px] font-bold hover:bg-[#1a2b7b] transition-all shadow-xs flex items-center gap-1 cursor-pointer"
          >
            Open Planner
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>

        {/* Next Scheduled Slots Preview */}
        {upcomingSlots.length > 0 ? (
          <div className="space-y-2 mb-3.5">
            {upcomingSlots.map((s) => (
              <div
                key={s.id}
                onClick={onNavigateToTimetable}
                className="p-3 rounded-2xl bg-[#fbf8ff] border border-[#efedf6] hover:border-[#24389c]/40 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-[12px] font-extrabold text-[#24389c] bg-[#dee0ff]/60 px-2 py-0.5 rounded-md shrink-0">
                    {formatTime24to12(s.startTime)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#1a1b22] truncate">{s.title}</p>
                    <p className="text-[11px] text-[#6b6d7c] truncate">{s.subject} • {s.description || 'Target practice'}</p>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-[#24389c] bg-[#dee0ff] px-2 py-0.5 rounded-full shrink-0 ml-2">
                  Due Next
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3.5 bg-[#f4fbf5] rounded-2xl border border-emerald-200 text-[13px] text-emerald-800 font-semibold mb-3.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">task_alt</span>
            All scheduled timetable tasks completed for today!
          </div>
        )}

        <div className="pt-2 border-t border-[#efedf6] flex items-center justify-between text-[12px]">
          <span className="text-[#454652]">Need to adjust timing or add new chapter slots?</span>
          <button
            type="button"
            onClick={onNavigateToTimetable}
            className="text-[#24389c] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
          >
            + Add / Modify Timetable
          </button>
        </div>
      </div>


      {/* Recent Tests Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-bold text-[#1a1b22] uppercase tracking-wider opacity-80">
            RECENT TESTS
          </h3>
          <button
            type="button"
            onClick={onOpenTestResultsDemo}
            className="text-[12px] font-bold text-[#24389c] hover:underline"
          >
            View Latest Report
          </button>
        </div>

        <div className="space-y-3">
          <div
            onClick={onOpenTestResultsDemo}
            className="bg-white rounded-2xl p-4 border border-[#e3e1ea] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#34A853]/15 text-[#34A853] flex items-center justify-center font-extrabold text-[15px]">
                92%
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-[#1a1b22]">
                  NEET Full Mock Test (720 Marks)
                </h4>
                <p className="text-[12px] text-[#454652]">
                  Phy, Chem, Botany, Zoology • 180 Questions
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[16px] font-extrabold text-[#24389c] block">
                680/720
              </span>
              <span className="text-[11px] font-semibold text-[#6f48b2]">
                99.4 Percentile
              </span>
            </div>
          </div>

          <div
            onClick={onOpenTestResultsDemo}
            className="bg-white rounded-2xl p-4 border border-[#e3e1ea] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#24389c]/15 text-[#24389c] flex items-center justify-center font-extrabold text-[15px]">
                88%
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-[#1a1b22]">
                  Kinematics & Thermodynamics DPP
                </h4>
                <p className="text-[12px] text-[#454652]">
                  PYQ Mix • 30 Questions
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[16px] font-extrabold text-[#24389c] block">
                108/120
              </span>
              <span className="text-[11px] font-semibold text-[#34A853]">
                Completed Yesterday
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Weak Areas Recommendation */}
      <div className="bg-[#f4f2fc] rounded-2xl p-4 border border-[#e3e1ea]">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#6f48b2] text-[20px]">
            auto_awesome
          </span>
          <h4 className="text-[14px] font-bold text-[#1a1b22]">
            AI Weakness Radar
          </h4>
        </div>
        <p className="text-[13px] text-[#454652] leading-relaxed">
          You missed questions in <strong className="text-[#1a1b22]">Coordination Complexes</strong> and{' '}
          <strong className="text-[#1a1b22]">Circular Motion Acceleration</strong>. We recommend a 15-min targeted drill.
        </p>
        <button
          type="button"
          onClick={onStartQuickDPP}
          className="mt-3 w-full py-2.5 rounded-xl bg-[#6f48b2] text-white text-[13px] font-bold hover:bg-[#572e99] transition-colors"
        >
          Practice Weak Areas Now
        </button>
      </div>

      {/* Creator Watermark Signature */}
      <div className="flex flex-col items-center justify-center pt-2 pb-4 text-center select-none">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#24389c]/10 via-[#6f48b2]/10 to-[#24389c]/10 border border-[#24389c]/20 shadow-xs">
          <span className="material-symbols-outlined text-[#24389c] text-[18px]">verified_user</span>
          <span className="font-mono text-[12px] sm:text-[13px] font-black tracking-wider uppercase text-[#24389c]">
            PrepPulse by - ANKIT KUMAR TRIPATHY
          </span>
        </div>
        <p className="text-[11px] text-[#585966] font-medium mt-1.5 opacity-80">
          Official NEET & JEE Adaptive Prep Platform • Created by Ankit Kumar Tripathy
        </p>
      </div>
    </div>
  );
};

