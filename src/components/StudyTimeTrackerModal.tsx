import React, { useState, useEffect, useRef } from 'react';
import { StreakTrackerState } from '../types';
import {
  formatSecondsToDigital,
  formatHoursAndMinutes,
  STREAK_THRESHOLD_SECONDS,
  STUDY_SUBJECT_OPTIONS,
} from '../data/studyStorage';

interface StudyTimeTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  trackerState: StreakTrackerState;
  onSaveSession: (seconds: number, subject: string, topic: string, mode: 'stopwatch' | 'pomodoro' | 'custom') => void;
  // External control of active session state if minimized
  sessionSeconds: number;
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  selectedSubject: string;
  onSelectSubject: (sub: string) => void;
  topicNotes: string;
  onChangeTopicNotes: (notes: string) => void;
  timerMode: 'stopwatch' | 'pomodoro';
  onSelectTimerMode: (mode: 'stopwatch' | 'pomodoro') => void;
  pomodoroTargetMinutes: number;
  onSelectPomodoroTarget: (mins: number) => void;
}

export const StudyTimeTrackerModal: React.FC<StudyTimeTrackerModalProps> = ({
  isOpen,
  onClose,
  onMinimize,
  trackerState,
  onSaveSession,
  sessionSeconds,
  isRunning,
  onToggleTimer,
  onResetTimer,
  selectedSubject,
  onSelectSubject,
  topicNotes,
  onChangeTopicNotes,
  timerMode,
  onSelectTimerMode,
  pomodoroTargetMinutes,
  onSelectPomodoroTarget
}) => {
  const [quickAddMinutes, setQuickAddMinutes] = useState<number | null>(null);
  const [quickAddSubject, setQuickAddSubject] = useState<string>('Physics');
  const [quickAddTopic, setQuickAddTopic] = useState<string>('Self Study & NCERT Revision');
  const [activeTab, setActiveTab] = useState<'timer' | 'quick_log' | 'history'>('timer');
  const [ambientSound, setAmbientSound] = useState<'none' | 'tick' | 'rain'>('none');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Handle ambient background focus sound
  useEffect(() => {
    if (!isRunning || ambientSound === 'none') {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      if (ambientSound === 'rain') {
        // Create brown/pink rain noise
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 0.15; // gentle volume
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.3;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start();
        noiseNodeRef.current = noise;
      }
    } catch {
      // Audio not supported or blocked by browser
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isRunning, ambientSound]);

  if (!isOpen) return null;

  const todayTotalSeconds = trackerState.todaySeconds;
  const currentSessionSeconds = sessionSeconds;
  const projectedTodaySeconds = todayTotalSeconds + currentSessionSeconds;
  
  const todayProgressPercent = Math.min(
    100,
    Math.round((todayTotalSeconds / STREAK_THRESHOLD_SECONDS) * 100)
  );
  
  const projectedProgressPercent = Math.min(
    100,
    Math.round((projectedTodaySeconds / STREAK_THRESHOLD_SECONDS) * 100)
  );

  const secondsRemainingForStreak = Math.max(0, STREAK_THRESHOLD_SECONDS - todayTotalSeconds);
  const isStreakAlreadyDone = todayTotalSeconds >= STREAK_THRESHOLD_SECONDS;

  // Handle Save Session
  const handleSaveCurrentSession = () => {
    if (sessionSeconds < 5) return;
    onSaveSession(sessionSeconds, selectedSubject, topicNotes || 'Chapter Study', timerMode);
    onResetTimer();
  };

  // Handle Quick Add
  const handleConfirmQuickAdd = (mins: number) => {
    const secs = mins * 60;
    onSaveSession(secs, quickAddSubject, quickAddTopic || 'Offline Self Study', 'custom');
    setQuickAddMinutes(null);
  };

  // Display time for Pomodoro vs Stopwatch
  let displaySeconds = sessionSeconds;
  if (timerMode === 'pomodoro') {
    const targetSec = pomodoroTargetMinutes * 60;
    displaySeconds = Math.max(0, targetSec - sessionSeconds);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#fbf8ff] rounded-3xl w-full max-w-xl shadow-2xl border border-[#e3e1ea] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#24389c] via-[#311b92] to-[#4a148c] text-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-[22px] border border-white/20">
                ⏱️
              </div>
              <div>
                <h3 className="text-[18px] font-black text-white flex items-center gap-2">
                  Deep Study Tracker
                  <span className="text-[10px] bg-amber-400 text-[#1a1b22] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Min 4h Streak Rule
                  </span>
                </h3>
                <p className="text-[12px] text-white/80">
                  Earn day streaks by clocking at least 4 hours of focused study
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {sessionSeconds > 0 && isRunning && (
                <button
                  type="button"
                  onClick={onMinimize}
                  title="Minimize to floating bar"
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all text-[13px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">minimize</span>
                  <span className="hidden sm:inline">Floating Bar</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* 4-Hour Day Streak Progress Bar Header */}
          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
            <div className="flex items-center justify-between text-[13px] font-bold mb-1.5">
              <span className="text-white flex items-center gap-1.5">
                <span className="text-[16px]">🔥</span>
                {isStreakAlreadyDone ? (
                  <span className="text-amber-300 font-black">
                    Today's 4-Hour Streak Secured! ({trackerState.currentStreakDays} Days Streak)
                  </span>
                ) : (
                  <span>
                    4-Hour Day Streak Target: <strong className="text-amber-300">{formatHoursAndMinutes(todayTotalSeconds)} / 4h 00m</strong>
                  </span>
                )}
              </span>

              <span className="text-white/90 text-[12px] font-black">
                {todayProgressPercent}%
              </span>
            </div>

            {/* Visual Bar */}
            <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden p-0.5 flex">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isStreakAlreadyDone ? 'bg-gradient-to-r from-amber-400 to-amber-300' : 'bg-gradient-to-r from-emerald-400 to-teal-300'
                }`}
                style={{ width: `${todayProgressPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center mt-2 text-[11px] text-white/80 font-medium">
              {isStreakAlreadyDone ? (
                <span className="text-emerald-300 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  Minimum 4 hours completed today! Every extra minute adds to rank supremacy!
                </span>
              ) : (
                <span>
                  ⏳ <strong className="text-white">{formatHoursAndMinutes(secondsRemainingForStreak)}</strong> needed to unlock today's streak badge
                </span>
              )}
              {sessionSeconds > 0 && (
                <span className="text-amber-200 font-bold">
                  +{formatHoursAndMinutes(sessionSeconds)} in current session
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e3e1ea] bg-white px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('timer')}
            className={`py-2.5 px-4 font-bold text-[13px] border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timer'
                ? 'border-[#24389c] text-[#24389c]'
                : 'border-transparent text-[#454652] hover:text-[#1a1b22]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">timer</span>
            Live Study Timer
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quick_log')}
            className={`py-2.5 px-4 font-bold text-[13px] border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quick_log'
                ? 'border-[#24389c] text-[#24389c]'
                : 'border-transparent text-[#454652] hover:text-[#1a1b22]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Quick Log Hours
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-4 font-bold text-[13px] border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-[#24389c] text-[#24389c]'
                : 'border-transparent text-[#454652] hover:text-[#1a1b22]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            Weekly Streak ({trackerState.currentStreakDays}d)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {activeTab === 'timer' && (
            <div className="space-y-4">
              {/* Timer Mode & Pomodoro Selector */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex bg-[#efedf6] p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => onSelectTimerMode('stopwatch')}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                      timerMode === 'stopwatch'
                        ? 'bg-white text-[#24389c] shadow-xs'
                        : 'text-[#454652] hover:text-[#1a1b22]'
                    }`}
                  >
                    Continuous Stopwatch
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTimerMode('pomodoro')}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                      timerMode === 'pomodoro'
                        ? 'bg-white text-[#24389c] shadow-xs'
                        : 'text-[#454652] hover:text-[#1a1b22]'
                    }`}
                  >
                    Pomodoro Focus
                  </button>
                </div>

                {timerMode === 'pomodoro' && (
                  <div className="flex items-center gap-1 bg-[#efedf6] p-1 rounded-xl">
                    {[25, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => onSelectPomodoroTarget(mins)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                          pomodoroTargetMinutes === mins
                            ? 'bg-[#24389c] text-white shadow-xs'
                            : 'text-[#454652]'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject Selector Pills */}
              <div>
                <label className="text-[12px] font-bold text-[#1a1b22] uppercase tracking-wider opacity-80 block mb-2">
                  SELECT STUDY FOCUS
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STUDY_SUBJECT_OPTIONS.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => onSelectSubject(sub.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        selectedSubject === sub.id
                          ? 'border-[#24389c] bg-[#dee0ff]/40 shadow-xs'
                          : 'border-[#e3e1ea] bg-white hover:border-[#24389c]/50'
                      }`}
                    >
                      <span className="text-[16px]">{sub.icon}</span>
                      <div className="min-w-0">
                        <div className={`text-[12px] font-bold truncate ${
                          selectedSubject === sub.id ? 'text-[#24389c]' : 'text-[#1a1b22]'
                        }`}>
                          {sub.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic / Chapter Note Input */}
              <div>
                <input
                  type="text"
                  value={topicNotes}
                  onChange={(e) => onChangeTopicNotes(e.target.value)}
                  placeholder="e.g. Chapter 4: Chemical Bonding & High-Yield PYQs..."
                  className="w-full bg-white border border-[#e3e1ea] rounded-xl px-3.5 py-2 text-[13px] font-medium text-[#1a1b22] focus:outline-none focus:border-[#24389c]"
                />
              </div>

              {/* Huge Timer Display */}
              <div className="bg-gradient-to-b from-white to-[#f4f2fc] rounded-3xl p-6 sm:p-8 border border-[#dee0ff] text-center shadow-sm relative overflow-hidden">
                <div className="text-[12px] font-bold text-[#6f48b2] uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`} />
                  {isRunning ? 'Session Active • Deep Focus' : sessionSeconds > 0 ? 'Session Paused' : 'Ready to Study'}
                </div>

                <div className="text-[52px] sm:text-[64px] font-black text-[#1a1b22] tracking-tight font-mono my-2 select-none">
                  {formatSecondsToDigital(displaySeconds)}
                </div>

                <p className="text-[13px] text-[#454652] font-semibold">
                  Studying: <strong className="text-[#24389c]">{selectedSubject}</strong>
                </p>

                {/* Primary Action Controls */}
                <div className="flex items-center justify-center gap-3 mt-6">
                  {!isRunning ? (
                    <button
                      type="button"
                      onClick={onToggleTimer}
                      className="px-6 py-3 rounded-2xl bg-[#24389c] text-white text-[15px] font-black hover:bg-[#1a2b7b] transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[22px]">play_arrow</span>
                      {sessionSeconds === 0 ? 'Start Study Timer' : 'Resume Timer'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onToggleTimer}
                      className="px-6 py-3 rounded-2xl bg-amber-500 text-white text-[15px] font-black hover:bg-amber-600 transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[22px]">pause</span>
                      Pause Timer
                    </button>
                  )}

                  {sessionSeconds > 0 && (
                    <button
                      type="button"
                      onClick={handleSaveCurrentSession}
                      className="px-5 py-3 rounded-2xl bg-[#2e7d32] text-white text-[14px] font-black hover:bg-[#1b5e20] transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">save</span>
                      Save & Add Time
                    </button>
                  )}

                  {sessionSeconds > 0 && !isRunning && (
                    <button
                      type="button"
                      onClick={onResetTimer}
                      className="p-3 rounded-2xl bg-[#efedf6] text-[#454652] hover:bg-[#e3e1ea] transition-all cursor-pointer"
                      title="Reset timer"
                    >
                      <span className="material-symbols-outlined text-[20px]">restart_alt</span>
                    </button>
                  )}
                </div>

                {/* Ambient Focus Sound Controls */}
                <div className="mt-5 pt-4 border-t border-[#e3e1ea] flex items-center justify-center gap-3 text-[12px] font-bold text-[#454652]">
                  <span>Ambient Audio:</span>
                  <button
                    type="button"
                    onClick={() => setAmbientSound('none')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      ambientSound === 'none' ? 'bg-[#24389c] text-white' : 'bg-[#efedf6]'
                    }`}
                  >
                    Silent
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmbientSound('rain')}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                      ambientSound === 'rain' ? 'bg-[#24389c] text-white' : 'bg-[#efedf6]'
                    }`}
                  >
                    🌧️ Rain Noise
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quick_log' && (
            <div className="space-y-4">
              <div className="bg-[#dee0ff]/30 p-4 rounded-2xl border border-[#dee0ff]">
                <h4 className="text-[14px] font-bold text-[#24389c] flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  Log Offline Study Hours
                </h4>
                <p className="text-[12px] text-[#454652]">
                  Studied from physical books, notes, or coaching lectures? Quickly add your study time to increase today's total and advance toward your 4-Hour Day Streak!
                </p>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#1a1b22] uppercase tracking-wider opacity-80 block mb-2">
                  SELECT SUBJECT
                </label>
                <select
                  value={quickAddSubject}
                  onChange={(e) => setQuickAddSubject(e.target.value)}
                  className="w-full bg-white border border-[#e3e1ea] rounded-xl p-3 text-[14px] font-semibold text-[#1a1b22] focus:outline-none focus:border-[#24389c]"
                >
                  {STUDY_SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.icon} {sub.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#1a1b22] uppercase tracking-wider opacity-80 block mb-2">
                  TOPIC / CHAPTER COMPLETED
                </label>
                <input
                  type="text"
                  value={quickAddTopic}
                  onChange={(e) => setQuickAddTopic(e.target.value)}
                  placeholder="e.g. Ray Optics Formulas & NCERT Exemplar"
                  className="w-full bg-white border border-[#e3e1ea] rounded-xl p-3 text-[14px] text-[#1a1b22] focus:outline-none focus:border-[#24389c]"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#1a1b22] uppercase tracking-wider opacity-80 block mb-2">
                  SELECT TIME DURATION TO ADD
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: '+15 Mins', mins: 15 },
                    { label: '+30 Mins', mins: 30 },
                    { label: '+45 Mins', mins: 45 },
                    { label: '+1 Hour', mins: 60 },
                    { label: '+1.5 Hours', mins: 90 },
                    { label: '+2 Hours', mins: 120 },
                    { label: '+3 Hours', mins: 180 },
                    { label: '+4 Hours (Full Streak)', mins: 240 },
                  ].map((item) => (
                    <button
                      key={item.mins}
                      type="button"
                      onClick={() => handleConfirmQuickAdd(item.mins)}
                      className="p-3 bg-white hover:bg-[#24389c] hover:text-white text-[#1a1b22] border border-[#e3e1ea] hover:border-[#24389c] rounded-xl text-center font-bold text-[13px] transition-all cursor-pointer shadow-xs group"
                    >
                      <div>{item.label}</div>
                      <div className="text-[10px] text-[#6b6d7c] group-hover:text-white/80 mt-0.5">
                        Add to Today
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Weekly Streak Calendar */}
              <div className="bg-white rounded-2xl p-4 border border-[#e3e1ea] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[14px] font-bold text-[#1a1b22]">
                    7-Day Streak Consistency (Min 4h/day)
                  </h4>
                  <span className="text-[12px] font-black text-[#24389c] bg-[#24389c]/10 px-2.5 py-0.5 rounded-full">
                    🔥 {trackerState.currentStreakDays} Days Active
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center">
                  {trackerState.weeklyHistory.map((day, idx) => {
                    const hours = (day.totalSeconds / 3600).toFixed(1);
                    const isToday = idx === trackerState.weeklyHistory.length - 1;
                    return (
                      <div
                        key={day.date}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-between ${
                          day.isStreakAchieved
                            ? 'bg-amber-50 border-amber-300'
                            : isToday
                            ? 'bg-blue-50 border-[#24389c]'
                            : 'bg-[#efedf6]/50 border-[#e3e1ea]'
                        }`}
                      >
                        <span className="text-[11px] font-bold text-[#454652] uppercase">
                          {day.dayLabel}
                        </span>

                        <span className="text-[20px] my-1">
                          {day.isStreakAchieved ? '🔥' : isToday ? '⏳' : '⚪'}
                        </span>

                        <span className={`text-[11px] font-black ${
                          day.isStreakAchieved ? 'text-amber-800' : 'text-[#454652]'
                        }`}>
                          {hours}h
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Today's Study Sessions List */}
              <div className="bg-white rounded-2xl p-4 border border-[#e3e1ea] shadow-sm">
                <h4 className="text-[14px] font-bold text-[#1a1b22] mb-3">
                  Today's Study Session Logs ({formatHoursAndMinutes(trackerState.todaySeconds)})
                </h4>

                {trackerState.weeklyHistory[trackerState.weeklyHistory.length - 1]?.sessions.length === 0 ? (
                  <p className="text-[13px] text-[#454652] py-3 text-center">
                    No sessions logged yet today. Start the timer to begin your 4-hour streak!
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {trackerState.weeklyHistory[trackerState.weeklyHistory.length - 1]?.sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="p-3 bg-[#f8f9ff] rounded-xl border border-[#dee0ff] flex items-center justify-between"
                      >
                        <div>
                          <h5 className="text-[13px] font-bold text-[#1a1b22]">
                            {sess.subject}
                          </h5>
                          <p className="text-[11px] text-[#454652] mt-0.5">
                            {sess.topic || 'General Practice'} • {new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <span className="text-[13px] font-black text-[#24389c] bg-white px-2.5 py-1 rounded-lg border border-[#e3e1ea]">
                          +{formatHoursAndMinutes(sess.durationSeconds)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
