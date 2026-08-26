import React from 'react';
import { StreakTrackerState } from '../types';
import { formatHoursAndMinutes } from '../data/studyStorage';

interface AnalyticsScreenProps {
  trackerState?: StreakTrackerState;
  onOpenStudyTracker?: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  trackerState,
  onOpenStudyTracker,
}) => {
  const todaySecs = trackerState?.todaySeconds || 8100;
  const streakDays = trackerState?.currentStreakDays || 7;
  const history = trackerState?.weeklyHistory || [];
  const allTimeHours = Math.round((trackerState?.allTimeStudySeconds || 3600 * 95) / 3600);

  const avgDailyHours = (
    history.reduce((acc, cur) => acc + cur.totalSeconds, 0) / (history.length || 1) / 3600
  ).toFixed(1);

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-28 gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#1a1b22] tracking-tight">
          Performance & Study Analytics
        </h1>
        <p className="text-[15px] text-[#454652] mt-0.5">
          In-depth insights into your exam preparation, daily 4-hour streaks, and accuracy.
        </p>
      </div>

      {/* 4-Hour Daily Study Time & Streak Consistency Card */}
      <div className="bg-gradient-to-br from-[#24389c] via-[#311b92] to-[#4a148c] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-[26px]">⏱️</span>
            <div>
              <h2 className="text-[17px] font-black text-white">
                Daily Study Hours & 4h Streak Analytics
              </h2>
              <p className="text-[12px] text-white/80">
                Consistency is the #1 predictor of 99+ Percentile in NEET & JEE
              </p>
            </div>
          </div>

          {onOpenStudyTracker && (
            <button
              type="button"
              onClick={onOpenStudyTracker}
              className="bg-white text-[#24389c] text-[12px] font-extrabold px-3 py-1.5 rounded-xl shadow-xs hover:bg-[#dee0ff] transition-all cursor-pointer"
            >
              Study Timer
            </button>
          )}
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-3 gap-2 text-center bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
          <div>
            <span className="text-[11px] text-white/80 font-bold uppercase block">
              Today Studied
            </span>
            <span className="text-[18px] font-black text-amber-300 block mt-0.5">
              {formatHoursAndMinutes(todaySecs)}
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold">
              Goal: 4h / Day
            </span>
          </div>

          <div>
            <span className="text-[11px] text-white/80 font-bold uppercase block">
              Current Streak
            </span>
            <span className="text-[18px] font-black text-amber-300 block mt-0.5">
              🔥 {streakDays} Days
            </span>
            <span className="text-[10px] text-white/80 font-semibold">
              Min 4h Verified
            </span>
          </div>

          <div>
            <span className="text-[11px] text-white/80 font-bold uppercase block">
              Weekly Avg
            </span>
            <span className="text-[18px] font-black text-amber-300 block mt-0.5">
              {avgDailyHours} hrs/day
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold">
              Total {allTimeHours}h Logged
            </span>
          </div>
        </div>

        {/* 7-Day Hours Visual Bar Chart */}
        <div className="mt-4 pt-3 border-t border-white/15">
          <div className="flex justify-between items-center text-[12px] font-bold text-white/90 mb-2">
            <span>7-Day Daily Study Time Breakdown</span>
            <span className="text-[11px] text-amber-300">4h Target Line</span>
          </div>

          <div className="grid grid-cols-7 gap-2 items-end h-24 pt-2">
            {history.map((day) => {
              const hours = day.totalSeconds / 3600;
              const heightPercent = Math.min(100, Math.round((hours / 6) * 100));
              const isGoalMet = day.isStreakAchieved;

              return (
                <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full bg-white/20 rounded-t-lg relative flex flex-col justify-end overflow-hidden h-full">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isGoalMet
                          ? 'bg-gradient-to-t from-amber-400 to-amber-300'
                          : 'bg-gradient-to-t from-teal-400 to-emerald-300'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-white/80">
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#e3e1ea] shadow-sm text-center">
          <span className="text-[12px] font-semibold text-[#454652] block mb-1">
            Total Tests
          </span>
          <span className="text-[24px] font-black text-[#24389c]">28</span>
          <span className="text-[11px] font-bold text-[#34A853] block mt-0.5">
            +4 this week
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#e3e1ea] shadow-sm text-center">
          <span className="text-[12px] font-semibold text-[#454652] block mb-1">
            Avg. Accuracy
          </span>
          <span className="text-[24px] font-black text-[#6f48b2]">91.4%</span>
          <span className="text-[11px] font-bold text-[#34A853] block mt-0.5">
            +3.2% trend
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#e3e1ea] shadow-sm text-center">
          <span className="text-[12px] font-semibold text-[#454652] block mb-1">
            Time / Question
          </span>
          <span className="text-[24px] font-black text-[#24389c]">48s</span>
          <span className="text-[11px] font-bold text-[#34A853] block mt-0.5">
            Optimal pace
          </span>
        </div>
      </div>

      {/* Subject Mastery Breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-[#e3e1ea] shadow-sm space-y-4">
        <h3 className="text-[16px] font-bold text-[#1a1b22]">Subject Mastery & Syllabus Completion</h3>

        <div className="space-y-3.5">
          <div>
            <div className="flex justify-between text-[13px] font-bold mb-1">
              <span className="text-[#1a1b22]">Physics (11 & 12)</span>
              <span className="text-[#24389c]">92% Mastery</span>
            </div>
            <div className="h-3 w-full bg-[#efedf6] rounded-full overflow-hidden">
              <div className="h-full bg-[#24389c] rounded-full w-[92%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[13px] font-bold mb-1">
              <span className="text-[#1a1b22]">Chemistry (Physical, Organic, Inorganic)</span>
              <span className="text-[#6f48b2]">86% Mastery</span>
            </div>
            <div className="h-3 w-full bg-[#efedf6] rounded-full overflow-hidden">
              <div className="h-full bg-[#6f48b2] rounded-full w-[86%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[13px] font-bold mb-1">
              <span className="text-[#1a1b22]">Biology / Botany & Zoology</span>
              <span className="text-[#34A853]">96% Mastery</span>
            </div>
            <div className="h-3 w-full bg-[#efedf6] rounded-full overflow-hidden">
              <div className="h-full bg-[#34A853] rounded-full w-[96%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Speed vs Accuracy Matrix */}
      <div className="bg-[#f4f2fc] rounded-2xl p-5 border border-[#e3e1ea]">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#24389c]">timer</span>
          <h4 className="text-[15px] font-bold text-[#1a1b22]">
            Speed vs. Accuracy Matrix
          </h4>
        </div>
        <p className="text-[13px] text-[#454652] leading-relaxed">
          Your highest scoring speed occurs between 40s to 55s per question in Organic Chemistry and Kinematics. Hard physics problems take an average of 82s with 75% accuracy.
        </p>
      </div>
    </div>
  );
};
