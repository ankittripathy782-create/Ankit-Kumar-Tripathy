import { TestResultData, MissedQuestionResult, Question } from '../types';

const TEST_HISTORY_STORAGE_KEY = 'preppulse_test_history_v2';
const BOOKMARKS_STORAGE_KEY = 'preppulse_bookmarked_questions_v2';
const MISTAKES_STORAGE_KEY = 'preppulse_mistakes_notebook_v2';

export interface StoredTestHistoryItem {
  id: string;
  timestamp: number;
  dateFormatted: string;
  exam: 'NEET' | 'JEE';
  format: 'dpp' | 'mock' | 'custom';
  totalScore: number;
  maxScore: number;
  percentage: number;
  accuracyPercent: number;
  timeSpentSeconds: number;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  subjectBreakdown: {
    subject: string;
    score: number;
    totalPossible: number;
    percentage: number;
  }[];
}

export function loadTestHistory(): StoredTestHistoryItem[] {
  try {
    const raw = localStorage.getItem(TEST_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTestResultToHistory(results: TestResultData): StoredTestHistoryItem {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const historyItem: StoredTestHistoryItem = {
    id: `test-rec-${Date.now()}`,
    timestamp: Date.now(),
    dateFormatted,
    exam: results.config.exam,
    format: results.config.format,
    totalScore: results.totalScore,
    maxScore: results.maxScore,
    percentage: Math.round((results.totalScore / (results.maxScore || 1)) * 100),
    accuracyPercent: results.accuracyPercent,
    timeSpentSeconds: results.timeSpentSeconds,
    totalQuestions: results.totalQuestions,
    attemptedCount: results.attemptedCount,
    correctCount: results.correctCount,
    incorrectCount: results.incorrectCount,
    unattemptedCount: results.unattemptedCount,
    subjectBreakdown: results.subjectScores.map((s) => ({
      subject: s.name,
      score: s.score,
      totalPossible: s.totalPossible,
      percentage: s.percentage,
    })),
  };

  try {
    const existing = loadTestHistory();
    const updated = [historyItem, ...existing];
    localStorage.setItem(TEST_HISTORY_STORAGE_KEY, JSON.stringify(updated));

    // Save missed questions into mistakes notebook
    if (results.missedQuestions && results.missedQuestions.length > 0) {
      saveMissedQuestionsToMistakesNotebook(results.missedQuestions);
    }
  } catch (err) {
    console.error('Failed to save test history', err);
  }

  return historyItem;
}

export function loadMistakesNotebook(): MissedQuestionResult[] {
  try {
    const raw = localStorage.getItem(MISTAKES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMissedQuestionsToMistakesNotebook(missed: MissedQuestionResult[]): void {
  try {
    const existing = loadMistakesNotebook();
    const existingIds = new Set(existing.map((m) => m.question.id));
    const newlyMissed = missed.filter((m) => !existingIds.has(m.question.id));
    const merged = [...newlyMissed, ...existing];
    localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(merged));
  } catch (err) {
    console.error('Failed to save mistakes notebook', err);
  }
}

export function loadBookmarkedQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toggleQuestionBookmark(question: Question): boolean {
  try {
    const existing = loadBookmarkedQuestions();
    const isBookmarked = existing.some((q) => q.id === question.id);
    let updated: Question[];
    if (isBookmarked) {
      updated = existing.filter((q) => q.id !== question.id);
    } else {
      updated = [question, ...existing];
    }
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    return !isBookmarked;
  } catch {
    return false;
  }
}

export function clearAllTestAndHistoryData(): void {
  try {
    localStorage.removeItem(TEST_HISTORY_STORAGE_KEY);
    localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
    localStorage.removeItem(MISTAKES_STORAGE_KEY);
  } catch {
    // ignore
  }
}
