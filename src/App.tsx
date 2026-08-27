import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { TestDesigner } from './components/TestDesigner';
import { ActiveTestSession } from './components/ActiveTestSession';
import { TestResults } from './components/TestResults';
import { HomeScreen } from './components/HomeScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { MistakesReviewModal } from './components/MistakesReviewModal';
import { SyllabusTrackerModal } from './components/SyllabusTrackerModal';
import { StudyTimeTrackerModal } from './components/StudyTimeTrackerModal';
import { FloatingStudyTimer } from './components/FloatingStudyTimer';
import { TimetableScreen } from './components/TimetableScreen';
import { CelebrationToast, CelebrationData } from './components/CelebrationToast';
import { LoginProfileModal } from './components/LoginProfileModal';
import { TestConfig, TestResultData, Question, StreakTrackerState, TimetableSlot, TimetableTemplate, UserProfile } from './types';

import { generateTestQuestions, QUESTION_BANK } from './data/questionBank';
import {
  loadStudyTrackerState,
  addStudyTime,
  formatHoursAndMinutes,
  STREAK_THRESHOLD_SECONDS,
  resetTodayStudyTime,
  clearAllStudyStorage,
} from './data/studyStorage';
import { loadTimetableSlots, saveTimetableSlots, clearAllTimetableStorage } from './data/timetableStorage';
import { loadUserProfile, saveUserProfile } from './data/userProfileStorage';
import { clearSyllabusTrackerStorage } from './components/SyllabusTrackerModal';
import { saveTestResultToHistory, clearAllTestAndHistoryData } from './data/testHistoryStorage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[] | null>(null);
  const [testResult, setTestResult] = useState<TestResultData | null>(null);
  const [isReviewingMistakes, setIsReviewingMistakes] = useState<boolean>(false);
  const [isSyllabusTrackerOpen, setIsSyllabusTrackerOpen] = useState<boolean>(false);
  const [initialTrackerCategory, setInitialTrackerCategory] = useState<string>('all');

  // User Profile & Authentication State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Study Time Tracker & Streak State
  const [trackerState, setTrackerState] = useState<StreakTrackerState>(() => loadStudyTrackerState());
  const [isStudyTrackerOpen, setIsStudyTrackerOpen] = useState<boolean>(false);
  const [isTimerMinimized, setIsTimerMinimized] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSubject, setTimerSubject] = useState<string>('Physics');
  const [timerTopicNotes, setTimerTopicNotes] = useState<string>('');
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [pomodoroTargetMinutes, setPomodoroTargetMinutes] = useState<number>(45);

  // Handle saving updated user profile
  const handleSaveUserProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    saveUserProfile(newProfile);
    setCelebrationData({
      id: `profile-save-${Date.now()}`,
      title: '👤 Profile Details Saved!',
      message: `Welcome ${newProfile.name}! Your preferences, avatar, and goals have been updated.`,
      addedTimeFormatted: 'Profile Synced',
      totalTimeFormatted: `${newProfile.targetExam} (${newProfile.targetYear})`,
      isStreakUnlocked: trackerState.isStreakAchievedToday,
      streakDays: trackerState.currentStreakDays,
    });
  };

  // Switch between NEET and JEE target exam preference
  const handleSelectExam = (exam: 'NEET' | 'JEE') => {
    const updated: UserProfile = {
      ...userProfile,
      targetExam: exam,
      dreamCollege: userProfile.dreamCollege || (exam === 'NEET' ? 'AIIMS New Delhi' : 'IIT Bombay'),
    };
    setUserProfile(updated);
    saveUserProfile(updated);
    setCelebrationData({
      id: `exam-switch-${Date.now()}`,
      title: exam === 'NEET' ? '🩺 NEET Medical Prep Active!' : '📐 JEE Engineering Prep Active!',
      message: exam === 'NEET'
        ? 'Targeting 720 Marks with Physics, Chemistry, Botany & Zoology!'
        : 'Targeting 300 Marks with Physics, Chemistry & Mathematics!',
      addedTimeFormatted: exam,
      totalTimeFormatted: `${exam} Mode`,
      isStreakUnlocked: trackerState.isStreakAchievedToday,
      streakDays: trackerState.currentStreakDays,
    });
  };

  const handleResetStudyTime = () => {
    const updated = resetTodayStudyTime();
    setTrackerState(updated);
    setSessionSeconds(0);
    setIsTimerRunning(false);
  };

  // Celebratory Toast state
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);

  // Timetable & Daily Schedule Planner State
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => loadTimetableSlots());

  // Save timetable slots to storage whenever they change
  useEffect(() => {
    saveTimetableSlots(timetableSlots);
  }, [timetableSlots]);

  const handleAddTimetableSlot = (newSlot: Omit<TimetableSlot, 'id'>) => {
    const slotWithId: TimetableSlot = {
      ...newSlot,
      id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setTimetableSlots((prev) => [...prev, slotWithId]);
    setCelebrationData({
      id: `tt-add-${Date.now()}`,
      title: '📅 Timetable Slot Added!',
      message: `"${slotWithId.title}" (${slotWithId.startTime} - ${slotWithId.endTime}) scheduled successfully.`,
      addedTimeFormatted: 'Scheduled',
      totalTimeFormatted: `${timetableSlots.length + 1} Tasks Planned`,
      isStreakUnlocked: trackerState.isStreakAchievedToday,
      streakDays: trackerState.currentStreakDays,
    });
  };

  const handleUpdateTimetableSlot = (id: string, updated: Partial<TimetableSlot>) => {
    setTimetableSlots((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const wasNotCompleted = !s.isCompleted;
          const isNowCompleted = updated.isCompleted === true;
          if (wasNotCompleted && isNowCompleted) {
            setCelebrationData({
              id: `tt-done-${Date.now()}`,
              title: '🎯 Timetable Task Completed! 🎉',
              message: `Awesome work finishing "${s.title}"! Step by step closer to your exam target!`,
              addedTimeFormatted: 'Completed',
              totalTimeFormatted: 'Task Checked Off',
              isStreakUnlocked: trackerState.isStreakAchievedToday,
              streakDays: trackerState.currentStreakDays,
            });
          }
          return { ...s, ...updated };
        }
        return s;
      })
    );
  };

  const handleDeleteTimetableSlot = (id: string) => {
    setTimetableSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleApplyTimetableTemplate = (template: TimetableTemplate) => {
    const generatedSlots: TimetableSlot[] = template.slots.map((s, idx) => ({
      ...s,
      id: `slot-tpl-${Date.now()}-${idx}`,
      isCompleted: false,
    }));
    setTimetableSlots(generatedSlots);
    setCelebrationData({
      id: `tt-tpl-${Date.now()}`,
      title: '🌟 Timetable Routine Applied!',
      message: `"${template.name}" with ${template.totalPlannedHours} of structured focus has been loaded!`,
      addedTimeFormatted: template.totalPlannedHours,
      totalTimeFormatted: `${generatedSlots.length} Slots Scheduled`,
      isStreakUnlocked: trackerState.isStreakAchievedToday,
      streakDays: trackerState.currentStreakDays,
    });
  };

  const handleStartStudySessionForSlot = (subject: string, topic: string) => {
    setTimerSubject(subject);
    setTimerTopicNotes(topic);
    setIsTimerRunning(true);
    setIsStudyTrackerOpen(true);
    setIsTimerMinimized(false);
  };

  // Keep track of milestone notifications already triggered in this session to prevent spamming
  const triggeredMilestonesRef = useRef<Set<number>>(new Set());

  // Timer Tick Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => {
          const next = prev + 1;

          // Check for in-session milestones and congratulate the user as time increases
          const todayTotal = trackerState.todaySeconds + next;
          const streakThreshold = STREAK_THRESHOLD_SECONDS; // 14400s (4 hours)

          // 1. Check if user just reached the 4-Hour Day Streak Milestone during this tick!
          if (todayTotal === streakThreshold && !triggeredMilestonesRef.current.has(streakThreshold)) {
            triggeredMilestonesRef.current.add(streakThreshold);
            setCelebrationData({
              id: `milestone-${Date.now()}`,
              title: '🔥 4-HOUR DAY STREAK UNLOCKED! 🏆',
              message: 'Phenomenal dedication! You have crossed the minimum 4 hours required for today. Your official Day Streak is now secured!',
              addedTimeFormatted: formatHoursAndMinutes(next),
              totalTimeFormatted: formatHoursAndMinutes(todayTotal),
              isStreakUnlocked: true,
              streakDays: trackerState.isStreakAchievedToday ? trackerState.currentStreakDays : trackerState.currentStreakDays + 1,
            });
          }

          // 2. In-session 30m / 60m / 90m / 120m milestones encouragement
          const milestoneList = [900, 1800, 3600, 5400, 7200, 10800]; // 15m, 30m, 1h, 1.5h, 2h, 3h
          for (const m of milestoneList) {
            if (next === m && !triggeredMilestonesRef.current.has(m)) {
              triggeredMilestonesRef.current.add(m);
              setCelebrationData({
                id: `session-m-${m}-${Date.now()}`,
                title: `🎉 ${formatHoursAndMinutes(m)} of Focus Completed!`,
                message: `Outstanding concentration on ${timerSubject}! Keep up this remarkable momentum toward your NEET/JEE rank!`,
                addedTimeFormatted: formatHoursAndMinutes(m),
                totalTimeFormatted: formatHoursAndMinutes(todayTotal),
                isStreakUnlocked: todayTotal >= streakThreshold,
                streakDays: trackerState.currentStreakDays,
              });
              break;
            }
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, trackerState.todaySeconds, trackerState.isStreakAchievedToday, trackerState.currentStreakDays, timerSubject]);

  // Handle Saving / Adding Study Session
  const handleSaveStudySession = (
    seconds: number,
    subject: string,
    topic: string,
    mode: 'stopwatch' | 'pomodoro' | 'custom'
  ) => {
    if (seconds <= 0) return;

    const { updatedState, streakJustUnlocked, milestoneReached } = addStudyTime(
      seconds,
      subject,
      topic,
      mode
    );

    setTrackerState(updatedState);
    setIsTimerRunning(false);
    setSessionSeconds(0);
    triggeredMilestonesRef.current.clear();

    // Trigger rich congratulatory toast
    const addedFormatted = formatHoursAndMinutes(seconds);
    const totalFormatted = formatHoursAndMinutes(updatedState.todaySeconds);

    if (streakJustUnlocked) {
      setCelebrationData({
        id: `save-${Date.now()}`,
        title: '🎉 CONGRATULATIONS! 4-Hour Day Streak Unlocked! 🔥',
        message: `You logged +${addedFormatted} of ${subject}! You've crossed the 4-hour daily target. Your ${updatedState.currentStreakDays}-day streak is secured for today!`,
        addedTimeFormatted: addedFormatted,
        totalTimeFormatted: totalFormatted,
        isStreakUnlocked: true,
        streakDays: updatedState.currentStreakDays,
      });
    } else if (milestoneReached) {
      setCelebrationData({
        id: `save-${Date.now()}`,
        title: `${milestoneReached}`,
        message: `+${addedFormatted} of ${subject} successfully added to today's study log! Keep shining!`,
        addedTimeFormatted: addedFormatted,
        totalTimeFormatted: totalFormatted,
        isStreakUnlocked: updatedState.isStreakAchievedToday,
        streakDays: updatedState.currentStreakDays,
      });
    } else {
      setCelebrationData({
        id: `save-${Date.now()}`,
        title: `👏 Great Work! +${addedFormatted} Added to Study Time!`,
        message: `Excellent focus on ${subject}! Every minute builds stronger concept mastery and exam stamina.`,
        addedTimeFormatted: addedFormatted,
        totalTimeFormatted: totalFormatted,
        isStreakUnlocked: updatedState.isStreakAchievedToday,
        streakDays: updatedState.currentStreakDays,
      });
    }
  };

  const handleToggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setSessionSeconds(0);
    triggeredMilestonesRef.current.clear();
  };

  const handleOpenStudyTracker = () => {
    setIsTimerMinimized(false);
    setIsStudyTrackerOpen(true);
  };

  const handleMinimizeTracker = () => {
    setIsStudyTrackerOpen(false);
    setIsTimerMinimized(true);
  };

  // Default sample result demo matching the 720 Marks NEET mock
  const createDefaultResultDemo = (): TestResultData => {
    return {
      config: {
        exam: 'NEET',
        format: 'mock',
        selectedChapters: [],
        questionMix: 'balanced',
        difficulty: 'adaptive',
        questionCount: 180,
        timeLimitMinutes: 200,
        totalMarks: 720,
      },
      totalScore: 680,
      maxScore: 720,
      totalQuestions: 180,
      attemptedCount: 178,
      correctCount: 172,
      incorrectCount: 6,
      unattemptedCount: 2,
      percentile: 99.4,
      accuracyPercent: 96.6,
      timeSpentSeconds: 10800,
      difficultyAccuracy: {
        easy: 98,
        medium: 96,
        hard: 92,
      },
      subjectScores: [
        {
          subject: 'physics',
          name: 'Physics',
          score: 168,
          totalPossible: 180,
          percentage: 93.3,
          color: '#24389c',
        },
        {
          subject: 'chemistry',
          name: 'Chemistry',
          score: 172,
          totalPossible: 180,
          percentage: 95.5,
          color: '#6f48b2',
        },
        {
          subject: 'biology',
          name: 'Botany & Zoology',
          score: 340,
          totalPossible: 360,
          percentage: 94.4,
          color: '#1b873f',
        },
      ],
      missedQuestions: [
        {
          question: QUESTION_BANK[1],
          selectedOptionId: 'opt-c',
          selectedOptionText: 'Option C',
          correctOptionText: 'Option A (2v² / πR)',
          isCorrect: false,
          isSkipped: false,
        },
        {
          question: QUESTION_BANK[2],
          selectedOptionId: 'opt-b',
          selectedOptionText: '[Fe(CN)6]3-',
          correctOptionText: 'Option A ([Co(NH3)6]3+)',
          isCorrect: false,
          isSkipped: false,
        },
        {
          question: QUESTION_BANK[4],
          selectedOptionId: 'opt-a',
          selectedOptionText: 'Option A (15 m)',
          correctOptionText: 'Option B (25 m)',
          isCorrect: false,
          isSkipped: false,
        },
      ],
      allQuestionsEvaluated: [],
    };
  };

  const handleStartTest = (config: TestConfig) => {
    setTestConfig(config);
    const questions = generateTestQuestions(config);
    setActiveQuestions(questions);
    setTestResult(null);
  };

  const handleStartQuickDPP = () => {
    setCurrentTab('tests');
    const quickConfig: TestConfig = {
      exam: 'NEET',
      format: 'dpp',
      selectedChapters: ['chem-4', 'phy-1'],
      questionMix: 'balanced',
      difficulty: 'adaptive',
      questionCount: 45,
      timeLimitMinutes: 45,
      totalMarks: 180,
    };
    handleStartTest(quickConfig);
  };

  const handleStartFullMock = (examType: 'NEET' | 'JEE') => {

    setCurrentTab('tests');
    if (examType === 'NEET') {
      const fullNeetConfig: TestConfig = {
        exam: 'NEET',
        format: 'mock',
        selectedChapters: [],
        questionMix: 'balanced',
        difficulty: 'adaptive',
        questionCount: 180,
        timeLimitMinutes: 200,
        totalMarks: 720,
      };
      handleStartTest(fullNeetConfig);
    } else {
      const fullJeeConfig: TestConfig = {
        exam: 'JEE',
        format: 'mock',
        selectedChapters: [],
        questionMix: 'balanced',
        difficulty: 'adaptive',
        questionCount: 75,
        timeLimitMinutes: 180,
        totalMarks: 300,
      };
      handleStartTest(fullJeeConfig);
    }
  };

  const handleOpenSyllabusTracker = (categoryKey?: string) => {
    setInitialTrackerCategory(categoryKey || 'all');
    setIsSyllabusTrackerOpen(true);
  };

  const handleFinishTest = (results: TestResultData) => {
    setActiveQuestions(null);
    setTestResult(results);
    saveTestResultToHistory(results);

    // Auto-log test time as active study time with congratulations!
    if (results.timeSpentSeconds > 60) {
      const examName = results.config.exam === 'NEET' ? 'NEET Mock Practice' : 'JEE Main Practice';
      handleSaveStudySession(
        results.timeSpentSeconds,
        'Full Syllabus Mock Revision',
        `${examName} (${results.attemptedCount} Questions Attempted)`,
        'custom'
      );
    }
  };

  const handleClearAllAppData = () => {
    const freshStudyState = clearAllStudyStorage();
    const freshSlots = clearAllTimetableStorage();
    clearSyllabusTrackerStorage();
    clearAllTestAndHistoryData();

    setTrackerState(freshStudyState);
    setTimetableSlots(freshSlots);
    setSessionSeconds(0);
    setIsTimerRunning(false);
    setTestResult(null);
    setActiveQuestions(null);
    setCurrentTab('home');

    setCelebrationData({
      id: `reset-${Date.now()}`,
      title: '🔄 Application Reset Complete',
      message: 'All test responses, study timer logs, mistake questions, and timetable tasks have been cleared. You are starting completely fresh from the beginning!',
      addedTimeFormatted: '0h 00m',
      totalTimeFormatted: '0h 00m',
      isStreakUnlocked: false,
      streakDays: 0,
    });
  };

  const handleExitTest = () => {
    setActiveQuestions(null);
    setTestConfig(null);
  };

  const handleBackFromResults = () => {
    setTestResult(null);
  };

  const handleNextDPP = () => {
    setTestResult(null);
    handleStartQuickDPP();
  };

  // Determine top header state
  const isInActiveTest = !!activeQuestions && !testResult;
  const isInResultsView = !!testResult;

  return (
    <div className="min-h-screen bg-[#fbf8ff] text-[#1a1b22] flex flex-col font-sans">
      {/* Top Header */}
      <Header
        title={
          isInActiveTest
            ? 'Active Test Session'
            : isInResultsView
            ? 'Test Results'
            : undefined
        }
        showBack={isInActiveTest || isInResultsView}
        onBack={
          isInActiveTest
            ? handleExitTest
            : isInResultsView
            ? handleBackFromResults
            : undefined
        }
        activeTab={
          currentTab === 'tests'
            ? 'Tests'
            : currentTab === 'home'
            ? 'Dashboard'
            : currentTab === 'pyqs'
            ? 'PYQ Vault'
            : currentTab === 'timetable'
            ? 'Timetable'
            : currentTab === 'analytics'
            ? 'Analytics'
            : 'Profile'
        }
        onProfileClick={() => setCurrentTab('profile')}
        onOpenStudyTracker={handleOpenStudyTracker}
        todayStudySeconds={trackerState.todaySeconds + sessionSeconds}
        isStreakAchievedToday={trackerState.isStreakAchievedToday || (trackerState.todaySeconds + sessionSeconds >= STREAK_THRESHOLD_SECONDS)}
        userProfile={userProfile}
        selectedExam={userProfile.targetExam}
        onSelectExam={handleSelectExam}
      />

      {/* Main Content Area with safe spacing */}
      <main className="flex-1 pt-16">
        {isInActiveTest && testConfig && activeQuestions ? (
          <ActiveTestSession
            config={testConfig}
            questions={activeQuestions}
            onFinishTest={handleFinishTest}
            onExit={handleExitTest}
          />
        ) : isInResultsView && testResult ? (
          <TestResults
            results={testResult}
            onReviewMistakes={() => setIsReviewingMistakes(true)}
            onNextDPP={handleNextDPP}
            onBack={handleBackFromResults}
          />
        ) : currentTab === 'tests' ? (
          <TestDesigner
            onStartTest={handleStartTest}
            initialExam={userProfile.targetExam}
            onExamChange={handleSelectExam}
          />
        ) : currentTab === 'home' ? (
          <HomeScreen
            onStartQuickDPP={handleStartQuickDPP}
            onNavigateToTests={() => setCurrentTab('tests')}
            onOpenTestResultsDemo={() => setTestResult(createDefaultResultDemo())}
            onOpenSyllabusTracker={handleOpenSyllabusTracker}
            onStartFullMock={handleStartFullMock}
            onOpenStudyTracker={handleOpenStudyTracker}
            onNavigateToTimetable={() => setCurrentTab('timetable')}
            timetableSlots={timetableSlots}
            todayStudySeconds={trackerState.todaySeconds + sessionSeconds}
            currentStreakDays={
              (trackerState.todaySeconds + sessionSeconds >= STREAK_THRESHOLD_SECONDS && !trackerState.isStreakAchievedToday)
                ? trackerState.currentStreakDays + 1
                : trackerState.currentStreakDays
            }
            isStreakAchievedToday={
              trackerState.isStreakAchievedToday ||
              (trackerState.todaySeconds + sessionSeconds >= STREAK_THRESHOLD_SECONDS)
            }
            userProfile={userProfile}
            selectedExam={userProfile.targetExam}
            onSelectExam={handleSelectExam}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />

        ) : currentTab === 'timetable' ? (
          <TimetableScreen
            slots={timetableSlots}
            onAddSlot={handleAddTimetableSlot}
            onUpdateSlot={handleUpdateTimetableSlot}
            onDeleteSlot={handleDeleteTimetableSlot}
            onApplyTemplate={handleApplyTimetableTemplate}
            onStartStudySessionForSlot={handleStartStudySessionForSlot}
            todayStudySeconds={trackerState.todaySeconds + sessionSeconds}
            currentStreakDays={
              (trackerState.todaySeconds + sessionSeconds >= STREAK_THRESHOLD_SECONDS && !trackerState.isStreakAchievedToday)
                ? trackerState.currentStreakDays + 1
                : trackerState.currentStreakDays
            }
          />
        ) : currentTab === 'analytics' ? (
          <AnalyticsScreen
            trackerState={{
              ...trackerState,
              todaySeconds: trackerState.todaySeconds + sessionSeconds,
              isStreakAchievedToday: trackerState.isStreakAchievedToday || (trackerState.todaySeconds + sessionSeconds >= STREAK_THRESHOLD_SECONDS),
            }}
            onOpenStudyTracker={handleOpenStudyTracker}
            onNavigateToTests={() => setCurrentTab('tests')}
          />
        ) : (
          <ProfileScreen
            onStartTest={() => setCurrentTab('tests')}
            onOpenStudyTracker={handleOpenStudyTracker}
            trackerState={{
              ...trackerState,
              todaySeconds: trackerState.todaySeconds + sessionSeconds,
              isStreakAchievedToday: trackerState.isStreakAchievedToday || (trackerState.todaySeconds + sessionSeconds >= STREAK_THRESHOLD_SECONDS),
            }}
            userProfile={userProfile}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onUpdateProfile={handleSaveUserProfile}
            onResetStudyTime={handleResetStudyTime}
            onClearAllAppData={handleClearAllAppData}
          />
        )}
      </main>

      {/* Floating Study Timer (Visible when timer has active seconds and tracker modal is closed) */}
      {!isStudyTrackerOpen && sessionSeconds > 0 && (
        <FloatingStudyTimer
          sessionSeconds={sessionSeconds}
          isRunning={isTimerRunning}
          selectedSubject={timerSubject}
          todayTotalSeconds={trackerState.todaySeconds}
          onMaximize={handleOpenStudyTracker}
          onToggleTimer={handleToggleTimer}
          onSaveSession={() => handleSaveStudySession(sessionSeconds, timerSubject, timerTopicNotes, timerMode)}
        />
      )}

      {/* Bottom Navigation (shown when not in an active test) */}
      {!isInActiveTest && (
        <BottomNav
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            if (isInResultsView) {
              setTestResult(null);
            }
          }}
        />
      )}

      {/* Full Deep Study Tracker Modal */}
      <StudyTimeTrackerModal
        isOpen={isStudyTrackerOpen}
        onClose={() => setIsStudyTrackerOpen(false)}
        onMinimize={handleMinimizeTracker}
        trackerState={{
          ...trackerState,
          todaySeconds: trackerState.todaySeconds + sessionSeconds,
          isStreakAchievedToday: trackerState.isStreakAchievedToday || (trackerState.todaySeconds + sessionSeconds >= STREAK_THRESHOLD_SECONDS),
        }}
        onSaveSession={handleSaveStudySession}
        sessionSeconds={sessionSeconds}
        isRunning={isTimerRunning}
        onToggleTimer={handleToggleTimer}
        onResetTimer={handleResetTimer}
        selectedSubject={timerSubject}
        onSelectSubject={setTimerSubject}
        topicNotes={timerTopicNotes}
        onChangeTopicNotes={setTimerTopicNotes}
        timerMode={timerMode}
        onSelectTimerMode={setTimerMode}
        pomodoroTargetMinutes={pomodoroTargetMinutes}
        onSelectPomodoroTarget={setPomodoroTargetMinutes}
      />

      {/* User Login & Profile Modal */}
      <LoginProfileModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentProfile={userProfile}
        onSaveProfile={handleSaveUserProfile}
      />

      {/* Celebration Toast (Shown when time increases, milestones are reached, or 4-hour streak is earned) */}
      <CelebrationToast
        data={celebrationData}
        onDismiss={() => setCelebrationData(null)}
      />

      {/* Mistakes Review Modal */}
      {isReviewingMistakes && testResult && (
        <MistakesReviewModal
          missedQuestions={testResult.missedQuestions}
          onClose={() => setIsReviewingMistakes(false)}
        />
      )}

      {/* Full Syllabus & PDF Printable Tracker Modal */}
      <SyllabusTrackerModal
        isOpen={isSyllabusTrackerOpen}
        onClose={() => setIsSyllabusTrackerOpen(false)}
        initialCategory={initialTrackerCategory}
        selectedExam={userProfile.targetExam}
        userProfile={userProfile}
      />
    </div>
  );
}
