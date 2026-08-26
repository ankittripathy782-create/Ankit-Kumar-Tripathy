import React, { useState } from 'react';
import { TimetableSlot, DayOfWeekKey, TimetableTemplate } from '../types';
import {
  DAYS_OF_WEEK,
  TIMETABLE_SUBJECTS,
  TIMETABLE_TEMPLATES,
  formatTime24to12,
  calculateSlotDurationMinutes,
  formatDurationHuman,
  calculateTotalPlannedMinutes,
  timeStringToMinutes,
} from '../data/timetableStorage';

interface TimetableScreenProps {
  slots: TimetableSlot[];
  onAddSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  onUpdateSlot: (id: string, updated: Partial<TimetableSlot>) => void;
  onDeleteSlot: (id: string) => void;
  onApplyTemplate: (template: TimetableTemplate) => void;
  onStartStudySessionForSlot: (subject: string, topic: string) => void;
  todayStudySeconds: number;
  currentStreakDays: number;
}

export const TimetableScreen: React.FC<TimetableScreenProps> = ({
  slots,
  onAddSlot,
  onUpdateSlot,
  onDeleteSlot,
  onApplyTemplate,
  onStartStudySessionForSlot,
  todayStudySeconds,
  currentStreakDays,
}) => {
  // Current active day filter
  const currentDayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const dayKeyMap: Record<number, DayOfWeekKey> = {
    0: 'sun',
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
    6: 'sat',
  };
  const todayKey = dayKeyMap[currentDayIndex] || 'mon';

  const [selectedDay, setSelectedDay] = useState<DayOfWeekKey>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formTitle, setFormTitle] = useState<string>('');
  const [formSubject, setFormSubject] = useState<string>('Physics');
  const [formStartTime, setFormStartTime] = useState<string>('06:00');
  const [formEndTime, setFormEndTime] = useState<string>('08:00');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formDayOfWeek, setFormDayOfWeek] = useState<DayOfWeekKey>('all');
  const [formPriority, setFormPriority] = useState<'high' | 'medium' | 'low'>('high');

  // Filter and sort slots
  const filteredSlots = slots
    .filter((slot) => selectedDay === 'all' || slot.dayOfWeek === 'all' || slot.dayOfWeek === selectedDay)
    .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

  // Calculate planned vs completed statistics
  const { totalPlannedMins, totalCompletedMins, studySlotCount, completedSlotCount } =
    calculateTotalPlannedMinutes(slots, selectedDay);

  const plannedHoursStr = formatDurationHuman(totalPlannedMins);
  const completedHoursStr = formatDurationHuman(totalCompletedMins);
  const completionPercentage = totalPlannedMins > 0 ? Math.min(100, Math.round((totalCompletedMins / totalPlannedMins) * 100)) : 0;

  // Open Edit Modal with existing data
  const handleOpenEdit = (slot: TimetableSlot) => {
    setEditingSlotId(slot.id);
    setFormTitle(slot.title);
    setFormSubject(slot.subject);
    setFormStartTime(slot.startTime);
    setFormEndTime(slot.endTime);
    setFormDescription(slot.description);
    setFormDayOfWeek(slot.dayOfWeek);
    setFormPriority(slot.priority);
    setIsAddModalOpen(true);
  };

  // Open Add Modal with fresh defaults
  const handleOpenAdd = () => {
    setEditingSlotId(null);
    setFormTitle('');
    setFormSubject('Physics');
    setFormStartTime('06:00');
    setFormEndTime('08:00');
    setFormDescription('');
    setFormDayOfWeek(selectedDay === 'all' ? 'all' : selectedDay);
    setFormPriority('high');
    setIsAddModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingSlotId) {
      onUpdateSlot(editingSlotId, {
        title: formTitle.trim(),
        subject: formSubject,
        startTime: formStartTime,
        endTime: formEndTime,
        description: formDescription.trim(),
        dayOfWeek: formDayOfWeek,
        priority: formPriority,
      });
    } else {
      onAddSlot({
        title: formTitle.trim(),
        subject: formSubject,
        startTime: formStartTime,
        endTime: formEndTime,
        description: formDescription.trim(),
        dayOfWeek: formDayOfWeek,
        isCompleted: false,
        priority: formPriority,
      });
    }

    setIsAddModalOpen(false);
  };

  // Helper for quick duration presets
  const handleSetQuickDuration = (durationMinutes: number) => {
    const startMins = timeStringToMinutes(formStartTime);
    const endMins = (startMins + durationMinutes) % (24 * 60);
    const endH = Math.floor(endMins / 60).toString().padStart(2, '0');
    const endM = (endMins % 60).toString().padStart(2, '0');
    setFormEndTime(`${endH}:${endM}`);
  };

  // Subject theme helper
  const getSubjectConfig = (subjectName: string) => {
    return (
      TIMETABLE_SUBJECTS.find(
        (s) => s.name.toLowerCase() === subjectName.toLowerCase()
      ) || {
        name: subjectName,
        color: '#24389c',
        bg: '#dee0ff',
        icon: 'menu_book',
      }
    );
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 sm:px-6 pt-5 pb-32 gap-6">
      {/* Top Header & Timetable Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#24389c]/10 text-[#24389c] text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Target: 99+ Percentile Routine
            </span>
            <span className="bg-amber-400/20 text-amber-900 border border-amber-300/40 text-[11px] font-bold px-2 py-0.5 rounded-full">
              🔥 {currentStreakDays}d Streak Active
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[28px] font-black text-[#1a1b22] tracking-tight mt-1">
            Daily Study Timetable & Routine
          </h1>
          <p className="text-[14px] text-[#454652]">
            Plan exact time slots, what to study, and track syllabus tasks to hit your 4-hour daily streak.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setIsTemplatesModalOpen(true)}
            className="bg-[#efedf6] hover:bg-[#e3e1ea] text-[#24389c] text-[13px] font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">auto_stories</span>
            Templates
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="bg-[#efedf6] hover:bg-[#e3e1ea] text-[#454652] text-[13px] font-extrabold px-3 py-2 rounded-xl flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Print or View Printable Timetable"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Desk Sheet
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-[#24389c] hover:bg-[#1a2b7b] text-white text-[13px] font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Add Slot
          </button>
        </div>
      </div>

      {/* Summary Planned Hours & Progress Hub */}
      <div className="bg-gradient-to-br from-[#24389c] via-[#311b92] to-[#4a148c] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-white/80 block">
                {selectedDay === 'all' ? 'All-Days Schedule Summary' : `${DAYS_OF_WEEK.find(d => d.key === selectedDay)?.label} Overview`}
              </span>
              <h2 className="text-[20px] font-black text-white mt-0.5 flex items-center gap-2">
                Planned: <span className="text-amber-300">{plannedHoursStr}</span>
                <span className="text-[14px] text-white/70 font-normal">({studySlotCount} Study Slots)</span>
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-white/80 block">
                Completed Today
              </span>
              <span className="text-[20px] font-black text-emerald-300">
                {completedHoursStr} <span className="text-[14px] font-semibold text-white/80">({completedSlotCount}/{studySlotCount} Done)</span>
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[12px] font-bold text-white/90">
              <span>Timetable Task Completion</span>
              <span className="text-amber-200">{completionPercentage}%</span>
            </div>
            <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden p-0.5 flex">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-teal-300 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* 4-Hour Streak Rule Indicator */}
          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[12px] font-medium text-white/90 flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-300">verified</span>
              {totalPlannedMins >= 240 ? (
                <span className="text-emerald-200 font-bold">
                  ✓ Schedule meets the 4-Hour Daily Streak criteria ({plannedHoursStr} planned)!
                </span>
              ) : (
                <span className="text-amber-200">
                  ⚠️ Note: Plan at least 4 hours total to ensure your daily streak is validated.
                </span>
              )}
            </span>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="text-amber-300 hover:text-white font-bold flex items-center gap-0.5 cursor-pointer text-[12px]"
            >
              + Add Schedule Task
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Day Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {DAYS_OF_WEEK.map((d) => {
          const isSelected = selectedDay === d.key;
          const isToday = d.key === todayKey;

          return (
            <button
              key={d.key}
              type="button"
              onClick={() => setSelectedDay(d.key)}
              className={`px-3.5 py-2 rounded-2xl text-[13px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-[#24389c] text-white shadow-sm scale-[1.02]'
                  : 'bg-white text-[#454652] hover:bg-[#efedf6] border border-[#e3e1ea]'
              }`}
            >
              <span>{d.label}</span>
              {isToday && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                    isSelected ? 'bg-amber-400 text-[#1a1b22]' : 'bg-[#dee0ff] text-[#24389c]'
                  }`}
                >
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Slots Timeline Listing */}
      <div className="space-y-3.5">
        {filteredSlots.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-[#c7c5d0] text-center space-y-3">
            <div className="w-14 h-14 bg-[#dee0ff] text-[#24389c] rounded-2xl flex items-center justify-center mx-auto text-[28px]">
              📅
            </div>
            <h3 className="text-[17px] font-bold text-[#1a1b22]">No Timetable Slots for this Day</h3>
            <p className="text-[13px] text-[#454652] max-w-md mx-auto">
              Create your custom time slots and specific what-to-do instructions, or apply one of our high-yield NEET / JEE routines with one click.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsTemplatesModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#efedf6] text-[#24389c] font-extrabold text-[13px] hover:bg-[#dee0ff] transition-all cursor-pointer"
              >
                Apply Routine Template
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-xl bg-[#24389c] text-white font-extrabold text-[13px] hover:bg-[#1a2b7b] transition-all cursor-pointer"
              >
                + Create First Slot
              </button>
            </div>
          </div>
        ) : (
          filteredSlots.map((slot, index) => {
            const subjectCfg = getSubjectConfig(slot.subject);
            const durationMins = calculateSlotDurationMinutes(slot.startTime, slot.endTime);
            const durationStr = formatDurationHuman(durationMins);
            const isBreak = slot.subject.toLowerCase().includes('break') || slot.subject.toLowerCase().includes('wellness');

            return (
              <div
                key={slot.id}
                className={`group rounded-3xl p-4 sm:p-5 border transition-all shadow-xs hover:shadow-md ${
                  slot.isCompleted
                    ? 'bg-[#f4fbf5] border-emerald-300/80 opacity-90'
                    : isBreak
                    ? 'bg-[#fbf9f5] border-[#e8e0d5]'
                    : 'bg-white border-[#e3e1ea] hover:border-[#24389c]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Time badge & Subject Icon */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Completion Checkbox */}
                    <button
                      type="button"
                      onClick={() => onUpdateSlot(slot.id, { isCompleted: !slot.isCompleted })}
                      className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        slot.isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-[#c7c5d0] hover:border-[#24389c] bg-white'
                      }`}
                      title={slot.isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                    >
                      {slot.isCompleted && (
                        <span className="material-symbols-outlined text-[18px] font-black">check</span>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Top Meta Line: Time & Tags */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[13px] font-black text-[#24389c] bg-[#dee0ff]/60 px-2.5 py-0.5 rounded-lg border border-[#24389c]/20">
                          ⏰ {formatTime24to12(slot.startTime)} – {formatTime24to12(slot.endTime)}
                        </span>

                        <span className="text-[11px] font-bold text-[#454652] bg-[#efedf6] px-2 py-0.5 rounded-md">
                          ⏳ {durationStr}
                        </span>

                        <span
                          className="text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1"
                          style={{ backgroundColor: subjectCfg.bg, color: subjectCfg.color }}
                        >
                          <span className="material-symbols-outlined text-[13px]">{subjectCfg.icon}</span>
                          {slot.subject}
                        </span>

                        {slot.priority === 'high' && !slot.isCompleted && (
                          <span className="text-[10px] font-extrabold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            High Priority
                          </span>
                        )}

                        {slot.dayOfWeek !== 'all' && (
                          <span className="text-[10px] font-extrabold uppercase bg-[#f4f2fc] text-[#6f48b2] px-2 py-0.5 rounded-md">
                            {DAYS_OF_WEEK.find((d) => d.key === slot.dayOfWeek)?.short} Only
                          </span>
                        )}
                      </div>

                      {/* Slot Title */}
                      <h3
                        className={`text-[16px] sm:text-[17px] font-bold tracking-tight text-[#1a1b22] ${
                          slot.isCompleted ? 'line-through text-[#6b6d7c]' : ''
                        }`}
                      >
                        {slot.title}
                      </h3>

                      {/* Details & What to do description */}
                      {slot.description && (
                        <div className="mt-1.5 text-[13px] text-[#454652] leading-relaxed bg-[#fbf8ff] p-2.5 rounded-xl border border-[#efedf6]">
                          <strong className="text-[#1a1b22] font-semibold block text-[11px] uppercase tracking-wider mb-0.5">
                            🎯 What To Do & Target Chapters:
                          </strong>
                          <p className="whitespace-pre-line">{slot.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Timer Launch & Edit/Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!isBreak && !slot.isCompleted && (
                      <button
                        type="button"
                        onClick={() => onStartStudySessionForSlot(slot.subject, slot.title)}
                        className="bg-[#24389c] text-white hover:bg-[#1a2b7b] text-[12px] font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95"
                        title="Start active focus timer for this specific subject & task"
                      >
                        <span className="material-symbols-outlined text-[16px]">play_circle</span>
                        <span className="hidden sm:inline">Start Timer</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(slot)}
                      className="p-1.5 text-[#454652] hover:text-[#24389c] hover:bg-[#efedf6] rounded-xl transition-all cursor-pointer"
                      title="Edit slot details"
                    >
                      <span className="material-symbols-outlined text-[19px]">edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteSlot(slot.id)}
                      className="p-1.5 text-[#454652] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Delete slot"
                    >
                      <span className="material-symbols-outlined text-[19px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Routine Recommendations & Best Practices Card */}
      <div className="bg-[#f4f2fc] rounded-3xl p-5 border border-[#dee0ff] space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[22px]">💡</span>
          <h3 className="text-[16px] font-bold text-[#1a1b22]">
            Timetable Golden Rules for NEET & JEE Aspirants
          </h3>
        </div>

        <ul className="text-[13px] text-[#454652] space-y-2 leading-relaxed pl-1">
          <li className="flex items-start gap-2">
            <span className="text-[#24389c] font-black">•</span>
            <span><strong>High Energy First:</strong> Tackle tough numerical subjects (Physics / Maths) early morning when cognitive load is lightest.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#24389c] font-black">•</span>
            <span><strong>Target the 4-Hour Daily Threshold:</strong> Consistency over marathon burning out. Securing 4 hours every day protects your active streak.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#24389c] font-black">•</span>
            <span><strong>Daily 30-min Mistake Review:</strong> Always schedule an evening slot to review questions you got wrong earlier in the day.</span>
          </li>
        </ul>
      </div>

      {/* ADD / EDIT SLOT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e3e1ea] space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e1ea]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#dee0ff] text-[#24389c] flex items-center justify-center font-bold">
                  ⏰
                </div>
                <div>
                  <h2 className="text-[18px] font-black text-[#1a1b22]">
                    {editingSlotId ? 'Edit Timetable Slot' : 'Add New Timetable Slot'}
                  </h2>
                  <p className="text-[12px] text-[#454652]">
                    Specify time, subject, and exact what-to-do instructions
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#efedf6] text-[#454652] hover:bg-[#dee0ff] flex items-center justify-center font-bold text-[18px] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Slot Title */}
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-[#454652] block mb-1">
                  Task / Slot Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Kinematics & Mechanics PYQ Drill"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c7c5d0] focus:border-[#24389c] focus:outline-none text-[14px] font-semibold text-[#1a1b22]"
                />
              </div>

              {/* Subject Selection */}
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-[#454652] block mb-1.5">
                  Subject Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 border border-[#e3e1ea] rounded-2xl bg-[#fbf8ff]">
                  {TIMETABLE_SUBJECTS.map((s) => {
                    const isSelected = formSubject === s.name;
                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => setFormSubject(s.name)}
                        className={`px-2.5 py-1.5 rounded-xl text-[12px] font-bold text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#24389c] text-white shadow-xs'
                            : 'bg-white text-[#1a1b22] hover:bg-[#efedf6] border border-[#e3e1ea]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">{s.icon}</span>
                        <span className="truncate">{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Configuration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-bold uppercase tracking-wider text-[#454652] block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#c7c5d0] focus:border-[#24389c] focus:outline-none text-[14px] font-bold font-mono text-[#1a1b22]"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-bold uppercase tracking-wider text-[#454652] block mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#c7c5d0] focus:border-[#24389c] focus:outline-none text-[14px] font-bold font-mono text-[#1a1b22]"
                  />
                </div>
              </div>

              {/* Quick Duration Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-[#454652]">Quick Duration:</span>
                {[30, 45, 60, 90, 120, 180, 240].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSetQuickDuration(mins)}
                    className="px-2 py-0.5 rounded-lg bg-[#efedf6] hover:bg-[#dee0ff] text-[#24389c] text-[11px] font-extrabold cursor-pointer transition-all"
                  >
                    +{mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                  </button>
                ))}
              </div>

              {/* Day of Week */}
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-[#454652] block mb-1.5">
                  Assigned Day(s)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {DAYS_OF_WEEK.map((d) => {
                    const isSelected = formDayOfWeek === d.key;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setFormDayOfWeek(d.key)}
                        className={`py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#24389c] text-white shadow-xs'
                            : 'bg-[#efedf6] text-[#454652] hover:bg-[#e3e1ea]'
                        }`}
                      >
                        {d.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* What to do & Detailed Instructions */}
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-[#454652] block mb-1">
                  What to do & Target Goals (Details)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Solve 35 questions from 2020-2024 papers, mark errors in notebook, revise formula sheet for Rotational Motion."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c7c5d0] focus:border-[#24389c] focus:outline-none text-[13px] text-[#1a1b22] leading-relaxed"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-[#454652] block mb-1.5">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'high', label: '🔴 High Priority' },
                    { key: 'medium', label: '🟡 Medium' },
                    { key: 'low', label: '🟢 Low / Relaxed' },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setFormPriority(p.key as any)}
                      className={`py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                        formPriority === p.key
                          ? 'bg-[#24389c] text-white shadow-xs'
                          : 'bg-[#efedf6] text-[#454652] hover:bg-[#e3e1ea]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#e3e1ea]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#efedf6] text-[#454652] font-extrabold text-[13px] hover:bg-[#e3e1ea] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#24389c] text-white font-extrabold text-[13px] hover:bg-[#1a2b7b] transition-all cursor-pointer shadow-sm"
                >
                  {editingSlotId ? 'Save Changes' : 'Add to Timetable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMPLATES PICKER MODAL */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#e3e1ea] space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e1ea]">
              <div>
                <h2 className="text-[19px] font-black text-[#1a1b22]">
                  High-Yield Timetable Templates
                </h2>
                <p className="text-[13px] text-[#454652]">
                  Apply proven study routines designed for NEET 700+ and JEE 99+ Percentile
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplatesModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#efedf6] text-[#454652] hover:bg-[#dee0ff] flex items-center justify-center font-bold text-[18px] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {TIMETABLE_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-[#fbf8ff] rounded-2xl p-4 sm:p-5 border border-[#dee0ff] space-y-3 hover:border-[#24389c] transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#24389c] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          {tpl.targetExam}
                        </span>
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ⏱️ {tpl.totalPlannedHours} Study
                        </span>
                      </div>
                      <h3 className="text-[16px] font-bold text-[#1a1b22]">{tpl.name}</h3>
                      <p className="text-[12px] text-[#454652] mt-0.5">{tpl.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onApplyTemplate(tpl);
                        setIsTemplatesModalOpen(false);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#24389c] hover:bg-[#1a2b7b] text-white text-[12px] font-black transition-all shrink-0 cursor-pointer shadow-xs"
                    >
                      Apply Template
                    </button>
                  </div>

                  {/* Preview slot list */}
                  <div className="pt-2 border-t border-[#dee0ff] space-y-1.5">
                    {tpl.slots.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[12px] text-[#454652]">
                        <span className="font-mono font-bold text-[#24389c]">
                          {formatTime24to12(s.startTime)} - {formatTime24to12(s.endTime)}
                        </span>
                        <span className="font-semibold text-[#1a1b22] truncate max-w-[240px]">
                          {s.title}
                        </span>
                        <span className="text-[11px] bg-[#efedf6] px-2 py-0.5 rounded-md font-bold">
                          {s.subject}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRINT / DESK SHEET MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#e3e1ea] space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e1ea]">
              <div>
                <h2 className="text-[19px] font-black text-[#1a1b22]">
                  Printable Timetable Desk Sheet
                </h2>
                <p className="text-[13px] text-[#454652]">
                  Formatted schedule card ready to print or pin on your study wall
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#24389c] text-white text-[12px] font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#efedf6] text-[#454652] hover:bg-[#dee0ff] flex items-center justify-center font-bold text-[18px] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Container */}
            <div className="p-6 bg-[#fbf8ff] rounded-2xl border border-[#dee0ff] space-y-4">
              <div className="flex items-center justify-between border-b border-[#dee0ff] pb-4">
                <div>
                  <h3 className="text-[20px] font-black text-[#1a1b22]">
                    Ankit Tripathy — Daily Mission Timetable
                  </h3>
                  <p className="text-[12px] text-[#454652]">
                    Target: NEET 720 / JEE 300 Mastery • Min 4-Hour Day Streak Rule
                  </p>
                </div>
                <div className="text-right font-mono font-bold text-[12px] text-[#24389c]">
                  Planned: {plannedHoursStr} Focus
                </div>
              </div>

              <div className="divide-y divide-[#e3e1ea]">
                {filteredSlots.map((s, idx) => (
                  <div key={idx} className="py-3 flex items-start justify-between gap-4">
                    <div className="w-36 shrink-0 font-mono text-[13px] font-bold text-[#24389c]">
                      {formatTime24to12(s.startTime)} – {formatTime24to12(s.endTime)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-[#1a1b22]">{s.title}</span>
                        <span className="text-[11px] font-bold bg-[#dee0ff] text-[#24389c] px-2 py-0.5 rounded">
                          {s.subject}
                        </span>
                      </div>
                      {s.description && (
                        <p className="text-[12px] text-[#454652] mt-0.5 leading-snug">{s.description}</p>
                      )}
                    </div>
                    <div className="w-6 h-6 border-2 border-gray-400 rounded shrink-0" />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#dee0ff] flex items-center justify-between text-[11px] text-[#6b6d7c]">
                <span>PrepPulse Daily Timetable Planner</span>
                <span>Consistency is the Ultimate Competitive Advantage</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
