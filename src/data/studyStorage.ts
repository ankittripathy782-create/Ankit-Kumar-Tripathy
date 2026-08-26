import { DayStudyRecord, StreakTrackerState, StudySessionLog } from '../types';

const STORAGE_KEY = 'preppulse_study_streak_state_v3';

// 4 Hours in seconds = 4 * 3600 = 14400
export const STREAK_THRESHOLD_SECONDS = 14400;

export function clearAllStudyStorage(): StreakTrackerState {
  try {
    localStorage.removeItem('preppulse_study_streak_state_v1');
    localStorage.removeItem('preppulse_study_streak_state_v2');
    localStorage.removeItem('preppulse_study_streak_state_v3');
  } catch {
    // ignore
  }
  const fresh = getInitialDefaultStudyState();
  saveStudyTrackerState(fresh);
  return fresh;
}

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function formatSecondsToDigital(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatHoursAndMinutes(totalSeconds: number): string {
  if (totalSeconds === 0) return '0h 00m';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  
  if (hrs === 0 && mins === 0) return `${totalSeconds}s`;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h 00m`;
  return `${hrs}h ${mins < 10 ? '0' + mins : mins}m`;
}

export function getInitialDefaultStudyState(): StreakTrackerState {
  const today = getTodayDateString();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayDateObj = new Date();
  
  // Clean weekly history: all initialized to 0 seconds (user must start timer to accumulate time)
  const weeklyHistory: DayStudyRecord[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayDateObj);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getDay()];
    weeklyHistory.push({
      date: dateStr,
      dayLabel,
      totalSeconds: 0,
      isStreakAchieved: false,
      sessions: []
    });
  }

  return {
    currentStreakDays: 0,
    todaySeconds: 0,
    streakThresholdSeconds: STREAK_THRESHOLD_SECONDS,
    isStreakAchievedToday: false,
    weeklyHistory,
    allTimeStudySeconds: 0
  };
}

export function loadStudyTrackerState(): StreakTrackerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialDefaultStudyState();
      saveStudyTrackerState(initial);
      return initial;
    }
    const parsed: StreakTrackerState = JSON.parse(raw);
    const today = getTodayDateString();
    
    // Check if the latest record in weeklyHistory is today
    const lastRecord = parsed.weeklyHistory[parsed.weeklyHistory.length - 1];
    if (!lastRecord || lastRecord.date !== today) {
      // It's a new day!
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayDateObj = new Date();
      const todayLabel = dayNames[todayDateObj.getDay()];
      
      const newTodayRecord: DayStudyRecord = {
        date: today,
        dayLabel: todayLabel,
        totalSeconds: 0,
        isStreakAchieved: false,
        sessions: []
      };
      
      // Update streak: if yesterday was achieved, keep streak; otherwise 0
      const yesterdayAchieved = lastRecord ? lastRecord.isStreakAchieved : false;
      const updatedStreak = yesterdayAchieved ? parsed.currentStreakDays : 0;
      
      const updatedHistory = [...parsed.weeklyHistory.slice(-6), newTodayRecord];
      
      const updatedState: StreakTrackerState = {
        ...parsed,
        currentStreakDays: updatedStreak,
        todaySeconds: 0,
        isStreakAchievedToday: false,
        weeklyHistory: updatedHistory
      };
      saveStudyTrackerState(updatedState);
      return updatedState;
    }
    
    return parsed;
  } catch {
    return getInitialDefaultStudyState();
  }
}

export function resetTodayStudyTime(): StreakTrackerState {
  const state = loadStudyTrackerState();
  const today = getTodayDateString();
  const updatedHistory = state.weeklyHistory.map((day) => {
    if (day.date === today) {
      return {
        ...day,
        totalSeconds: 0,
        isStreakAchieved: false,
        sessions: []
      };
    }
    return day;
  });

  const updatedState: StreakTrackerState = {
    ...state,
    todaySeconds: 0,
    isStreakAchievedToday: false,
    weeklyHistory: updatedHistory
  };

  saveStudyTrackerState(updatedState);
  return updatedState;
}

export function saveStudyTrackerState(state: StreakTrackerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save study state to localStorage', err);
  }
}

export function addStudyTime(
  secondsToAdd: number,
  subject: string,
  topic: string = 'General Practice',
  mode: 'stopwatch' | 'pomodoro' | 'custom' = 'stopwatch'
): { updatedState: StreakTrackerState; streakJustUnlocked: boolean; milestoneReached?: string } {
  const state = loadStudyTrackerState();
  const today = getTodayDateString();
  const previousTodaySeconds = state.todaySeconds;
  const newTodaySeconds = previousTodaySeconds + secondsToAdd;
  
  const wasAchievedBefore = previousTodaySeconds >= state.streakThresholdSeconds;
  const isAchievedNow = newTodaySeconds >= state.streakThresholdSeconds;
  const streakJustUnlocked = !wasAchievedBefore && isAchievedNow;

  let updatedStreakDays = state.currentStreakDays;
  if (streakJustUnlocked) {
    updatedStreakDays += 1;
  }

  const newSession: StudySessionLog = {
    id: `session-${Date.now()}`,
    timestamp: new Date().toISOString(),
    subject,
    topic,
    durationSeconds: secondsToAdd,
    mode
  };

  const updatedHistory = state.weeklyHistory.map((day) => {
    if (day.date === today) {
      return {
        ...day,
        totalSeconds: newTodaySeconds,
        isStreakAchieved: isAchievedNow,
        sessions: [newSession, ...day.sessions]
      };
    }
    return day;
  });

  const updatedState: StreakTrackerState = {
    ...state,
    currentStreakDays: updatedStreakDays,
    todaySeconds: newTodaySeconds,
    isStreakAchievedToday: isAchievedNow,
    weeklyHistory: updatedHistory,
    allTimeStudySeconds: state.allTimeStudySeconds + secondsToAdd
  };

  saveStudyTrackerState(updatedState);

  // Determine congratulations milestone
  let milestoneReached: string | undefined;
  if (streakJustUnlocked) {
    milestoneReached = '🎉 4-HOUR DAY STREAK UNLOCKED! 🔥';
  } else if (newTodaySeconds >= 3600 * 5 && previousTodaySeconds < 3600 * 5) {
    milestoneReached = '⭐ 5 Hours Study Milestone Reached!';
  } else if (newTodaySeconds >= 3600 * 3 && previousTodaySeconds < 3600 * 3) {
    milestoneReached = '🚀 3 Hours Completed! 1 Hour away from Day Streak!';
  } else if (newTodaySeconds >= 3600 * 2 && previousTodaySeconds < 3600 * 2) {
    milestoneReached = '⚡ 2 Hours Milestone! Halfway to your 4-Hour Streak!';
  } else if (newTodaySeconds >= 3600 * 1 && previousTodaySeconds < 3600 * 1) {
    milestoneReached = '📖 1 Hour Milestone Achieved! Excellent Momentum!';
  }

  return { updatedState, streakJustUnlocked, milestoneReached };
}

export const STUDY_SUBJECT_OPTIONS = [
  { id: 'Physics', label: 'Physics', icon: '⚡', color: '#24389c' },
  { id: 'Physical Chemistry', label: 'Physical Chem', icon: '🧪', color: '#6f48b2' },
  { id: 'Inorganic Chemistry', label: 'Inorganic Chem', icon: '🔬', color: '#6f48b2' },
  { id: 'Organic Chemistry', label: 'Organic Chem', icon: '⚗️', color: '#6f48b2' },
  { id: 'Botany', label: 'Botany (NEET)', icon: '🌿', color: '#2e7d32' },
  { id: 'Zoology', label: 'Zoology (NEET)', icon: '🐾', color: '#2e7d32' },
  { id: 'Mathematics', label: 'Mathematics (JEE)', icon: '📐', color: '#24389c' },
  { id: 'Full Syllabus Mock Revision', label: 'Mock Test Review', icon: '📝', color: '#b23b00' },
  { id: 'NCERT Line-by-Line Reading', label: 'NCERT Deep Read', icon: '📚', color: '#00695c' },
];
