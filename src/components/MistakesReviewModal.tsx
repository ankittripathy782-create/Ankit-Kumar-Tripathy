import React, { useState } from 'react';
import { MissedQuestionResult } from '../types';

interface MistakesReviewModalProps {
  missedQuestions: MissedQuestionResult[];
  onClose: () => void;
}

export const MistakesReviewModal: React.FC<MistakesReviewModalProps> = ({
  missedQuestions,
  onClose,
}) => {
  const [index, setIndex] = useState<number>(0);
  const current = missedQuestions[index];

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#fbf8ff] border-b border-[#e3e1ea] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#ffdad6] text-[#93000a] flex items-center justify-center font-bold text-[14px]">
              {index + 1}
            </span>
            <div>
              <h3 className="text-[16px] font-bold text-[#1a1b22]">
                Mistake Review ({index + 1} of {missedQuestions.length})
              </h3>
              <p className="text-[11px] font-semibold text-[#6f48b2] uppercase tracking-wider">
                {current.question.subjectName} • {current.question.chapter}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#efedf6] flex items-center justify-center text-[#454652] hover:bg-[#e3e1ea]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Question Stem */}
          <div className="bg-white rounded-xl p-4 border border-[#e3e1ea] shadow-sm space-y-2">
            {current.question.pyqSource && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#24389c] text-white text-[11px] font-black uppercase">
                <span className="material-symbols-outlined text-[13px]">history_edu</span>
                {current.question.pyqSource}
              </span>
            )}
            <p className="text-[16px] font-semibold text-[#1a1b22] leading-relaxed">
              {current.question.stem}
            </p>

            {current.question.image && (
              <div className="mt-3 bg-[#F1F3F9] p-3 rounded-lg flex justify-center">
                <img
                  src={current.question.image}
                  alt={current.question.diagramAlt || 'Question structure'}
                  className="max-h-48 object-contain mix-blend-multiply"
                />
              </div>
            )}
          </div>

          {/* User Answer vs Correct Answer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#ffdad6]/40 border border-[#ffdad6]">
              <span className="text-[11px] font-bold text-[#93000a] uppercase block mb-0.5">
                Your Selection
              </span>
              <p className="text-[14px] font-semibold text-[#ba1a1a]">
                {current.selectedOptionText || 'Unattempted / Skipped'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#34A853]/10 border border-[#34A853]/30">
              <span className="text-[11px] font-bold text-[#1e6b35] uppercase block mb-0.5">
                Correct Answer
              </span>
              <p className="text-[14px] font-semibold text-[#1e6b35]">
                {current.correctOptionText}
              </p>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="bg-[#f4f2fc] rounded-2xl p-4 border border-[#dee0ff]">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#24389c] text-[20px]">
                smart_toy
              </span>
              <h4 className="text-[14px] font-bold text-[#24389c]">
                {current.question.explanation.title || 'Step-by-Step Solution'}
              </h4>
            </div>

            <div className="space-y-2 text-[13px] text-[#1a1b22] leading-relaxed">
              {current.question.explanation.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#24389c]/15 text-[#24389c] text-[10px] font-bold flex items-center justify-center mt-0.5 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-4 bg-[#fbf8ff] border-t border-[#e3e1ea] flex items-center justify-between">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((prev) => prev - 1)}
            className={`px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-1 transition-all ${
              index === 0
                ? 'bg-[#efedf6] text-[#c5c5d4] cursor-not-allowed'
                : 'bg-[#e9e7f0] text-[#1a1b22] hover:bg-[#e3e1ea]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            Previous
          </button>

          <span className="text-[12px] font-bold text-[#454652]">
            {index + 1} / {missedQuestions.length}
          </span>

          <button
            type="button"
            disabled={index === missedQuestions.length - 1}
            onClick={() => setIndex((prev) => prev + 1)}
            className={`px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-1 transition-all ${
              index === missedQuestions.length - 1
                ? 'bg-[#efedf6] text-[#c5c5d4] cursor-not-allowed'
                : 'bg-[#24389c] text-white hover:bg-[#3f51b5]'
            }`}
          >
            Next
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
