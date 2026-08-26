import React, { useState } from 'react';
import { TestResultData, MissedQuestionResult } from '../types';

interface TestResultsProps {
  results: TestResultData;
  onReviewMistakes: () => void;
  onNextDPP: () => void;
  onBack: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({
  results,
  onReviewMistakes,
  onNextDPP,
  onBack,
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({
    [results.missedQuestions[0]?.question.id || '']: true,
  });

  const toggleQuestion = (qId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const missedCount = results.missedQuestions.length;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-28">
      <div className="flex flex-col w-full gap-6 px-4 sm:px-6 pt-5">
        {/* Score Card Banner */}
        <div>
          <div className="bg-[#24389c] text-white rounded-2xl p-6 relative overflow-hidden shadow-lg group">
            {/* Ambient background glows */}
            <div className="absolute -right-4 -top-4 w-36 h-36 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
            <div className="absolute -left-8 -bottom-8 w-44 h-44 bg-[#6f48b2]/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
                <span
                  className="material-symbols-outlined text-[36px] text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
              </div>

              <div className="space-y-0.5">
                <p className="text-[13px] font-bold text-white/80 uppercase tracking-widest">
                  OVERALL SCORE
                </p>
                <h2 className="text-[44px] font-black tracking-tight leading-none">
                  {results.totalScore}
                  <span className="text-[22px] font-bold text-white/60">
                    /{results.maxScore}
                  </span>
                </h2>
              </div>

              <div className="flex flex-row justify-center gap-3 mt-2 w-full max-w-sm">
                <div className="bg-white/10 rounded-xl p-3 flex-1 backdrop-blur-sm border border-white/10 text-center">
                  <p className="text-[12px] font-medium text-white/75">Percentile</p>
                  <p className="text-[22px] font-black text-[#d4bbff] leading-tight">
                    {results.percentile}th
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 flex-1 backdrop-blur-sm border border-white/10 text-center">
                  <p className="text-[12px] font-medium text-white/75">Accuracy</p>
                  <p className="text-[22px] font-black text-[#d4bbff] leading-tight">
                    {results.accuracyPercent}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="space-y-3.5">
          <h3 className="text-[20px] font-bold text-[#1a1b22] tracking-tight">
            Performance Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Accuracy by Difficulty */}
            <div className="bg-white rounded-2xl p-5 shadow-[0px_4px_12px_rgba(36,56,156,0.06)] border border-[#e3e1ea] space-y-4">
              <h4 className="text-[14px] font-bold text-[#454652] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#24389c]">
                  bar_chart
                </span>
                Accuracy by Difficulty
              </h4>

              <div className="space-y-3 pt-1">
                {/* Easy */}
                <div>
                  <div className="flex justify-between text-[12px] font-semibold mb-1">
                    <span className="text-[#1a1b22]">Easy</span>
                    <span className="text-[#454652]">{results.difficultyAccuracy.easy}%</span>
                  </div>
                  <div className="h-3 w-full bg-[#E0E3F1] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6f48b2] to-[#24389c] rounded-full transition-all duration-1000"
                      style={{ width: `${results.difficultyAccuracy.easy}%` }}
                    />
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex justify-between text-[12px] font-semibold mb-1">
                    <span className="text-[#1a1b22]">Medium</span>
                    <span className="text-[#454652]">{results.difficultyAccuracy.medium}%</span>
                  </div>
                  <div className="h-3 w-full bg-[#E0E3F1] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6f48b2] to-[#24389c] rounded-full transition-all duration-1000"
                      style={{ width: `${results.difficultyAccuracy.medium}%` }}
                    />
                  </div>
                </div>

                {/* Hard */}
                <div>
                  <div className="flex justify-between text-[12px] font-semibold mb-1">
                    <span className="text-[#1a1b22]">Hard</span>
                    <span className="text-[#454652]">{results.difficultyAccuracy.hard}%</span>
                  </div>
                  <div className="h-3 w-full bg-[#E0E3F1] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6f48b2] to-[#24389c] rounded-full transition-all duration-1000"
                      style={{ width: `${results.difficultyAccuracy.hard}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Subject-wise Score Bar Chart */}
            <div className="bg-white rounded-2xl p-5 shadow-[0px_4px_12px_rgba(36,56,156,0.06)] border border-[#e3e1ea] flex flex-col justify-between">
              <h4 className="text-[14px] font-bold text-[#454652] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#6f48b2]">
                  science
                </span>
                Subject-wise Score
              </h4>

              <div className="flex items-end gap-3 h-36 mt-3 px-2">
                {results.subjectScores.map((subj) => (
                  <div
                    key={subj.name}
                    className="flex flex-col items-center flex-1 gap-2 h-full justify-end group"
                  >
                    <span className="text-[11px] font-bold text-[#454652] opacity-0 group-hover:opacity-100 transition-opacity">
                      {subj.percentage}%
                    </span>
                    <div
                      className="w-full max-w-[42px] rounded-t-lg shadow-sm transition-all hover:brightness-110"
                      style={{
                        height: `${subj.percentage}%`,
                        backgroundColor: subj.color,
                      }}
                    />
                    <span className="text-[12px] font-bold text-[#1a1b22] truncate w-full text-center">
                      {subj.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Missed Questions Section */}
        <div className="space-y-3.5 mt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-bold text-[#1a1b22] tracking-tight">
              Missed Questions
            </h3>
            <span className="bg-[#ffdad6] text-[#93000a] text-[12px] font-bold px-3 py-1 rounded-full border border-[#ffdad6]">
              {missedCount > 0 ? `${missedCount} Incorrect` : '0 Missed! Perfect Score 🎉'}
            </span>
          </div>

          <div className="space-y-3">
            {results.missedQuestions.map((item, idx) => {
              const isExpanded = !!expandedQuestions[item.question.id];
              return (
                <div
                  key={item.question.id}
                  className="bg-white rounded-2xl border border-[#e3e1ea] shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => toggleQuestion(item.question.id)}
                    className="w-full p-4 flex items-start gap-3.5 text-left focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#ffdad6] text-[#93000a] flex items-center justify-center flex-shrink-0 font-extrabold text-[13px]">
                      Q{idx === 0 ? '12' : idx === 1 ? '28' : item.question.number}
                    </div>

                    <div className="flex-1 min-w-0">
                      {item.question.pyqSource && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#24389c] bg-[#dee0ff] px-2 py-0.5 rounded mb-1">
                          <span className="material-symbols-outlined text-[12px]">history_edu</span>
                          {item.question.pyqSource}
                        </span>
                      )}
                      <p className="text-[15px] font-semibold text-[#1a1b22] line-clamp-2">
                        {item.question.stem}
                      </p>
                      <p className="text-[12px] font-semibold text-[#ba1a1a] mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                        You answered: {item.selectedOptionText || 'Option C (Unattempted)'}
                      </p>
                    </div>

                    <span
                      className={`material-symbols-outlined text-[#454652] transition-transform duration-200 mt-1 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="bg-[#f4f2fc]/60 p-4 border-t border-[#efedf6] space-y-3">
                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[20px] text-[#24389c] mt-0.5">
                          smart_toy
                        </span>
                        <div className="flex-1">
                          <p className="text-[13px] font-bold text-[#24389c] uppercase tracking-wider">
                            AI Explanation
                          </p>
                          <div className="bg-[#F1F3F9] p-3.5 rounded-xl mt-2 text-[#1a1b22] text-[13px] leading-relaxed border border-[#dee0ff]/60">
                            {item.question.explanation.steps.map((step, sIdx) => (
                              <p key={sIdx} className={sIdx > 0 ? 'mt-2' : ''}>
                                {step}
                              </p>
                            ))}
                            <p className="mt-2 font-bold text-[#24389c]">
                              {item.question.explanation.correctSummary}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#e3e1ea]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />
                        <span className="text-[13px] font-bold text-[#1a1b22]">
                          Correct Answer: {item.correctOptionText}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="mt-2">
          <div className="bg-[#b78efe]/30 text-[#491d8a] rounded-2xl p-6 relative overflow-hidden shadow-sm flex flex-col gap-5 border border-[#b78efe]/50">
            {/* Background art from HTML */}
            <div
              className="absolute right-0 bottom-0 w-1/2 h-full opacity-25 bg-cover bg-left pointer-events-none"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqKzmAIoDOeFAht2IgOaHz6_XR7LhZR3ZwDOnlgQRQlOJC2gs57XHgwErgVeYCbYzNe_9BwEt4OQj4PLspAorGHDrvQZr-yVmkOFfq56MkfS9o55qQJ7IV4YEIHNxkj8tNkA_KTnDYAH9giI9ZAQur9qqh01ohhDNvaJ3CO3gAfZZX1g20YWODdHC-MqIFRkJ0qE1KkmOiYZ33iOyiZ815CGhlxsWzELwX5asi9gE0E8YmHLARX5EG0A')`,
              }}
            />

            <div className="relative z-10 space-y-2 max-w-[85%]">
              <span
                className="material-symbols-outlined text-[36px] text-[#24389c]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                rocket_launch
              </span>
              <h3 className="text-[22px] font-black leading-tight text-[#1a1b22]">
                Keep the Momentum!
              </h3>
              <p className="text-[14px] text-[#491d8a] italic font-medium">
                "Success is the sum of small efforts, repeated day in and day out."
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onReviewMistakes}
                className="bg-[#24389c] text-white font-bold text-[14px] py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  assignment_turned_in
                </span>
                Review Mistakes
              </button>

              <button
                type="button"
                onClick={onNextDPP}
                className="bg-white/80 text-[#24389c] border-2 border-[#24389c] font-bold text-[14px] py-3.5 px-6 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Next DPP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
