import React, { useState, useMemo, useEffect } from 'react';
import { ExamType, TestFormat, QuestionMix, DifficultyLevel, TestConfig, Chapter } from '../types';
import { FULL_SYLLABUS_DATA } from '../data/syllabus';

interface TestDesignerProps {
  onStartTest: (config: TestConfig) => void;
  initialExam?: ExamType;
  initialQuestionCount?: number;
  onExamChange?: (exam: ExamType) => void;
}

export const TestDesigner: React.FC<TestDesignerProps> = ({
  onStartTest,
  initialExam = 'NEET',
  initialQuestionCount = 45,
  onExamChange,
}) => {
  const [exam, setExam] = useState<ExamType>(initialExam);

  useEffect(() => {
    if (initialExam && initialExam !== exam) {
      setExam(initialExam);
      setSelectedChapters({});
      setQuestionsCount(initialExam === 'NEET' ? 45 : 75);
      setTimeLimitMinutes(initialExam === 'NEET' ? 45 : 180);
    }
  }, [initialExam]);
  const [format, setFormat] = useState<TestFormat>(initialQuestionCount >= 90 ? 'mock' : 'dpp');
  const [questionMix, setQuestionMix] = useState<QuestionMix>('balanced');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('adaptive');
  const [questionsCount, setQuestionsCount] = useState<number>(initialQuestionCount);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(
    initialQuestionCount === 180 ? 200 : initialQuestionCount === 75 ? 180 : initialQuestionCount
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [classFilter, setClassFilter] = useState<'All' | 'Class 11' | 'Class 12'>('All');
  const [expandedSubject, setExpandedSubject] = useState<string | null>('physics');

  // Sub-subject filter tabs inside subject accordions
  const [chemSubFilter, setChemSubFilter] = useState<'All' | 'Physical' | 'Inorganic' | 'Organic'>('All');
  const [bioSubFilter, setBioSubFilter] = useState<'All' | 'Botany' | 'Zoology'>('All');

  // Selected chapters map: chapterId -> boolean
  const [selectedChapters, setSelectedChapters] = useState<Record<string, boolean>>({});

  // Filtered chapters for current exam
  const relevantChapters = useMemo(() => {
    return FULL_SYLLABUS_DATA.filter((c) => {
      if (exam === 'NEET') {
        return c.subject === 'physics' || c.subject === 'chemistry' || c.subject === 'biology';
      } else {
        return c.subject === 'physics' || c.subject === 'chemistry' || c.subject === 'mathematics';
      }
    });
  }, [exam]);

  // Group chapters by subject with search & class filters
  const physicsChapters = useMemo(() => {
    return relevantChapters
      .filter((c) => c.subject === 'physics')
      .filter((c) => (classFilter === 'All' ? true : c.classLevel === classFilter))
      .filter((c) =>
        searchQuery.trim() === ''
          ? true
          : c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.subCategory && c.subCategory.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [relevantChapters, classFilter, searchQuery]);

  const chemistryChapters = useMemo(() => {
    return relevantChapters
      .filter((c) => c.subject === 'chemistry')
      .filter((c) => {
        if (chemSubFilter === 'Physical') return c.subSubject === 'Physical Chemistry';
        if (chemSubFilter === 'Inorganic') return c.subSubject === 'Inorganic Chemistry';
        if (chemSubFilter === 'Organic') return c.subSubject === 'Organic Chemistry';
        return true;
      })
      .filter((c) => (classFilter === 'All' ? true : c.classLevel === classFilter))
      .filter((c) =>
        searchQuery.trim() === ''
          ? true
          : c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.subSubject && c.subSubject.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (c.subCategory && c.subCategory.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [relevantChapters, chemSubFilter, classFilter, searchQuery]);

  const biologyChapters = useMemo(() => {
    if (exam !== 'NEET') return [];
    return relevantChapters
      .filter((c) => c.subject === 'biology')
      .filter((c) => {
        if (bioSubFilter === 'Botany') return c.subSubject === 'Botany';
        if (bioSubFilter === 'Zoology') return c.subSubject === 'Zoology';
        return true;
      })
      .filter((c) => (classFilter === 'All' ? true : c.classLevel === classFilter))
      .filter((c) =>
        searchQuery.trim() === ''
          ? true
          : c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.subSubject && c.subSubject.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (c.subCategory && c.subCategory.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [relevantChapters, exam, bioSubFilter, classFilter, searchQuery]);

  const mathChapters = useMemo(() => {
    if (exam !== 'JEE') return [];
    return relevantChapters
      .filter((c) => c.subject === 'mathematics')
      .filter((c) => (classFilter === 'All' ? true : c.classLevel === classFilter))
      .filter((c) =>
        searchQuery.trim() === ''
          ? true
          : c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.subCategory && c.subCategory.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [relevantChapters, exam, classFilter, searchQuery]);

  // Master counts
  const allPhysics = relevantChapters.filter((c) => c.subject === 'physics');
  const allChem = relevantChapters.filter((c) => c.subject === 'chemistry');
  const allPhysicalChem = allChem.filter((c) => c.subSubject === 'Physical Chemistry');
  const allInorganicChem = allChem.filter((c) => c.subSubject === 'Inorganic Chemistry');
  const allOrganicChem = allChem.filter((c) => c.subSubject === 'Organic Chemistry');

  const allBio = relevantChapters.filter((c) => c.subject === 'biology');
  const allBotany = allBio.filter((c) => c.subSubject === 'Botany');
  const allZoology = allBio.filter((c) => c.subSubject === 'Zoology');

  const allMath = relevantChapters.filter((c) => c.subject === 'mathematics');

  const physicsSelectedCount = allPhysics.filter((c) => selectedChapters[c.id]).length;
  const chemSelectedCount = allChem.filter((c) => selectedChapters[c.id]).length;
  const bioSelectedCount = allBio.filter((c) => selectedChapters[c.id]).length;
  const mathSelectedCount = allMath.filter((c) => selectedChapters[c.id]).length;

  const totalSelectedCount =
    physicsSelectedCount +
    chemSelectedCount +
    (exam === 'NEET' ? bioSelectedCount : mathSelectedCount);
  const totalAvailableChapters = relevantChapters.length;

  const handleToggleChapter = (chapterId: string) => {
    setSelectedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleSelectSubjectAll = (subjectChapters: Chapter[]) => {
    const allSelected = subjectChapters.every((c) => selectedChapters[c.id]);
    const newState = { ...selectedChapters };
    subjectChapters.forEach((c) => {
      newState[c.id] = !allSelected;
    });
    setSelectedChapters(newState);
  };

  const handleSelectAllGlobal = () => {
    const allSelected = relevantChapters.every((c) => selectedChapters[c.id]);
    const newState = { ...selectedChapters };
    relevantChapters.forEach((c) => {
      newState[c.id] = !allSelected;
    });
    setSelectedChapters(newState);
  };

  const handleQuestionsPreset = (count: number) => {
    setQuestionsCount(count);
    if (count === 180) {
      setTimeLimitMinutes(200); // Official NEET time: 200 mins
    } else if (count === 75 || count === 90) {
      setTimeLimitMinutes(180); // Official JEE time: 180 mins
    } else if (format === 'dpp') {
      setTimeLimitMinutes(count);
    } else {
      setTimeLimitMinutes(Math.round(count * 1.5));
    }
  };

  const handleFormatChange = (newFormat: TestFormat) => {
    setFormat(newFormat);
    if (newFormat === 'mock') {
      if (exam === 'NEET') {
        setQuestionsCount(180);
        setTimeLimitMinutes(200);
      } else {
        setQuestionsCount(75);
        setTimeLimitMinutes(180);
      }
    } else {
      setQuestionsCount(45);
      setTimeLimitMinutes(45);
    }
  };

  const estimatedTotalMarks = questionsCount * 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeSelectedIds = Object.keys(selectedChapters).filter((id) => selectedChapters[id]);

    const config: TestConfig = {
      exam,
      format,
      selectedChapters: activeSelectedIds,
      questionMix,
      difficulty,
      questionCount: questionsCount,
      timeLimitMinutes,
      totalMarks: estimatedTotalMarks,
    };

    onStartTest(config);
  };

  const neetPresets = [15, 45, 90, 180];
  const jeePresets = [15, 30, 75, 90, 180];
  const currentPresets = exam === 'NEET' ? neetPresets : jeePresets;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-28">
      {/* Top Banner / Hero */}
      <div className="px-4 sm:px-6 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#24389c]/10 text-[#24389c] text-[12px] font-bold tracking-wide uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-[#24389c] animate-pulse" />
              Full NCERT Syllabus Engine
            </div>
            <h1 className="text-[26px] sm:text-[30px] font-extrabold text-[#1a1b22] tracking-tight">
              Design Your Test
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#454652] mt-0.5">
              Select from all {totalAvailableChapters} {exam} NCERT chapters with authentic PYQs.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end bg-white p-2.5 rounded-xl border border-[#e3e1ea] shadow-sm">
            <span className="text-[11px] font-bold text-[#454652] uppercase">Marks Pool</span>
            <span className="text-[18px] font-black text-[#24389c]">+{estimatedTotalMarks}</span>
            {questionsCount === 180 && (
              <span className="text-[10px] font-extrabold text-[#2e7d32] bg-[#e8f5e9] px-1.5 rounded">
                720M Full Pattern
              </span>
            )}
            {questionsCount === 75 && (
              <span className="text-[10px] font-extrabold text-[#24389c] bg-[#dee0ff] px-1.5 rounded">
                300M JEE Pattern
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 sm:px-6 flex flex-col gap-5">
        {/* 1. Target Exam Toggle */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[12px] font-bold text-[#1a1b22] uppercase tracking-wider opacity-80">
              TARGET EXAM
            </h2>
            <span className="text-[12px] font-medium text-[#454652]">
              {exam === 'NEET' ? 'Physics + Chem + Botany & Zoology' : 'Physics + Chem + Mathematics'}
            </span>
          </div>

          <div className="bg-[#f4f2fc] p-1 rounded-2xl flex w-full relative border border-[#e3e1ea]">
            <div
              className={`absolute inset-y-1 w-[calc(50%-4px)] bg-[#24389c] rounded-xl shadow-md transition-all duration-300 ease-out ${
                exam === 'NEET' ? 'left-1' : 'left-[calc(50%+2px)]'
              }`}
            />
            <button
              type="button"
              onClick={() => {
                setExam('NEET');
                setSelectedChapters({});
                setQuestionsCount(45);
                setTimeLimitMinutes(45);
                onExamChange?.('NEET');
              }}
              className={`relative z-10 flex-1 py-3 text-[14px] font-extrabold text-center rounded-xl transition-colors cursor-pointer ${
                exam === 'NEET' ? 'text-white' : 'text-[#454652] hover:text-[#1a1b22]'
              }`}
            >
              🩺 NEET (Medical • 720 Marks)
            </button>
            <button
              type="button"
              onClick={() => {
                setExam('JEE');
                setSelectedChapters({});
                setQuestionsCount(75);
                setTimeLimitMinutes(180);
                onExamChange?.('JEE');
              }}
              className={`relative z-10 flex-1 py-3 text-[14px] font-extrabold text-center rounded-xl transition-colors cursor-pointer ${
                exam === 'JEE' ? 'text-white' : 'text-[#454652] hover:text-[#1a1b22]'
              }`}
            >
              📐 JEE Main (Engineering • 300 Marks)
            </button>
          </div>
        </section>

        {/* 2. Test Format Cards */}
        <section>
          <h2 className="text-[12px] font-bold text-[#1a1b22] uppercase tracking-wider opacity-80 mb-2">
            TEST FORMAT
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Daily Practice */}
            <label className="cursor-pointer relative group">
              <input
                type="radio"
                name="testType"
                value="dpp"
                checked={format === 'dpp'}
                onChange={() => handleFormatChange('dpp')}
                className="peer sr-only"
              />
              <div className="h-full p-4 rounded-2xl bg-white border border-[#e3e1ea] shadow-sm peer-checked:shadow-md peer-checked:bg-[#24389c]/5 peer-checked:border-[#24389c] transition-all flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-xl bg-[#24389c]/10 text-[#24389c] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">bolt</span>
                </div>
                <span className="text-[15px] font-bold text-[#1a1b22]">Daily Practice (DPP)</span>
                <span className="text-[12px] font-medium text-[#454652] mt-0.5">
                  15 to 45 focused questions
                </span>
              </div>
            </label>

            {/* Full Mock Test */}
            <label className="cursor-pointer relative group">
              <input
                type="radio"
                name="testType"
                value="mock"
                checked={format === 'mock'}
                onChange={() => handleFormatChange('mock')}
                className="peer sr-only"
              />
              <div className="h-full p-4 rounded-2xl bg-white border border-[#e3e1ea] shadow-sm peer-checked:shadow-md peer-checked:bg-[#24389c]/5 peer-checked:border-[#24389c] transition-all flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-xl bg-[#6f48b2]/10 text-[#6f48b2] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">assignment</span>
                </div>
                <span className="text-[15px] font-bold text-[#1a1b22]">Full Official Mock</span>
                <span className="text-[12px] font-medium text-[#454652] mt-0.5">
                  {exam === 'NEET' ? '180 Qs (720M) Pattern' : '75 / 180 Qs Pattern'}
                </span>
              </div>
            </label>
          </div>
        </section>

        {/* 3. Full Syllabus Chapters Browser with Divisions */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[12px] font-bold text-[#1a1b22] uppercase tracking-wider opacity-80">
                  FULL SYLLABUS CHAPTERS
                </h2>
                <span className="bg-[#24389c]/10 text-[#24389c] text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {totalSelectedCount > 0
                    ? `${totalSelectedCount} of ${totalAvailableChapters} Selected`
                    : 'All Chapters Included'}
                </span>
              </div>
              <p className="text-[12px] text-[#454652]">
                Organized by Botany, Zoology, Physical, Inorganic & Organic disciplines.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllGlobal}
                className="text-[12px] font-bold text-[#24389c] bg-[#dee0ff]/60 px-3 py-1.5 rounded-lg hover:bg-[#dee0ff] transition-colors cursor-pointer"
              >
                {totalSelectedCount === totalAvailableChapters ? 'Deselect All' : 'Select All Chapters'}
              </button>
            </div>
          </div>

          {/* Search and Class filter pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#454652] text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search chapter (e.g. Genetics, Thermodynamics, Botany...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-[#e3e1ea] rounded-xl focus:outline-none focus:border-[#24389c] text-[#1a1b22]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#454652] text-[14px]"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-[#efedf6] p-1 rounded-xl">
              {(['All', 'Class 11', 'Class 12'] as const).map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setClassFilter(cls)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    classFilter === cls
                      ? 'bg-white text-[#24389c] shadow-sm'
                      : 'text-[#454652] hover:text-[#1a1b22]'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion Container for Subjects */}
          <div className="bg-white rounded-2xl border border-[#e3e1ea] shadow-sm overflow-hidden divide-y divide-[#e3e1ea]">
            {/* PHYSICS ACCORDION */}
            <div className="accordion-item">
              <div className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-[#fbf8ff] transition-colors">
                <button
                  type="button"
                  onClick={() => setExpandedSubject(expandedSubject === 'physics' ? null : 'physics')}
                  className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                >
                  <div className="w-2.5 h-8 rounded-full bg-[#24389c]" />
                  <div>
                    <span className="text-[15px] font-bold text-[#1a1b22] block">
                      ⚡ Physics ({allPhysics.length} Chapters)
                    </span>
                    <span className="text-[11px] text-[#454652]">
                      Mechanics, Electromagnetism, Optics & Modern Physics
                    </span>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectSubjectAll(allPhysics)}
                    className="text-[11px] font-bold text-[#24389c] hover:underline px-2 py-1"
                  >
                    {physicsSelectedCount === allPhysics.length ? 'Clear' : 'Select All'}
                  </button>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      physicsSelectedCount > 0
                        ? 'bg-[#24389c]/15 text-[#24389c]'
                        : 'bg-[#efedf6] text-[#454652]'
                    }`}
                  >
                    {physicsSelectedCount}/{allPhysics.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedSubject(expandedSubject === 'physics' ? null : 'physics')}
                    className="p-1 text-[#454652]"
                  >
                    <span
                      className={`material-symbols-outlined transition-transform duration-200 ${
                        expandedSubject === 'physics' ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                </div>
              </div>

              {expandedSubject === 'physics' && (
                <div className="px-3 py-2 bg-[#fbf8ff] border-t border-[#efedf6] max-h-72 overflow-y-auto space-y-1 divide-y divide-[#efedf6]/60">
                  {physicsChapters.length === 0 ? (
                    <p className="text-[12px] text-[#454652] py-3 text-center">
                      No physics chapters match the search filter.
                    </p>
                  ) : (
                    physicsChapters.map((ch) => {
                      const isChecked = !!selectedChapters[ch.id];
                      return (
                        <label
                          key={ch.id}
                          className="flex items-center justify-between py-2 px-2 cursor-pointer group rounded-lg hover:bg-white transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleChapter(ch.id)}
                              className="peer sr-only"
                            />
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center transition-colors border flex-shrink-0 ${
                                isChecked
                                  ? 'bg-[#24389c] border-[#24389c]'
                                  : 'bg-[#e9e7f0] border-[#c5c5d4] group-hover:border-[#24389c]'
                              }`}
                            >
                              {isChecked && (
                                <span className="material-symbols-outlined text-[12px] text-white font-bold">
                                  check
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-[13px] truncate ${
                                isChecked ? 'font-bold text-[#24389c]' : 'text-[#1a1b22]'
                              }`}
                            >
                              {ch.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {ch.classLevel && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#efedf6] text-[#454652]">
                                {ch.classLevel}
                              </span>
                            )}
                            {ch.weightage === 'High' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#93000a]">
                                High Yield
                              </span>
                            )}
                            <span className="text-[11px] font-semibold text-[#454652]">
                              {ch.questionCount} Qs
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* CHEMISTRY ACCORDION (DIVIDED INTO PHYSICAL, INORGANIC, ORGANIC) */}
            <div className="accordion-item">
              <div className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-[#fbf8ff] transition-colors">
                <button
                  type="button"
                  onClick={() => setExpandedSubject(expandedSubject === 'chemistry' ? null : 'chemistry')}
                  className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                >
                  <div className="w-2.5 h-8 rounded-full bg-[#6f48b2]" />
                  <div>
                    <span className="text-[15px] font-bold text-[#1a1b22] block">
                      🧪 Chemistry ({allChem.length} Chapters)
                    </span>
                    <span className="text-[11px] text-[#454652]">
                      Physical ({allPhysicalChem.length}) • Inorganic ({allInorganicChem.length}) • Organic ({allOrganicChem.length})
                    </span>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectSubjectAll(allChem)}
                    className="text-[11px] font-bold text-[#6f48b2] hover:underline px-2 py-1"
                  >
                    {chemSelectedCount === allChem.length ? 'Clear' : 'Select All'}
                  </button>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      chemSelectedCount > 0
                        ? 'bg-[#6f48b2]/15 text-[#6f48b2]'
                        : 'bg-[#efedf6] text-[#454652]'
                    }`}
                  >
                    {chemSelectedCount}/{allChem.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedSubject(expandedSubject === 'chemistry' ? null : 'chemistry')}
                    className="p-1 text-[#454652]"
                  >
                    <span
                      className={`material-symbols-outlined transition-transform duration-200 ${
                        expandedSubject === 'chemistry' ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                </div>
              </div>

              {expandedSubject === 'chemistry' && (
                <div className="bg-[#fbf8ff] border-t border-[#efedf6] p-3 space-y-2">
                  {/* Discipline Selector Pills for Chemistry */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-[#6b6d7c] mr-1">Section:</span>
                    {(
                      [
                        { id: 'All', label: `All (${allChem.length})` },
                        { id: 'Physical', label: `Physical (${allPhysicalChem.length})` },
                        { id: 'Inorganic', label: `Inorganic (${allInorganicChem.length})` },
                        { id: 'Organic', label: `Organic (${allOrganicChem.length})` },
                      ] as const
                    ).map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setChemSubFilter(sub.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          chemSubFilter === sub.id
                            ? 'bg-[#6f48b2] text-white shadow-xs'
                            : 'bg-white border border-[#e3e1ea] text-[#454652] hover:border-[#6f48b2]'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}

                    <div className="ml-auto flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleSelectSubjectAll(allPhysicalChem)}
                        className="text-[10px] font-bold text-[#6f48b2] hover:underline"
                      >
                        +Physical
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSubjectAll(allInorganicChem)}
                        className="text-[10px] font-bold text-[#6f48b2] hover:underline ml-1"
                      >
                        +Inorg
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSubjectAll(allOrganicChem)}
                        className="text-[10px] font-bold text-[#6f48b2] hover:underline ml-1"
                      >
                        +Organic
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1 divide-y divide-[#efedf6]/60 pr-1">
                    {chemistryChapters.length === 0 ? (
                      <p className="text-[12px] text-[#454652] py-3 text-center">
                        No chemistry chapters match the filter.
                      </p>
                    ) : (
                      chemistryChapters.map((ch) => {
                        const isChecked = !!selectedChapters[ch.id];
                        return (
                          <label
                            key={ch.id}
                            className="flex items-center justify-between py-2 px-2 cursor-pointer group rounded-lg hover:bg-white transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleChapter(ch.id)}
                                className="peer sr-only"
                              />
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center transition-colors border flex-shrink-0 ${
                                  isChecked
                                    ? 'bg-[#6f48b2] border-[#6f48b2]'
                                    : 'bg-[#e9e7f0] border-[#c5c5d4] group-hover:border-[#6f48b2]'
                                }`}
                              >
                                {isChecked && (
                                  <span className="material-symbols-outlined text-[12px] text-white font-bold">
                                    check
                                  </span>
                                )}
                              </div>
                              <div>
                                <span
                                  className={`text-[13px] block truncate ${
                                    isChecked ? 'font-bold text-[#6f48b2]' : 'text-[#1a1b22]'
                                  }`}
                                >
                                  {ch.name}
                                </span>
                                <span className="text-[10px] text-[#6b6d7c] font-medium">
                                  {ch.subSubject || ch.subCategory}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {ch.classLevel && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#efedf6] text-[#454652]">
                                  {ch.classLevel}
                                </span>
                              )}
                              {ch.weightage === 'High' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#93000a]">
                                  High Yield
                                </span>
                              )}
                              <span className="text-[11px] font-semibold text-[#454652]">
                                {ch.questionCount} Qs
                              </span>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* BIOLOGY ACCORDION (FOR NEET - DIVIDED INTO BOTANY & ZOOLOGY) */}
            {exam === 'NEET' && (
              <div className="accordion-item">
                <div className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-[#fbf8ff] transition-colors">
                  <button
                    type="button"
                    onClick={() => setExpandedSubject(expandedSubject === 'biology' ? null : 'biology')}
                    className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                  >
                    <div className="w-2.5 h-8 rounded-full bg-[#1b873f]" />
                    <div>
                      <span className="text-[15px] font-bold text-[#1a1b22] block">
                        🌿 Biology ({allBio.length} Chapters)
                      </span>
                      <span className="text-[11px] text-[#454652]">
                        Botany ({allBotany.length}) • Zoology ({allZoology.length})
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectSubjectAll(allBio)}
                      className="text-[11px] font-bold text-[#1b873f] hover:underline px-2 py-1"
                    >
                      {bioSelectedCount === allBio.length ? 'Clear' : 'Select All'}
                    </button>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        bioSelectedCount > 0
                          ? 'bg-[#1b873f]/15 text-[#1b873f]'
                          : 'bg-[#efedf6] text-[#454652]'
                      }`}
                    >
                      {bioSelectedCount}/{allBio.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedSubject(expandedSubject === 'biology' ? null : 'biology')}
                      className="p-1 text-[#454652]"
                    >
                      <span
                        className={`material-symbols-outlined transition-transform duration-200 ${
                          expandedSubject === 'biology' ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                  </div>
                </div>

                {expandedSubject === 'biology' && (
                  <div className="bg-[#fbf8ff] border-t border-[#efedf6] p-3 space-y-2">
                    {/* Botany / Zoology Discipline Tabs */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-[#6b6d7c] mr-1">Discipline:</span>
                      {(
                        [
                          { id: 'All', label: `All Biology (${allBio.length})` },
                          { id: 'Botany', label: `🌿 Botany (${allBotany.length})` },
                          { id: 'Zoology', label: `🐾 Zoology (${allZoology.length})` },
                        ] as const
                      ).map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setBioSubFilter(sub.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            bioSubFilter === sub.id
                              ? 'bg-[#1b873f] text-white shadow-xs'
                              : 'bg-white border border-[#e3e1ea] text-[#454652] hover:border-[#1b873f]'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}

                      <div className="ml-auto flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleSelectSubjectAll(allBotany)}
                          className="text-[10px] font-bold text-[#1b873f] hover:underline"
                        >
                          +All Botany
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectSubjectAll(allZoology)}
                          className="text-[10px] font-bold text-[#1b873f] hover:underline ml-1.5"
                        >
                          +All Zoology
                        </button>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-1 divide-y divide-[#efedf6]/60 pr-1">
                      {biologyChapters.length === 0 ? (
                        <p className="text-[12px] text-[#454652] py-3 text-center">
                          No biology chapters match the filter.
                        </p>
                      ) : (
                        biologyChapters.map((ch) => {
                          const isChecked = !!selectedChapters[ch.id];
                          return (
                            <label
                              key={ch.id}
                              className="flex items-center justify-between py-2 px-2 cursor-pointer group rounded-lg hover:bg-white transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleChapter(ch.id)}
                                  className="peer sr-only"
                                />
                                <div
                                  className={`w-4 h-4 rounded flex items-center justify-center transition-colors border flex-shrink-0 ${
                                    isChecked
                                      ? 'bg-[#1b873f] border-[#1b873f]'
                                      : 'bg-[#e9e7f0] border-[#c5c5d4] group-hover:border-[#1b873f]'
                                  }`}
                                >
                                  {isChecked && (
                                    <span className="material-symbols-outlined text-[12px] text-white font-bold">
                                      check
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <span
                                    className={`text-[13px] block truncate ${
                                      isChecked ? 'font-bold text-[#1b873f]' : 'text-[#1a1b22]'
                                    }`}
                                  >
                                    {ch.name}
                                  </span>
                                  <span className="text-[10px] text-[#6b6d7c] font-medium">
                                    {ch.subSubject} • {ch.subCategory}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {ch.classLevel && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#efedf6] text-[#454652]">
                                    {ch.classLevel}
                                  </span>
                                )}
                                {ch.weightage === 'High' && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#93000a]">
                                    High Yield
                                  </span>
                                )}
                                <span className="text-[11px] font-semibold text-[#454652]">
                                  {ch.questionCount} Qs
                                </span>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MATHEMATICS ACCORDION (FOR JEE) */}
            {exam === 'JEE' && (
              <div className="accordion-item">
                <div className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-[#fbf8ff] transition-colors">
                  <button
                    type="button"
                    onClick={() => setExpandedSubject(expandedSubject === 'math' ? null : 'math')}
                    className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                  >
                    <div className="w-2.5 h-8 rounded-full bg-[#d97706]" />
                    <div>
                      <span className="text-[15px] font-bold text-[#1a1b22] block">
                        📐 Mathematics ({allMath.length} Chapters)
                      </span>
                      <span className="text-[11px] text-[#454652]">
                        Calculus, Algebra, Coordinate Geometry, Vectors & Trigonometry
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectSubjectAll(allMath)}
                      className="text-[11px] font-bold text-[#d97706] hover:underline px-2 py-1"
                    >
                      {mathSelectedCount === allMath.length ? 'Clear' : 'Select All'}
                    </button>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        mathSelectedCount > 0
                          ? 'bg-[#d97706]/15 text-[#d97706]'
                          : 'bg-[#efedf6] text-[#454652]'
                      }`}
                    >
                      {mathSelectedCount}/{allMath.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedSubject(expandedSubject === 'math' ? null : 'math')}
                      className="p-1 text-[#454652]"
                    >
                      <span
                        className={`material-symbols-outlined transition-transform duration-200 ${
                          expandedSubject === 'math' ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                  </div>
                </div>

                {expandedSubject === 'math' && (
                  <div className="px-3 py-2 bg-[#fbf8ff] border-t border-[#efedf6] max-h-72 overflow-y-auto space-y-1 divide-y divide-[#efedf6]/60">
                    {mathChapters.length === 0 ? (
                      <p className="text-[12px] text-[#454652] py-3 text-center">
                        No mathematics chapters match the search filter.
                      </p>
                    ) : (
                      mathChapters.map((ch) => {
                        const isChecked = !!selectedChapters[ch.id];
                        return (
                          <label
                            key={ch.id}
                            className="flex items-center justify-between py-2 px-2 cursor-pointer group rounded-lg hover:bg-white transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleChapter(ch.id)}
                                className="peer sr-only"
                              />
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center transition-colors border flex-shrink-0 ${
                                  isChecked
                                    ? 'bg-[#d97706] border-[#d97706]'
                                    : 'bg-[#e9e7f0] border-[#c5c5d4] group-hover:border-[#d97706]'
                                }`}
                              >
                                {isChecked && (
                                  <span className="material-symbols-outlined text-[12px] text-white font-bold">
                                    check
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-[13px] truncate ${
                                  isChecked ? 'font-bold text-[#d97706]' : 'text-[#1a1b22]'
                                }`}
                              >
                                {ch.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {ch.classLevel && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#efedf6] text-[#454652]">
                                  {ch.classLevel}
                                </span>
                              )}
                              {ch.weightage === 'High' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#93000a]">
                                  High Yield
                                </span>
                              )}
                              <span className="text-[11px] font-semibold text-[#454652]">
                                {ch.questionCount} Qs
                              </span>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 4. Question Mix & Difficulty */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h2 className="text-[12px] font-bold text-[#1a1b22] uppercase tracking-wider opacity-80 mb-2">
              QUESTION MIX & PYQ ARCHIVE
            </h2>
            <div className="grid grid-cols-3 gap-1.5 bg-[#f4f2fc] p-1 rounded-xl border border-[#e3e1ea]">
              <button
                type="button"
                onClick={() => setQuestionMix('balanced')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all text-center leading-tight ${
                  questionMix === 'balanced'
                    ? 'bg-white text-[#24389c] shadow-sm'
                    : 'text-[#454652] hover:text-[#1a1b22]'
                }`}
              >
                Balanced
              </button>
              <button
                type="button"
                onClick={() => setQuestionMix('pyq')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all text-center leading-tight ${
                  questionMix === 'pyq'
                    ? 'bg-white text-[#24389c] shadow-sm'
                    : 'text-[#454652] hover:text-[#1a1b22]'
                }`}
              >
                {exam === 'NEET' ? '38-Yr PYQs' : '24-Yr PYQs'}
              </button>
              <button
                type="button"
                onClick={() => setQuestionMix('recent_pyq')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all text-center leading-tight ${
                  questionMix === 'recent_pyq'
                    ? 'bg-white text-[#24389c] shadow-sm'
                    : 'text-[#454652] hover:text-[#1a1b22]'
                }`}
              >
                2020–2025
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-[12px] font-bold text-[#1a1b22] uppercase tracking-wider opacity-80 mb-2">
              DIFFICULTY LEVEL
            </h2>
            <div className="grid grid-cols-4 gap-1 bg-[#f4f2fc] p-1 rounded-xl border border-[#e3e1ea]">
              {(['adaptive', 'easy', 'medium', 'hard'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2 text-[12px] font-bold capitalize rounded-lg transition-all ${
                    difficulty === lvl
                      ? 'bg-white text-[#24389c] shadow-sm'
                      : 'text-[#454652] hover:text-[#1a1b22]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Question Count & Duration Slider */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e3e1ea] shadow-sm space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[13px] font-bold text-[#1a1b22]">Number of Questions</span>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-black text-[#24389c]">
                  {questionsCount} Questions
                </span>
                <span className="text-[12px] font-bold text-[#34A853] bg-[#34A853]/10 px-2 py-0.5 rounded-full">
                  +{estimatedTotalMarks} Marks
                </span>
              </div>
            </div>

            {/* Preset quick buttons */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {currentPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuestionsPreset(preset)}
                  className={`flex-1 min-w-[70px] py-1.5 rounded-lg text-[12px] font-bold border transition-all ${
                    questionsCount === preset
                      ? 'bg-[#24389c] text-white border-[#24389c] shadow-xs'
                      : 'bg-[#f4f2fc] text-[#454652] border-[#e3e1ea] hover:border-[#24389c]'
                  }`}
                >
                  {preset === 180 ? '180 Qs (720M)' : preset === 75 ? '75 Qs (300M)' : `${preset} Qs`}
                </button>
              ))}
            </div>

            <input
              type="range"
              min="10"
              max="180"
              step="5"
              value={questionsCount}
              onChange={(e) => {
                const count = parseInt(e.target.value);
                setQuestionsCount(count);
                if (count === 180) {
                  setTimeLimitMinutes(200);
                } else if (count === 75) {
                  setTimeLimitMinutes(180);
                } else if (format === 'dpp') {
                  setTimeLimitMinutes(count);
                } else {
                  setTimeLimitMinutes(Math.round(count * 1.5));
                }
              }}
              className="w-full accent-[#24389c] h-2 bg-[#efedf6] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#6b6d7c] font-semibold mt-1">
              <span>10 Qs</span>
              <span>45 Qs</span>
              <span>75 Qs (JEE)</span>
              <span>90 Qs</span>
              <span className="font-extrabold text-[#24389c]">180 Qs (720M)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#efedf6] flex justify-between items-center">
            <div>
              <span className="text-[13px] font-bold text-[#1a1b22] block">Time Limit</span>
              <span className="text-[11px] text-[#454652]">Recommended standard examination pace</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-extrabold text-[#1a1b22]">
                {timeLimitMinutes} Mins
              </span>
              <span className="text-[11px] font-medium text-[#454652]">
                (~{((timeLimitMinutes * 60) / questionsCount).toFixed(0)}s/Q)
              </span>
            </div>
          </div>
        </section>

        {/* 6. Launch Test CTA */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#24389c] to-[#3f51b5] text-white text-[16px] font-extrabold shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">play_arrow</span>
          Start Practice Session ({questionsCount} Unique Questions • {estimatedTotalMarks} Marks)
        </button>
      </form>
    </div>
  );
};

