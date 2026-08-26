import React, { useState, useEffect } from 'react';
import { Question, TestConfig, TestResultData, SubjectId } from '../types';

interface ActiveTestSessionProps {
  config: TestConfig;
  questions: Question[];
  onFinishTest: (result: TestResultData) => void;
  onExit: () => void;
}

export const ActiveTestSession: React.FC<ActiveTestSessionProps> = ({
  config,
  questions,
  onFinishTest,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [reviewMarks, setReviewMarks] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    config.timeLimitMinutes * 60
  );
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showPalette, setShowPalette] = useState<boolean>(false);
  const [startTime] = useState<number>(Date.now());

  const currentQ = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // Timer countdown
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerPercent =
    ((config.timeLimitMinutes * 60 - secondsRemaining) /
      (config.timeLimitMinutes * 60)) *
    100;

  const handleSelectOption = (optionId: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleClearAnswer = () => {
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleToggleReview = () => {
    setReviewMarks((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let easyCorrect = 0,
      easyTotal = 0;
    let medCorrect = 0,
      medTotal = 0;
    let hardCorrect = 0,
      hardTotal = 0;

    const subjectMap: Record<
      string,
      { correct: number; total: number; marks: number }
    > = {};

    const allEvaluations = questions.map((q) => {
      const selected = userAnswers[q.id];
      const isAttempted = !!selected;
      const isCorrect = selected === q.correctOptionId;
      const isSkipped = !isAttempted;

      if (isSkipped) {
        unattemptedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      // Difficulty tally
      if (q.difficulty === 'easy') {
        easyTotal++;
        if (isCorrect) easyCorrect++;
      } else if (q.difficulty === 'medium') {
        medTotal++;
        if (isCorrect) medCorrect++;
      } else if (q.difficulty === 'hard') {
        hardTotal++;
        if (isCorrect) hardCorrect++;
      }

      // Subject tally
      if (!subjectMap[q.subject]) {
        subjectMap[q.subject] = { correct: 0, total: 0, marks: 0 };
      }
      subjectMap[q.subject].total += 1;
      if (isCorrect) {
        subjectMap[q.subject].correct += 1;
        subjectMap[q.subject].marks += q.positiveMarks;
      } else if (isAttempted) {
        subjectMap[q.subject].marks -= q.negativeMarks;
      }

      const selectedOpt = q.options.find((o) => o.id === selected);
      const correctOpt = q.options.find((o) => o.id === q.correctOptionId);

      return {
        question: q,
        selectedOptionId: selected,
        selectedOptionText: selectedOpt ? `Option ${selectedOpt.label} (${selectedOpt.text})` : undefined,
        correctOptionText: correctOpt ? `Option ${correctOpt.label} (${correctOpt.text})` : '',
        isCorrect,
        isSkipped,
      };
    });

    const missed = allEvaluations.filter((ev) => !ev.isCorrect);
    const totalScore = Math.max(
      0,
      correctCount * 4 - incorrectCount * 1
    );
    const maxScore = totalQuestions * 4;
    const attemptedCount = correctCount + incorrectCount;
    const accuracyPercent =
      attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    const percentile = Math.min(99, Math.max(65, Math.round(70 + (totalScore / maxScore) * 29)));

    const activeSubjects: SubjectId[] = config.exam === 'NEET'
      ? ['physics', 'chemistry', 'biology']
      : ['physics', 'chemistry', 'mathematics'];

    const subjectColors: Record<SubjectId, string> = {
      physics: '#24389c',
      chemistry: '#6f48b2',
      biology: '#1b873f',
      mathematics: '#d97706',
    };

    const subjectNames: Record<SubjectId, string> = {
      physics: 'Physics',
      chemistry: 'Chemistry',
      biology: 'Biology',
      mathematics: 'Math',
    };

    const computedSubjectScores = activeSubjects
      .filter((subj) => subjectMap[subj] && subjectMap[subj].total > 0)
      .map((subj) => {
        const data = subjectMap[subj];
        const maxScore = data.total * 4;
        const netScore = Math.max(0, data.marks);
        const percentage = maxScore > 0 ? Math.round((netScore / maxScore) * 100) : 0;
        return {
          subject: subj,
          name: subjectNames[subj],
          score: netScore,
          totalPossible: maxScore,
          percentage,
          color: subjectColors[subj],
        };
      });

    // If no subject map data found (e.g. 0 questions evaluated), fallback gracefully
    const finalSubjectScores =
      computedSubjectScores.length > 0
        ? computedSubjectScores
        : [
            {
              subject: 'physics' as SubjectId,
              name: 'Physics',
              score: totalScore,
              totalPossible: maxScore,
              percentage: accuracyPercent,
              color: '#24389c',
            },
          ];

    const resultData: TestResultData = {
      config,
      totalScore,
      maxScore,
      totalQuestions,
      attemptedCount,
      correctCount,
      incorrectCount,
      unattemptedCount,
      percentile,
      accuracyPercent,
      timeSpentSeconds: timeSpent,
      difficultyAccuracy: {
        easy: easyTotal > 0 ? Math.round((easyCorrect / easyTotal) * 100) : 100,
        medium: medTotal > 0 ? Math.round((medCorrect / medTotal) * 100) : 88,
        hard: hardTotal > 0 ? Math.round((hardCorrect / hardTotal) * 100) : 75,
      },
      subjectScores: finalSubjectScores,
      missedQuestions: missed,
      allQuestionsEvaluated: allEvaluations,
    };

    onFinishTest(resultData);
  };

  const isCurrentMarked = !!reviewMarks[currentQ?.id];
  const currentSelectedOption = userAnswers[currentQ?.id];

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto min-h-screen bg-[#fbf8ff]">
      {/* Top Status Bar */}
      <div className="px-4 sm:px-6 py-2.5 bg-white/95 backdrop-blur-md flex items-center justify-between shadow-sm sticky top-16 z-30 border-b border-[#e3e1ea]">
        <div className="flex items-center gap-3">
          {/* Circular Countdown Progress */}
          <div className="w-11 h-11 rounded-full border-2 border-[#b78efe]/30 flex items-center justify-center relative bg-[#f4f2fc] shadow-inner">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle
                className="stroke-[#efedf6]"
                cx="18"
                cy="18"
                fill="none"
                r="15"
                strokeWidth="3"
              />
              <circle
                className="stroke-[#3f51b5] transition-all duration-1000"
                cx="18"
                cy="18"
                fill="none"
                r="15"
                strokeDasharray="94.2"
                strokeDashoffset={94.2 - (94.2 * (100 - timerPercent)) / 100}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[12px] font-extrabold text-[#1a1b22] tracking-tight">
              {Math.ceil(secondsRemaining / 60)}m
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-[#1a1b22]">
              Q {currentIndex + 1}/{totalQuestions}
            </span>
            <span className="text-[11px] font-semibold text-[#6f48b2]">
              +{currentQ.positiveMarks} / -{currentQ.negativeMarks} Marks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPalette(true)}
            className="p-2 rounded-lg bg-[#efedf6] text-[#454652] hover:bg-[#e3e1ea] transition-colors flex items-center justify-center cursor-pointer"
            title="Question Grid"
          >
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPaused(true)}
            className="px-3.5 py-2 rounded-lg bg-[#e9e7f0] text-[#1a1b22] text-[13px] font-bold flex items-center gap-1.5 hover:bg-[#e3e1ea] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">pause</span>
            Pause
          </button>
        </div>
      </div>

      {/* Main Question Content Area */}
      <div className="flex-1 px-4 sm:px-6 py-4 flex flex-col gap-4 pb-36">
        {/* Metadata Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentQ.pyqSource && (
            <span className="px-3 py-1 rounded-md bg-[#24389c] text-white font-extrabold tracking-wider uppercase text-[11px] flex items-center gap-1 shadow-xs">
              <span className="material-symbols-outlined text-[13px]">history_edu</span>
              {currentQ.pyqSource}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-md bg-[#b78efe]/25 text-[#491d8a] font-bold tracking-wider uppercase text-[11px]">
            {currentQ.difficulty.toUpperCase()}
          </span>
          {currentQ.tags.filter(t => t !== currentQ.pyqSource).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-md bg-[#e3e1ea] text-[#454652] font-semibold tracking-wider uppercase text-[11px]"
            >
              {tag}
            </span>
          ))}
          {isCurrentMarked && (
            <span className="px-2.5 py-1 rounded-md bg-[#ffdcc6] text-[#6c3400] font-bold text-[11px] flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] fill">bookmark</span>
              Review Marked
            </span>
          )}
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl p-5 shadow-[0px_4px_16px_rgba(63,81,181,0.06)] border border-[#e3e1ea]/80 flex flex-col gap-4 relative overflow-hidden">
          {/* Blue accent line on left */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#24389c] rounded-l-2xl" />

          {/* Stem text */}
          <div className="pl-1">
            <p className="text-[17px] sm:text-[18px] text-[#1a1b22] font-medium leading-relaxed">
              {currentQ.stem}
            </p>
          </div>

          {/* Diagram / Graphic / Structure container if present */}
          {currentQ.image && (
            <div className="bg-[#F1F3F9] rounded-xl p-3 sm:p-4 flex items-center justify-center border border-[#dee0ff]/60">
              <img
                src={currentQ.image}
                alt={currentQ.diagramAlt || 'Question diagram illustration'}
                className="max-w-full max-h-56 object-contain mix-blend-multiply"
              />
            </div>
          )}

          {/* Formula snippet if present */}
          {currentQ.formulaSnippet && (
            <div className="bg-[#F1F3F9] rounded-xl p-3.5 text-center font-serif text-lg text-[#1a1b22] border border-[#dee0ff]/60">
              {currentQ.formulaSnippet}
            </div>
          )}

          {currentQ.note && (
            <p className="text-[13px] text-[#454652] italic pl-1">
              {currentQ.note}
            </p>
          )}
        </div>

        {/* Options List */}
        <div className="flex flex-col gap-3">
          {currentQ.options.map((option) => {
            const isSelected = currentSelectedOption === option.id;
            return (
              <label
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`relative flex items-start p-4 rounded-2xl bg-white border cursor-pointer group transition-all duration-150 ${
                  isSelected
                    ? 'border-[#24389c] bg-[#24389c]/5 shadow-[0px_4px_16px_rgba(36,56,156,0.12)] ring-1 ring-[#24389c]'
                    : 'border-[#e3e1ea] shadow-[0px_2px_8px_rgba(63,81,181,0.04)] hover:border-[#24389c]/40 hover:bg-[#f4f2fc]/40'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-0.5 font-bold text-[13px] transition-all ${
                    isSelected
                      ? 'bg-[#24389c] text-white border-2 border-[#24389c]'
                      : 'border-2 border-[#c5c5d4] text-[#454652] group-hover:border-[#24389c]/70'
                  }`}
                >
                  {option.label}
                </div>
                <div className="flex-1 text-[16px] text-[#1a1b22] font-medium pt-0.5 leading-relaxed">
                  {option.text}
                  {option.formula && (
                    <span className="block font-mono text-sm text-[#24389c] mt-0.5">
                      {option.formula}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-[#e3e1ea] shadow-[0px_-4px_20px_rgba(63,81,181,0.08)] pb-safe">
        <div className="max-w-2xl mx-auto p-4 flex flex-col gap-3">
          {/* Upper quick controls */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={handleClearAnswer}
              disabled={!currentSelectedOption}
              className={`text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentSelectedOption
                  ? 'text-[#454652] hover:text-[#ba1a1a]'
                  : 'text-[#c5c5d4] cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">ink_eraser</span>
              Clear
            </button>

            <button
              type="button"
              onClick={handleToggleReview}
              className={`text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isCurrentMarked
                  ? 'text-[#6c3400] font-black'
                  : 'text-[#6f48b2] hover:text-[#24389c]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={isCurrentMarked ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                bookmark_border
              </span>
              {isCurrentMarked ? 'Marked for Review' : 'Mark for Review'}
            </button>
          </div>

          {/* Nav buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex-1 py-3.5 rounded-xl text-[15px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                currentIndex === 0
                  ? 'bg-[#efedf6] text-[#c5c5d4] cursor-not-allowed'
                  : 'bg-[#e9e7f0] text-[#1a1b22] hover:bg-[#e3e1ea] active:scale-[0.98]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              Previous
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex-[2] py-3.5 rounded-xl bg-[#24389c] text-white text-[15px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#3f51b5] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[0px_4px_16px_rgba(36,56,156,0.25)] cursor-pointer"
            >
              <span>{isLastQuestion ? 'Review & Submit' : 'Save & Next'}</span>
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pause Modal */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-[#efedf6] flex items-center justify-center text-[#24389c] mb-3">
              <span className="material-symbols-outlined text-[32px]">pause_circle</span>
            </div>
            <h3 className="text-[20px] font-bold text-[#1a1b22]">Test Paused</h3>
            <p className="text-[14px] text-[#454652] mt-1 mb-5">
              Take a breath! Time is stopped. You can resume anytime or finish now.
            </p>
            <div className="w-full flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="w-full py-3 rounded-xl bg-[#24389c] text-white font-bold text-[14px] shadow-md hover:bg-[#3f51b5] transition-all"
              >
                Resume Test
              </button>
              <button
                type="button"
                onClick={handleSubmitTest}
                className="w-full py-3 rounded-xl bg-[#efedf6] text-[#ba1a1a] font-bold text-[14px] hover:bg-[#ffdad6] transition-all"
              >
                End & Submit Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-[#24389c]/10 flex items-center justify-center text-[#24389c] mb-3">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h3 className="text-[20px] font-bold text-[#1a1b22]">Submit Test?</h3>
            <p className="text-[14px] text-[#454652] mt-1 mb-4">
              Here is your current session breakdown:
            </p>

            <div className="grid grid-cols-3 gap-2 w-full mb-5 bg-[#f4f2fc] p-3 rounded-xl border border-[#e3e1ea]">
              <div className="flex flex-col items-center">
                <span className="text-[18px] font-bold text-[#24389c]">
                  {Object.keys(userAnswers).length}
                </span>
                <span className="text-[11px] font-medium text-[#454652]">Attempted</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[18px] font-bold text-[#ba1a1a]">
                  {totalQuestions - Object.keys(userAnswers).length}
                </span>
                <span className="text-[11px] font-medium text-[#454652]">Left</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[18px] font-bold text-[#6f48b2]">
                  {Object.values(reviewMarks).filter(Boolean).length}
                </span>
                <span className="text-[11px] font-medium text-[#454652]">Flagged</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleSubmitTest}
                className="w-full py-3.5 rounded-xl bg-[#24389c] text-white font-bold text-[15px] shadow-md hover:bg-[#3f51b5] transition-all"
              >
                Yes, Submit Now
              </button>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="w-full py-3 rounded-xl bg-[#efedf6] text-[#454652] font-bold text-[14px] hover:bg-[#e3e1ea] transition-all"
              >
                Keep Practicing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Palette Drawer */}
      {showPalette && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e1ea]">
              <h3 className="text-[18px] font-bold text-[#1a1b22]">Question Palette</h3>
              <button
                onClick={() => setShowPalette(false)}
                className="w-9 h-9 rounded-full bg-[#efedf6] flex items-center justify-center text-[#454652] hover:bg-[#e3e1ea]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex items-center justify-around py-3 text-[11px] font-bold text-[#454652] border-b border-[#e3e1ea]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#24389c]" />
                Attempted
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ffdcc6] border border-[#6c3400]" />
                Review
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#efedf6] border border-[#c5c5d4]" />
                Unattempted
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 grid grid-cols-5 gap-2.5 content-start">
              {questions.map((q, idx) => {
                const isAnswered = !!userAnswers[q.id];
                const isFlagged = !!reviewMarks[q.id];
                const isCurrent = idx === currentIndex;

                let btnStyle = 'bg-[#efedf6] text-[#454652] border-[#c5c5d4]';
                if (isAnswered) {
                  btnStyle = 'bg-[#24389c] text-white border-[#24389c] font-bold';
                } else if (isFlagged) {
                  btnStyle = 'bg-[#ffdcc6] text-[#6c3400] border-[#6c3400] font-bold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowPalette(false);
                    }}
                    className={`h-11 rounded-xl text-[14px] flex items-center justify-center border transition-all relative ${btnStyle} ${
                      isCurrent ? 'ring-2 ring-[#3f51b5] ring-offset-2' : ''
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && isAnswered && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#fbbc05]" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowPalette(false);
                setShowSubmitModal(true);
              }}
              className="w-full py-3.5 rounded-xl bg-[#24389c] text-white font-bold text-[15px] shadow-md hover:bg-[#3f51b5] transition-all"
            >
              Finish & Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
