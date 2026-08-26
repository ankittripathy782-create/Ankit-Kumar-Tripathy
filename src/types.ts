export type ExamType = 'NEET' | 'JEE';
export type TestFormat = 'dpp' | 'mock';
export type QuestionMix = 'balanced' | 'pyq' | 'recent_pyq';
export type DifficultyLevel = 'adaptive' | 'easy' | 'medium' | 'hard';
export type SubjectId = 'physics' | 'chemistry' | 'biology' | 'mathematics';
export type SubSubject = 'Physical Chemistry' | 'Inorganic Chemistry' | 'Organic Chemistry' | 'Botany' | 'Zoology';

export interface Chapter {
  id: string;
  name: string;
  subject: SubjectId;
  subSubject?: SubSubject;
  questionCount: number;
  classLevel?: 'Class 11' | 'Class 12';
  weightage?: 'High' | 'Medium' | 'Core';
  subCategory?: string;
  ncertCode?: string;
}

export interface ChapterProgress {
  chapterId: string;
  theoryRead: boolean;
  ncertExemplarDone: boolean;
  pyqsSolved: boolean;
  examTested: boolean;
  mockScore?: string;
  revisionDate?: string;
  notes?: string;
}

export interface QuestionOption {
  id: string;
  label: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  formula?: string;
}

export interface Question {
  id: string;
  number: number;
  subject: SubjectId;
  subjectName: string;
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  pyqSource?: string;
  stem: string;
  image?: string;
  diagramAlt?: string;
  formulaSnippet?: string;
  note?: string;
  options: QuestionOption[];
  correctOptionId: string;
  positiveMarks: number;
  negativeMarks: number;
  explanation: {
    title?: string;
    steps: string[];
    correctSummary: string;
  };
}

export interface TestConfig {
  exam: ExamType;
  format: TestFormat;
  selectedChapters: string[];
  questionMix: QuestionMix;
  difficulty: DifficultyLevel;
  questionCount: number;
  timeLimitMinutes: number;
  totalMarks: number;
}

export interface TestSessionState {
  config: TestConfig;
  questions: Question[];
  userAnswers: Record<string, string>; // questionId -> optionId
  reviewMarks: Record<string, boolean>; // questionId -> boolean
  currentQuestionIndex: number;
  secondsRemaining: number;
  totalDurationSeconds: number;
  isPaused: boolean;
  isSubmitted: boolean;
  startTime: number;
}

export interface MissedQuestionResult {
  question: Question;
  selectedOptionId?: string;
  selectedOptionText?: string;
  correctOptionText: string;
  isCorrect: boolean;
  isSkipped: boolean;
}

export interface TestResultData {
  config: TestConfig;
  totalScore: number;
  maxScore: number;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  percentile: number;
  accuracyPercent: number;
  timeSpentSeconds: number;
  difficultyAccuracy: {
    easy: number;
    medium: number;
    hard: number;
  };
  subjectScores: {
    subject: SubjectId;
    name: string;
    score: number;
    totalPossible: number;
    percentage: number;
    color: string;
  }[];
  missedQuestions: MissedQuestionResult[];
  allQuestionsEvaluated: MissedQuestionResult[];
}

export interface StudySessionLog {
  id: string;
  timestamp: string; // ISO string
  subject: string;
  topic?: string;
  durationSeconds: number;
  mode: 'stopwatch' | 'pomodoro' | 'custom';
}

export interface DayStudyRecord {
  date: string; // YYYY-MM-DD
  dayLabel: string; // 'Mon', 'Tue', etc.
  totalSeconds: number;
  isStreakAchieved: boolean; // >= 14400s (4 Hours)
  sessions: StudySessionLog[];
}

export interface StreakTrackerState {
  currentStreakDays: number;
  todaySeconds: number;
  streakThresholdSeconds: number; // 14400s (4 hours)
  isStreakAchievedToday: boolean;
  weeklyHistory: DayStudyRecord[];
  allTimeStudySeconds: number;
}

export type DayOfWeekKey = 'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface TimetableSlot {
  id: string;
  startTime: string; // "06:00" in 24h or "06:00 AM"
  endTime: string;   // "08:00" in 24h or "08:00 AM"
  title: string;     // e.g. "Physics Kinematics & Mechanics PYQ Drill"
  subject: string;   // "Physics" | "Physical Chemistry" | "Inorganic Chemistry" | "Organic Chemistry" | "Botany" | "Zoology" | "Mathematics" | "Revision" | "Mock Test" | "Break";
  description: string; // What to do: "Solve 35 questions from 2019-2024 papers & log errors"
  dayOfWeek: DayOfWeekKey; // Specific day or applies to all days
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
  colorTag?: string;
}

export interface TimetableTemplate {
  id: string;
  name: string;
  targetExam: 'NEET' | 'JEE' | 'All';
  description: string;
  totalPlannedHours: string;
  slots: Omit<TimetableSlot, 'id' | 'isCompleted'>[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  targetExam: 'NEET' | 'JEE';
  targetYear: number;
  dailyGoalQuestions: number;
  dailyStudyTargetHours: number;
  phone?: string;
  dreamCollege?: string;
  bio?: string;
  isLoggedIn: boolean;
  joinedDate: string;
}


