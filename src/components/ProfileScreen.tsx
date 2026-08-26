import React, { useState } from 'react';
import { StreakTrackerState } from '../types';
import { formatHoursAndMinutes } from '../data/studyStorage';

interface ProfileScreenProps {
  onStartTest: () => void;
  onOpenStudyTracker?: () => void;
  trackerState?: StreakTrackerState;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onStartTest,
  onOpenStudyTracker,
  trackerState,
}) => {
  const [selectedExam, setSelectedExam] = useState<'NEET' | 'JEE'>('NEET');
  const [dailyGoal, setDailyGoal] = useState<number>(45);

  const streakDays = trackerState?.currentStreakDays || 7;
  const todaySecs = trackerState?.todaySeconds || 8100;
  const isStreakAchieved = trackerState?.isStreakAchievedToday || false;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-28 gap-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#e3e1ea] shadow-sm flex items-center gap-4">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVF2wKQMB8iGxlrpba4Ixllg9cZHIs4c0X4HOGu0RFDU4lT35uHeVmA1ylj2g1YoUdEzOLVyi3ZZYaTC74cLlA0wz_6Mr9XVmyqNkIDRvWVhjOA2FKDPmInR08eJ-QBq4cOEEUFGlCkjHMC-y53QxSnqc7jzeUoswVT61CFE2dAAq3FhTrHIurEpSUjUyD_NgByg3QC6_DTVJE9hAm8Q4Hari1ga0b4XuNWXHcbnQd5qhQbz3hM5dEDw"
          alt="Ankit Tripathy"
          className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-[#24389c]/20"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-bold text-[#1a1b22] truncate">
            Ankit Tripathy
          </h2>
          <p className="text-[13px] text-[#454652] truncate">
            ankittripathy782@gmail.com
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="bg-[#24389c]/10 text-[#24389c] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Target: {selectedExam}
            </span>
            <span className="bg-amber-400/20 text-amber-900 border border-amber-300/40 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              🔥 {streakDays}d Streak ({isStreakAchieved ? 'Secured' : 'In Progress'})
            </span>
          </div>
        </div>
      </div>

      {/* 4-Hour Day Streak & Time Tracker Hub */}
      <div className="bg-white rounded-2xl p-5 border border-[#e3e1ea] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[20px]">⏱️</span>
            <h3 className="text-[15px] font-bold text-[#1a1b22]">
              Study Time & 4-Hour Streak Rule
            </h3>
          </div>
          {onOpenStudyTracker && (
            <button
              type="button"
              onClick={onOpenStudyTracker}
              className="text-[12px] font-bold text-[#24389c] hover:underline"
            >
              Open Tracker
            </button>
          )}
        </div>

        <p className="text-[13px] text-[#454652] leading-relaxed">
          PrepPulse rewards true consistency: day streaks are only awarded once you complete a <strong className="text-[#1a1b22]">minimum 4 hours (240 mins)</strong> of focused study in a day. Every time your study time increases, real-time praise and milestone badges are recorded.
        </p>

        <div className="bg-[#f8f9ff] p-3.5 rounded-xl border border-[#dee0ff] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#454652] uppercase block">
              Today's Logged Focus
            </span>
            <span className="text-[16px] font-black text-[#24389c]">
              {formatHoursAndMinutes(todaySecs)} / 4h 00m
            </span>
          </div>

          <span className={`px-3 py-1 rounded-lg text-[11px] font-extrabold ${
            isStreakAchieved ? 'bg-amber-100 text-amber-800' : 'bg-[#dee0ff] text-[#24389c]'
          }`}>
            {isStreakAchieved ? '🔥 Streak Earned!' : '⏳ Target Pending'}
          </span>
        </div>
      </div>

      {/* Target Exam Switcher */}
      <div className="bg-white rounded-2xl p-5 border border-[#e3e1ea] shadow-sm space-y-3">
        <h3 className="text-[15px] font-bold text-[#1a1b22]">Target Goal Settings</h3>

        <div>
          <label className="text-[12px] font-semibold text-[#454652] block mb-2">
            Default Target Exam
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedExam('NEET')}
              className={`py-2.5 rounded-xl text-[14px] font-bold transition-all cursor-pointer ${
                selectedExam === 'NEET'
                  ? 'bg-[#24389c] text-white shadow-sm'
                  : 'bg-[#efedf6] text-[#454652] hover:bg-[#e3e1ea]'
              }`}
            >
              NEET (Medical)
            </button>
            <button
              type="button"
              onClick={() => setSelectedExam('JEE')}
              className={`py-2.5 rounded-xl text-[14px] font-bold transition-all cursor-pointer ${
                selectedExam === 'JEE'
                  ? 'bg-[#24389c] text-white shadow-sm'
                  : 'bg-[#efedf6] text-[#454652] hover:bg-[#e3e1ea]'
              }`}
            >
              JEE Main (Engineering)
            </button>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center text-[13px] font-semibold mb-1">
            <span className="text-[#454652]">Daily Practice Goal</span>
            <span className="text-[#24389c] font-bold">{dailyGoal} Questions / day</span>
          </div>
          <input
            type="range"
            min="15"
            max="90"
            step="15"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(parseInt(e.target.value))}
            className="w-full accent-[#24389c] h-2 bg-[#efedf6] rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Bookmarked Questions & Study Library */}
      <div className="bg-white rounded-2xl p-5 border border-[#e3e1ea] shadow-sm space-y-3">
        <h3 className="text-[15px] font-bold text-[#1a1b22]">Study Library</h3>

        <div className="divide-y divide-[#efedf6]">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#6f48b2]">bookmark</span>
              <div>
                <p className="text-[14px] font-semibold text-[#1a1b22]">Saved & Starred PYQs</p>
                <p className="text-[12px] text-[#454652]">18 high-yield questions saved</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onStartTest}
              className="text-[13px] font-bold text-[#24389c] hover:underline cursor-pointer"
            >
              Practice
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ba1a1a]">error</span>
              <div>
                <p className="text-[14px] font-semibold text-[#1a1b22]">Mistake Notebook</p>
                <p className="text-[12px] text-[#454652]">12 questions to master</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onStartTest}
              className="text-[13px] font-bold text-[#24389c] hover:underline cursor-pointer"
            >
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
