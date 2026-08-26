import React, { useMemo } from 'react';
import { StreakTrackerState } from '../types';
import { formatHoursAndMinutes } from '../data/studyStorage';
import { loadTestHistory, loadMistakesNotebook } from '../data/testHistoryStorage';

interface AnalyticsScreenProps {
  trackerState?: StreakTrackerState;
  onOpenStudyTracker?: () => void;
  onNavigateToTests?: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  trackerState,
  onOpenStudyTracker,
  onNavigateToTests,
}) => {
  const todaySecs = trackerState?.todaySeconds || 0;
  const streakDays = trackerState?.currentStreakDays || 0;
  const history = trackerState?.weeklyHistory || [];
  const allTimeHours = Math.round((trackerState?.allTimeStudySeconds || 0) / 3600);

  const totalWeeklySeconds = history.reduce((acc, cur) => acc + cur.totalSeconds, 0);
  const avgDailyHours = (totalWeeklySeconds / (history.length || 1) / 3600).toFixed(1);

  // Dynamic test history computation
  const testHistory = useMemo(() => loadTestHistory(), []);
  const mistakeCount = useMemo(() => loadMistakesNotebook().length, []);

  const totalTestsCount = testHistory.length;
  const totalQuestionsAnswered = testHistory.reduce((acc, t) => acc + t.attemptedCount, 0);
  const totalCorrectAnswered = testHistory.reduce((acc, t) => acc + t.correctCount, 0);
  const totalTimeSpentSeconds = testHistory.reduce((acc, t) => acc + t.timeSpentSeconds, 0);

  const averageAccuracyPercent = totalQuestionsAnswered > 0
    ? ((totalCorrectAnswered / totalQuestionsAnswered) * 100).toFixed(1)
    : '0.0';

  const averagePaceSeconds = totalQuestionsAnswered > 0
    ? Math.round(totalTimeSpentSeconds / totalQuestionsAnswered)
    : 0;

  // Calculate subject mastery from test attempts if available
  const physicsTests = testHistory.flatMap((t) => t.subjectBreakdown.filter((s) => s.subject.toLowerCase().includes('phys')));
  const chemTests = testHistory.flatMap((t) => t.subjectBreakdown.filter((s) => s.subject.toLowerCase().includes('chem')));
  const bioTests = testHistory.flatMap((t) => t.subjectBreakdown.filter((s) => s.subject.toLowerCase().includes('bot') || s.subject.toLowerCase().includes('zoo') || s.subject.toLowerCase().includes('bio')));

  const physicsMastery = physicsTests.length > 0
    ? Math.round(physicsTests.reduce((acc, c) => acc + c.percentage, 0) / physicsTests.length)
    : 0;

  const chemMastery = chemTests.length > 0
    ? Math.round(chemTests.reduce((acc, c) => acc + c.percentage, 0) / chemTests.length)
    : 0;

  const bioMastery = bioTests.length > 0
    ? Math.round(bioTests.reduce((acc, c) => acc + c.percentage, 0) / bioTests.length)
    : 0;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-28 gap-6 animate-fade-in">
      <div>
        <h1 className="text-[28px] font-bold text-[#1a1b22] tracking-tight">
          Performance & Study Analytics
        </h1>
        <p className="text-[15px] text-[#454652] mt-0.5">
          Real-time metrics, daily 4-hour streak logs, and exam accuracy.
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
              className="bg-white text-[#24389c] text-[12px] font-extrabold px-3 py-1.5 rounded-xl shadow-xs hover:bg-[#dee0ff] transition-all cursor-pointer active:scale-95"
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
            <span className="text-[18px] font-black text-amber-300 block mt-0.5 font-mono">
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
            <span className="text-[18px] font-black text-amber-300 block mt-0.5 font-mono">
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
            <span className="text-[18px] font-black text-amber-300 block mt-0.5 font-mono">
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
              const heightPercent = Math.min(100, Math.round((hours / 4) * 100));
              const isGoalMet = day.isStreakAchieved;

              return (
                <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full bg-white/20 rounded-t-lg relative flex flex-col justify-end overflow-hidden h-full">
                    {day.totalSeconds > 0 ? (
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isGoalMet
                            ? 'bg-gradient-to-t from-amber-400 to-amber-300'
                            : 'bg-gradient-to-t from-teal-400 to-emerald-300'
                        }`}
                        style={{ height: `${Math.max(12, heightPercent)}%` }}
                      />
                    ) : (
                      <div className="w-full h-1 bg-white/30 rounded-t-sm" />
                    )}
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

      {/* Summary Stats Grid (Calculated from real attempts) */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#e3e1ea] shadow-sm text-center">
          <span className="text-[12px] font-semibold text-[#454652] block mb-1">
            Total Tests
          </span>
          <span className="text-[24px] font-black text-[#24389c]">
            {totalTestsCount}
          </span>
          <span className="text-[11px] font-bold text-[#6b6d7c] block mt-0.5">
            {totalQuestionsAnswered} Qs attempted
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#e3e1ea] shadow-sm text-center">
          <span className="text-[12px] font-semibold text-[#454652] block mb-1">
            Avg. Accuracy
          </span>
          <span className="text-[24px] font-black text-[#6f48b2]">
            {totalQuestionsAnswered > 0 ? `${averageAccuracyPercent}%` : '0.0%'}
          </span>
          <span className="text-[11px] font-bold text-[#34A853] block mt-0.5">
            {totalCorrectAnswered} correct
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#e3e1ea] shadow-sm text-center">
          <span className="text-[12px] font-semibold text-[#454652] block mb-1">
            Time / Question
          </span>
          <span className="text-[24px] font-black text-[#24389c]">
            {averagePaceSeconds > 0 ? `${averagePaceSeconds}s` : '0s'}
          </span>
          <span className="text-[11px] font-bold text-[#6b6d7c] block mt-0.5">
            Target: ≤ 60s
          </span>
        </div>
      </div>

      {/* If 0 Tests Taken: Helpful Prompt */}
      {totalTestsCount === 0 && (
        <div className="bg-blue-50/70 border border-[#dee0ff] rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[24px]">🎯</span>
            <div>
              <p className="text-[14px] font-bold text-[#1a1b22]">Ready to start testing?</p>
              <p className="text-[12px] text-[#454652]">
                Take a quick DPP or full Mock Exam to generate personalized accuracy trends and subject mastery.
              </p>
            </div>
          </div>
          {onNavigateToTests && (
            <button
              type="button"
              onClick={onNavigateToTests}
              className="px-3 py-1.5 rounded-xl bg-[#24389c] text-white text-[12px] font-bold hover:bg-[#1a2b7b] transition-all shrink-0 cursor-pointer shadow-xs"
            >
              Start First Test
            </button>
          )}
        </div>
      )}

      {/* Subject Mastery Breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-[#e3e1ea] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[#1a1b22]">
            Subject Mastery & Test Performance
          </h3>
          <span className="text-[12px] text-[#585966] font-medium">
            {totalTestsCount > 0 ? `${totalTestsCount} Tests Recorded` : 'Zero Baseline (Take tests to update)'}
          </span>
        </div>

        <div className="space-y-3.5">
          <div>
            <div className="flex justify-between text-[13px] font-bold mb-1">
              <span className="text-[#1a1b22]">Physics (11 & 12)</span>
              <span className="text-[#24389c]">{physicsMastery}% Mastery</span>
            </div>
            <div className="h-3 w-full bg-[#efedf6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#24389c] rounded-full transition-all duration-700"
                style={{ width: `${Math.max(physicsMastery, physicsMastery > 0 ? 5 : 0)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[13px] font-bold mb-1">
              <span className="text-[#1a1b22]">Chemistry (Physical, Organic, Inorganic)</span>
              <span className="text-[#6f48b2]">{chemMastery}% Mastery</span>
            </div>
            <div className="h-3 w-full bg-[#efedf6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6f48b2] rounded-full transition-all duration-700"
                style={{ width: `${Math.max(chemMastery, chemMastery > 0 ? 5 : 0)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[13px] font-bold mb-1">
              <span className="text-[#1a1b22]">Biology / Botany & Zoology</span>
              <span className="text-[#34A853]">{bioMastery}% Mastery</span>
            </div>
            <div className="h-3 w-full bg-[#efedf6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#34A853] rounded-full transition-all duration-700"
                style={{ width: `${Math.max(bioMastery, bioMastery > 0 ? 5 : 0)}%` }}
              />
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
          {totalTestsCount > 0
            ? `Your recorded average test pace is ${averagePaceSeconds}s per question across ${totalQuestionsAnswered} questions with an overall accuracy of ${averageAccuracyPercent}%. Maintain under 60 seconds on standard questions to leave maximum time for complex multi-concept numericals.`
            : `Speed and accuracy insights are generated continuously as you solve Daily Practice Problems and Full Mock tests. Start your first session to calibrate your speed baseline!`}
        </p>
      </div>

      {/* Mistake Notebook Overview */}
      {mistakeCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[22px]">📓</span>
            <div>
              <h4 className="text-[14px] font-bold text-amber-900">
                {mistakeCount} Questions Logged in Mistake Notebook
              </h4>
              <p className="text-[12px] text-amber-800">
                Review and re-solve your incorrect attempts to eliminate recurring errors.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
