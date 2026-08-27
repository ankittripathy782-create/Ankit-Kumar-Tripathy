import React, { useState, useEffect, useMemo } from 'react';
import { Chapter, ChapterProgress, ExamType, SubSubject, SubjectId, UserProfile } from '../types';
import { FULL_SYLLABUS_DATA } from '../data/syllabus';

interface SyllabusTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
  initialCategory?: string;
  selectedExam?: ExamType;
  userProfile?: UserProfile;
  onStartChapterTest?: (chapterId: string) => void;
}

const STORAGE_KEY = 'preppulse_syllabus_tracker_v3';

export function clearSyllabusTrackerStorage(): void {
  try {
    localStorage.removeItem('preppulse_syllabus_tracker_v1');
    localStorage.removeItem('preppulse_syllabus_tracker_v2');
    localStorage.removeItem('preppulse_syllabus_tracker_v3');
  } catch {
    // ignore
  }
}

export const SyllabusTrackerModal: React.FC<SyllabusTrackerModalProps> = ({
  isOpen,
  onClose,
  initialSubject = 'all',
  initialCategory,
  selectedExam = 'NEET',
  userProfile,
  onStartChapterTest,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialCategory || initialSubject || 'all');
  const [classFilter, setClassFilter] = useState<'All' | 'Class 11' | 'Class 12'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [printMode, setPrintMode] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>(userProfile?.name || 'Scholar Aspirant');
  const [targetExam, setTargetExam] = useState<'NEET (UG)' | 'JEE MAIN' | 'NEET & JEE'>(
    selectedExam === 'NEET' ? 'NEET (UG)' : selectedExam === 'JEE' ? 'JEE MAIN' : 'NEET & JEE'
  );

  // Load progress from localStorage
  const [progressMap, setProgressMap] = useState<Record<string, ChapterProgress>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  useEffect(() => {
    if (userProfile?.name) {
      setStudentName(userProfile.name);
    }
  }, [userProfile?.name]);

  useEffect(() => {
    if (selectedExam) {
      setTargetExam(selectedExam === 'NEET' ? 'NEET (UG)' : 'JEE MAIN');
    }
  }, [selectedExam]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
    } catch {
      // ignore
    }
  }, [progressMap]);

  useEffect(() => {
    const tabToSet = initialCategory || initialSubject;
    if (tabToSet) {
      setActiveTab(tabToSet);
    }
  }, [initialCategory, initialSubject]);

  const toggleProgressField = (chapterId: string, field: keyof Omit<ChapterProgress, 'chapterId' | 'mockScore' | 'notes' | 'revisionDate'>) => {
    setProgressMap((prev) => {
      const current = prev[chapterId] || {
        chapterId,
        theoryRead: false,
        ncertExemplarDone: false,
        pyqsSolved: false,
        examTested: false,
      };
      return {
        ...prev,
        [chapterId]: {
          ...current,
          [field]: !current[field],
          revisionDate: !current[field] ? new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : current.revisionDate,
        },
      };
    });
  };

  const updateScoreNote = (chapterId: string, value: string) => {
    setProgressMap((prev) => {
      const current = prev[chapterId] || {
        chapterId,
        theoryRead: false,
        ncertExemplarDone: false,
        pyqsSolved: false,
        examTested: false,
      };
      return {
        ...prev,
        [chapterId]: {
          ...current,
          mockScore: value,
          examTested: value.trim().length > 0 ? true : current.examTested,
        },
      };
    });
  };

  // Filter chapters based on current active tab
  const filteredChapters = useMemo(() => {
    return FULL_SYLLABUS_DATA.filter((ch) => {
      // Subject / SubSubject filter
      if (activeTab === 'physics' && ch.subject !== 'physics') return false;
      if (activeTab === 'chemistry_physical' && (ch.subject !== 'chemistry' || ch.subSubject !== 'Physical Chemistry')) return false;
      if (activeTab === 'chemistry_inorganic' && (ch.subject !== 'chemistry' || ch.subSubject !== 'Inorganic Chemistry')) return false;
      if (activeTab === 'chemistry_organic' && (ch.subject !== 'chemistry' || ch.subSubject !== 'Organic Chemistry')) return false;
      if (activeTab === 'biology_botany' && (ch.subject !== 'biology' || ch.subSubject !== 'Botany')) return false;
      if (activeTab === 'biology_zoology' && (ch.subject !== 'biology' || ch.subSubject !== 'Zoology')) return false;
      if (activeTab === 'mathematics' && ch.subject !== 'mathematics') return false;
      
      // Class filter
      if (classFilter !== 'All' && ch.classLevel !== classFilter) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = ch.name.toLowerCase().includes(q);
        const matchSub = ch.subCategory?.toLowerCase().includes(q) || false;
        if (!matchName && !matchSub) return false;
      }

      return true;
    });
  }, [activeTab, classFilter, searchQuery]);

  // Completion stats
  const totalInView = filteredChapters.length;
  const testedCount = filteredChapters.filter((c) => progressMap[c.id]?.examTested).length;
  const pyqCount = filteredChapters.filter((c) => progressMap[c.id]?.pyqsSolved).length;
  const theoryCount = filteredChapters.filter((c) => progressMap[c.id]?.theoryRead).length;
  const overallPercentage = totalInView > 0 ? Math.round((testedCount / totalInView) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleMarkAllTested = () => {
    const next = { ...progressMap };
    filteredChapters.forEach((ch) => {
      next[ch.id] = {
        ...(next[ch.id] || { chapterId: ch.id }),
        theoryRead: true,
        ncertExemplarDone: true,
        pyqsSolved: true,
        examTested: true,
        revisionDate: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      };
    });
    setProgressMap(next);
  };

  const handleClearProgress = () => {
    if (confirm('Reset completion marks for the chapters currently shown?')) {
      const next = { ...progressMap };
      filteredChapters.forEach((ch) => {
        delete next[ch.id];
      });
      setProgressMap(next);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      <div
        id="printable-syllabus-sheet"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:rounded-none overflow-hidden"
      >
        {/* Header - Screen View */}
        <div className="p-4 sm:p-5 border-b border-[#e3e1ea] bg-gradient-to-r from-[#24389c] to-[#3f51b5] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-bold text-[20px]">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-white/20 uppercase tracking-wider">
                  Official NCERT Syllabus
                </span>
                <span className="text-[11px] text-white/80">NEET & JEE Complete</span>
              </div>
              <h2 className="text-[18px] sm:text-[20px] font-black">
                Subject Syllabus Checklist & Exam Tracker
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-white text-[#24389c] px-3.5 py-1.5 rounded-xl font-bold text-[13px] shadow-sm hover:bg-[#dee0ff] transition-all flex items-center gap-1.5 cursor-pointer"
              title="Print official syllabus sheet or save as PDF"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Printable Official Header (Shown when printing) */}
        <div className="hidden print:block p-6 border-b-2 border-black">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-[20px] font-black uppercase tracking-tight text-black">
                NTA NEET (UG) & JEE MAIN OFFICIAL SYLLABUS RECORD
              </h1>
              <p className="text-[12px] text-gray-700 font-medium">
                Comprehensive NCERT Chapter Tracker • Theory, PYQ & Mock Test Completion
              </p>
            </div>
            <div className="text-right text-[11px] text-gray-600">
              <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
              <p className="font-bold text-black">PrepPulse NCERT Engine</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-gray-300 text-[12px]">
            <div>
              <span className="font-bold text-gray-600">Candidate Name: </span>
              <span className="font-extrabold text-black">{studentName}</span>
            </div>
            <div>
              <span className="font-bold text-gray-600">Target Exam: </span>
              <span className="font-extrabold text-black">{targetExam}</span>
            </div>
            <div>
              <span className="font-bold text-gray-600">Section: </span>
              <span className="font-extrabold text-black capitalize">
                {activeTab.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Subjects & Disciplines */}
        <div className="border-b border-[#e3e1ea] bg-[#f8f9ff] px-4 pt-3 flex items-center gap-1.5 overflow-x-auto print:hidden scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 text-[13px] font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'all'
                ? 'bg-white text-[#24389c] border-[#24389c] shadow-sm'
                : 'text-[#505260] border-transparent hover:text-[#1a1b22]'
            }`}
          >
            All Syllabus ({FULL_SYLLABUS_DATA.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('physics')}
            className={`px-3 py-2 text-[13px] font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'physics'
                ? 'bg-white text-[#24389c] border-[#24389c] shadow-sm'
                : 'text-[#505260] border-transparent hover:text-[#1a1b22]'
            }`}
          >
            ⚡ Physics (29)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chemistry_physical')}
            className={`px-3 py-2 text-[13px] font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'chemistry_physical'
                ? 'bg-white text-[#24389c] border-[#24389c] shadow-sm'
                : 'text-[#505260] border-transparent hover:text-[#1a1b22]'
            }`}
          >
            🧪 Physical Chem (8)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chemistry_inorganic')}
            className={`px-3 py-2 text-[13px] font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'chemistry_inorganic'
                ? 'bg-white text-[#24389c] border-[#24389c] shadow-sm'
                : 'text-[#505260] border-transparent hover:text-[#1a1b22]'
            }`}
          >
            🔬 Inorganic Chem (7)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chemistry_organic')}
            className={`px-3 py-2 text-[13px] font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'chemistry_organic'
                ? 'bg-white text-[#24389c] border-[#24389c] shadow-sm'
                : 'text-[#505260] border-transparent hover:text-[#1a1b22]'
            }`}
          >
            ⚗️ Organic Chem (7)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('biology_botany')}
            className={`px-3 py-2 text-[13px] font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'biology_botany'
                ? 'bg-white text-[#24389c] border-[#24389c] shadow-sm'
                : 'text-[#505260] border-transparent hover:text-[#1a1b22]'
            }`}
          >
            🌿 Botany (17)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('biology_zoology')}
            className={`px-3 py-2 text-[13px] font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'biology_zoology'
                ? 'bg-white text-[#24389c] border-[#24389c] shadow-sm'
                : 'text-[#505260] border-transparent hover:text-[#1a1b22]'
            }`}
          >
            🐾 Zoology (15)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mathematics')}
            className={`px-3 py-2 text-[13px] font-bold rounded-t-xl transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'mathematics'
                ? 'bg-white text-[#24389c] border-[#24389c] shadow-sm'
                : 'text-[#505260] border-transparent hover:text-[#1a1b22]'
            }`}
          >
            📐 Mathematics (23)
          </button>
        </div>

        {/* Filter and Quick Stats Bar */}
        <div className="p-3 sm:px-5 bg-white border-b border-[#e3e1ea] flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative w-full max-w-xs">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-[#6b6d7c]">
                search
              </span>
              <input
                type="text"
                placeholder="Search chapter or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-[13px] rounded-lg border border-[#e3e1ea] focus:outline-none focus:border-[#24389c]"
              />
            </div>

            {/* Class Pill Filters */}
            <div className="flex bg-[#f2f1f8] p-0.5 rounded-lg text-[12px] font-bold">
              {(['All', 'Class 11', 'Class 12'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setClassFilter(lvl)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    classFilter === lvl
                      ? 'bg-white text-[#24389c] shadow-xs'
                      : 'text-[#505260] hover:text-[#1a1b22]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress Badge */}
            <div className="flex items-center gap-2 bg-[#f4f2fc] px-3 py-1.5 rounded-xl border border-[#e3e1ea]">
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#6f48b2] block">
                  Tested: {testedCount}/{totalInView}
                </span>
                <div className="w-24 h-1.5 bg-[#e3e1ea] rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-[#6f48b2] rounded-full transition-all duration-300"
                    style={{ width: `${overallPercentage}%` }}
                  />
                </div>
              </div>
              <span className="text-[14px] font-black text-[#6f48b2]">
                {overallPercentage}%
              </span>
            </div>

            {/* Quick Actions */}
            <button
              type="button"
              onClick={handleMarkAllTested}
              className="text-[12px] font-bold text-[#24389c] hover:bg-[#dee0ff]/60 px-2 py-1 rounded cursor-pointer"
              title="Mark all listed chapters as tested"
            >
              Mark All Tested
            </button>
            <button
              type="button"
              onClick={handleClearProgress}
              className="text-[12px] font-bold text-[#a04040] hover:bg-[#ffebee] px-2 py-1 rounded cursor-pointer"
              title="Clear progress for view"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Scrollable Syllabus Table */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 print:p-0 print:overflow-visible">
          <table className="w-full text-left border-collapse text-[13px] print:text-[11px]">
            <thead>
              <tr className="border-b-2 border-[#24389c] bg-[#f8f9ff] text-[#24389c] font-black print:border-black print:bg-gray-100 print:text-black">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Chapter & NCERT Unit</th>
                <th className="py-2.5 px-2 text-center w-20">Class</th>
                <th className="py-2.5 px-2 text-center w-24">Weightage</th>
                <th className="py-2.5 px-2 text-center w-24">Theory [✓]</th>
                <th className="py-2.5 px-2 text-center w-24">PYQ (10Y) [✓]</th>
                <th className="py-2.5 px-2 text-center w-28">Exam Tested</th>
                <th className="py-2.5 px-3 text-center w-28">Mock Score / Date</th>
                {onStartChapterTest && (
                  <th className="py-2.5 px-2 text-center w-20 print:hidden">Practice</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e1ea] print:divide-gray-400">
              {filteredChapters.map((ch, idx) => {
                const prog = progressMap[ch.id] || {
                  chapterId: ch.id,
                  theoryRead: false,
                  ncertExemplarDone: false,
                  pyqsSolved: false,
                  examTested: false,
                  mockScore: '',
                  revisionDate: '',
                };

                const isFullyCompleted = prog.theoryRead && prog.pyqsSolved && prog.examTested;

                return (
                  <tr
                    key={ch.id}
                    className={`hover:bg-[#f8f9ff]/70 transition-colors ${
                      isFullyCompleted ? 'bg-[#eefaf2]/60' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-[#6b6d7c] print:text-black">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#1a1b22] leading-snug">
                        {ch.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-semibold text-[#505260]">
                          {ch.subSubject || ch.subCategory}
                        </span>
                        <span className="text-[10px] text-[#8e90a0]">•</span>
                        <span className="text-[11px] text-[#6b6d7c]">
                          ~{ch.questionCount} Questions in Bank
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-2 text-center font-semibold text-[#454652]">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-[#f2f1f8]">
                        {ch.classLevel}
                      </span>
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                          ch.weightage === 'High'
                            ? 'bg-[#ffebee] text-[#c62828]'
                            : 'bg-[#e8f5e9] text-[#2e7d32]'
                        }`}
                      >
                        {ch.weightage === 'High' ? 'High Yield' : 'Core'}
                      </span>
                    </td>

                    {/* Checkbox: Theory Read */}
                    <td className="py-2.5 px-2 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prog.theoryRead}
                          onChange={() => toggleProgressField(ch.id, 'theoryRead')}
                          className="w-4 h-4 text-[#24389c] rounded border-[#c7c5d0] focus:ring-[#24389c] cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* Checkbox: PYQs Solved */}
                    <td className="py-2.5 px-2 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prog.pyqsSolved}
                          onChange={() => toggleProgressField(ch.id, 'pyqsSolved')}
                          className="w-4 h-4 text-[#24389c] rounded border-[#c7c5d0] focus:ring-[#24389c] cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* Checkbox: Exam Tested */}
                    <td className="py-2.5 px-2 text-center">
                      <label className="inline-flex items-center gap-1.5 justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prog.examTested}
                          onChange={() => toggleProgressField(ch.id, 'examTested')}
                          className="w-4 h-4 text-[#34A853] rounded border-[#c7c5d0] focus:ring-[#34A853] cursor-pointer"
                        />
                        {prog.examTested && (
                          <span className="text-[10px] font-bold text-[#34A853] print:hidden">
                            Done
                          </span>
                        )}
                      </label>
                    </td>

                    {/* Mock Score / Remarks Input */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="text"
                        placeholder="e.g. 40/45"
                        value={prog.mockScore || ''}
                        onChange={(e) => updateScoreNote(ch.id, e.target.value)}
                        className="w-20 px-2 py-1 text-[12px] text-center border border-[#e3e1ea] rounded font-semibold focus:outline-none focus:border-[#24389c] print:border-none print:font-bold"
                      />
                      {prog.revisionDate && (
                        <span className="block text-[10px] text-[#6b6d7c] mt-0.5 print:hidden">
                          {prog.revisionDate}
                        </span>
                      )}
                    </td>

                    {/* Practice button */}
                    {onStartChapterTest && (
                      <td className="py-2.5 px-2 text-center print:hidden">
                        <button
                          type="button"
                          onClick={() => onStartChapterTest(ch.id)}
                          className="px-2 py-1 bg-[#24389c]/10 text-[#24389c] hover:bg-[#24389c] hover:text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                          title="Start quick test on this chapter"
                        >
                          Test
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredChapters.length === 0 && (
            <div className="text-center py-12 text-[#6b6d7c]">
              <span className="material-symbols-outlined text-[36px] text-[#a0a2b0] mb-2 block">
                search_off
              </span>
              <p className="text-[14px] font-bold">No chapters matched the current filters</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setClassFilter('All');
                }}
                className="mt-2 text-[12px] text-[#24389c] font-bold hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

        {/* Footer info and PDF instructions */}
        <div className="p-4 border-t border-[#e3e1ea] bg-[#fdfcff] flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#454652] print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#24389c] text-[18px]">
              lightbulb
            </span>
            <span>
              <strong>Tip:</strong> Click <strong>Print / Save PDF</strong> to generate a clean A4 revision sheet for your study wall.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-[#e3e1ea] font-bold hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-[#24389c] text-white font-bold hover:bg-[#1a2b7b] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
