import React from 'react';
import { StreakTrackerState, UserProfile } from '../types';
import { formatHoursAndMinutes, resetTodayStudyTime } from '../data/studyStorage';

interface ProfileScreenProps {
  onStartTest: () => void;
  onOpenStudyTracker?: () => void;
  trackerState?: StreakTrackerState;
  userProfile: UserProfile;
  onOpenLoginModal: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetStudyTime?: () => void;
  onClearAllAppData?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onStartTest,
  onOpenStudyTracker,
  trackerState,
  userProfile,
  onOpenLoginModal,
  onUpdateProfile,
  onResetStudyTime,
  onClearAllAppData,
}) => {
  const [showConfirmResetModal, setShowConfirmResetModal] = React.useState<boolean>(false);
  const streakDays = trackerState?.currentStreakDays || 0;
  const todaySecs = trackerState?.todaySeconds || 0;
  const isStreakAchieved = trackerState?.isStreakAchievedToday || false;

  const handleExamChange = (exam: 'NEET' | 'JEE') => {
    onUpdateProfile({
      ...userProfile,
      targetExam: exam,
    });
  };

  const handleGoalChange = (newGoal: number) => {
    onUpdateProfile({
      ...userProfile,
      dailyGoalQuestions: newGoal,
    });
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-28 gap-6 animate-fade-in">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e3e1ea] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative group shrink-0">
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-md border-2 border-[#24389c]/30 bg-gray-100"
            />
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#24389c] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
              title="Change Profile Picture"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[19px] sm:text-[21px] font-black text-[#1a1b22] truncate">
                {userProfile.name}
              </h2>
              <span className="material-symbols-outlined text-[#24389c] text-[18px]" title="Verified Student">
                verified
              </span>
            </div>

            {userProfile.email ? (
              <p className="text-[13px] text-[#585966] font-medium truncate mt-0.5">
                {userProfile.email}
              </p>
            ) : (
              <p className="text-[13px] text-[#585966] font-medium truncate mt-0.5">
                Targeting: {userProfile.targetExam === 'NEET' ? 'NEET (UG) Medical' : 'JEE Main & Advanced'}
              </p>
            )}

            {userProfile.dreamCollege && (
              <p className="text-[12px] text-[#24389c] font-bold truncate mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">school</span>
                {userProfile.dreamCollege} • Class of {userProfile.targetYear}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="bg-[#24389c]/10 text-[#24389c] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Target: {userProfile.targetExam === 'NEET' ? 'NEET (Medical)' : 'JEE (Engineering)'}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                isStreakAchieved
                  ? 'bg-amber-100 text-amber-900 border border-amber-300/40'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                🔥 {streakDays}d Streak ({isStreakAchieved ? 'Secured Today' : '0/4h In Progress'})
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex sm:flex-col items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
          <button
            type="button"
            onClick={onOpenLoginModal}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#24389c] text-white text-[13px] font-bold hover:bg-[#1a2b7b] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit_square</span>
            <span>Edit Profile & Photo</span>
          </button>

          <button
            type="button"
            onClick={onOpenLoginModal}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 text-[11px] font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">switch_account</span>
            <span>Switch User</span>
          </button>
        </div>
      </div>

      {/* 4-Hour Day Streak & Live Study Tracker Hub */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e3e1ea] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#24389c]/10 text-[#24389c] flex items-center justify-center text-[20px]">
              ⏱️
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#1a1b22]">
                Study Time & 4-Hour Daily Streak
              </h3>
              <p className="text-[12px] text-[#585966]">
                Timer starts at 0 until activated for focused revision
              </p>
            </div>
          </div>

          {onOpenStudyTracker && (
            <button
              type="button"
              onClick={onOpenStudyTracker}
              className="text-[12px] font-bold text-[#24389c] bg-[#dee0ff]/50 px-3 py-1 rounded-xl hover:bg-[#dee0ff] transition-all"
            >
              Open Tracker
            </button>
          )}
        </div>

        <div className="bg-[#f8f9ff] p-4 rounded-2xl border border-[#dee0ff] flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-[11px] font-bold text-[#454652] uppercase block">
              Today's Logged Study Time
            </span>
            <span className="text-[20px] font-black text-[#24389c] block font-mono mt-0.5">
              {formatHoursAndMinutes(todaySecs)} / 4h 00m
            </span>
            <span className="text-[11px] text-[#585966]">
              {todaySecs === 0 ? 'Timer is at 0h 00m. Start study session to track.' : `${Math.max(0, 14400 - todaySecs) > 0 ? formatHoursAndMinutes(14400 - todaySecs) + ' remaining for 4h streak' : '4-hour target achieved!'}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-xl text-[12px] font-extrabold ${
              isStreakAchieved ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-gray-100 text-gray-700'
            }`}>
              {isStreakAchieved ? '🔥 4h Streak Achieved!' : '⏳ Target: 4h Daily'}
            </span>

            {todaySecs > 0 && onResetStudyTime && (
              <button
                type="button"
                onClick={onResetStudyTime}
                className="text-[11px] font-bold text-red-600 hover:underline px-2 py-1"
                title="Reset today's timer back to 0"
              >
                Reset to 0
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Target Goal Settings */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e3e1ea] shadow-sm space-y-4">
        <h3 className="text-[16px] font-black text-[#1a1b22]">Target Goal Settings</h3>

        <div>
          <label className="text-[12px] font-bold text-[#454652] uppercase tracking-wider block mb-2">
            Default Target Entrance Exam
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleExamChange('NEET')}
              className={`py-3 rounded-2xl text-[14px] font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                userProfile.targetExam === 'NEET'
                  ? 'bg-[#24389c] text-white shadow-sm'
                  : 'bg-[#efedf6] text-[#454652] hover:bg-[#e3e1ea]'
              }`}
            >
              <span>🩺</span> NEET (Medical)
            </button>
            <button
              type="button"
              onClick={() => handleExamChange('JEE')}
              className={`py-3 rounded-2xl text-[14px] font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                userProfile.targetExam === 'JEE'
                  ? 'bg-[#24389c] text-white shadow-sm'
                  : 'bg-[#efedf6] text-[#454652] hover:bg-[#e3e1ea]'
              }`}
            >
              <span>⚡</span> JEE Main / Advanced
            </button>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center text-[13px] font-bold mb-1.5">
            <span className="text-[#454652]">Daily Practice Target</span>
            <span className="text-[#24389c] font-black">{userProfile.dailyGoalQuestions} Questions / Day</span>
          </div>
          <input
            type="range"
            min="15"
            max="120"
            step="15"
            value={userProfile.dailyGoalQuestions}
            onChange={(e) => handleGoalChange(parseInt(e.target.value, 10))}
            className="w-full accent-[#24389c] h-2 bg-[#efedf6] rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Bookmarked Questions & Study Library */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e3e1ea] shadow-sm space-y-3">
        <h3 className="text-[16px] font-black text-[#1a1b22]">Study Library</h3>

        <div className="divide-y divide-[#efedf6]">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6f48b2]/10 text-[#6f48b2] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">bookmark</span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1a1b22]">Saved & Starred Problems</p>
                <p className="text-[12px] text-[#454652]">High-yield questions saved for final revision</p>
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
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">error</span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1a1b22]">Mistake Notebook</p>
                <p className="text-[12px] text-[#454652]">Incorrect and unattempted concepts</p>
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

      {/* Data Management & Fresh Start */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e3e1ea] shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">restart_alt</span>
          </div>
          <div>
            <h3 className="text-[16px] font-black text-[#1a1b22]">Reset App Data & Responses</h3>
            <p className="text-[12px] text-[#585966]">
              Clear all test answers, study timer logs, and start fresh from the very beginning.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[12px] text-gray-500">
            Resets all practice logs, mistakes notebook, timetable checks, and timer to 0.
          </span>
          <button
            type="button"
            onClick={() => setShowConfirmResetModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12px] font-bold border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">delete_forever</span>
            Clear All Data & Start Fresh
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showConfirmResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-[24px]">
              ⚠️
            </div>
            
            <div className="text-center">
              <h3 className="text-[18px] font-black text-[#1a1b22]">
                Reset All Responses & Start from Scratch?
              </h3>
              <p className="text-[13px] text-[#585966] mt-1.5 leading-relaxed">
                This will reset your study timer back to 0h 00m, clear test responses, uncheck syllabus chapters, and clear your mistake notebook so you start completely clean.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmResetModal(false)}
                className="py-2.5 rounded-xl border border-gray-300 text-gray-700 text-[13px] font-bold hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmResetModal(false);
                  if (onClearAllAppData) {
                    onClearAllAppData();
                  }
                }}
                className="py-2.5 rounded-xl bg-rose-600 text-white text-[13px] font-bold hover:bg-rose-700 transition-all shadow-sm cursor-pointer"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
