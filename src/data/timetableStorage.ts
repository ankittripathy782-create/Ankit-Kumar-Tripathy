import { TimetableSlot, TimetableTemplate, DayOfWeekKey } from '../types';

const TIMETABLE_STORAGE_KEY = 'preppulse_timetable_slots_v1';

export const DAYS_OF_WEEK: { key: DayOfWeekKey; label: string; short: string }[] = [
  { key: 'all', label: 'All Days', short: 'All' },
  { key: 'mon', label: 'Monday', short: 'Mon' },
  { key: 'tue', label: 'Tuesday', short: 'Tue' },
  { key: 'wed', label: 'Wednesday', short: 'Wed' },
  { key: 'thu', label: 'Thursday', short: 'Thu' },
  { key: 'fri', label: 'Friday', short: 'Fri' },
  { key: 'sat', label: 'Saturday', short: 'Sat' },
  { key: 'sun', label: 'Sunday', short: 'Sun' },
];

export const TIMETABLE_SUBJECTS = [
  { name: 'Physics', color: '#24389c', bg: '#dee0ff', icon: 'bolt' },
  { name: 'Physical Chemistry', color: '#0061a4', bg: '#d1e4ff', icon: 'science' },
  { name: 'Inorganic Chemistry', color: '#6f48b2', bg: '#ebd2ff', icon: 'biotech' },
  { name: 'Organic Chemistry', color: '#9c4146', bg: '#ffd9dc', icon: 'experiment' },
  { name: 'Botany', color: '#1b873f', bg: '#c8f5d0', icon: 'psychiatry' },
  { name: 'Zoology', color: '#006874', bg: '#97f0ff', icon: 'pets' },
  { name: 'Mathematics', color: '#b3261e', bg: '#f9dedc', icon: 'functions' },
  { name: 'Full Mock Test', color: '#311b92', bg: '#ede7f6', icon: 'quiz' },
  { name: 'Formula & Mistake Revision', color: '#e65100', bg: '#ffe0b2', icon: 'edit_note' },
  { name: 'Break / Wellness', color: '#454652', bg: '#efedf6', icon: 'coffee' },
];

export const DEFAULT_TIMETABLE_SLOTS: TimetableSlot[] = [
  {
    id: 'slot-1',
    startTime: '06:00',
    endTime: '08:00',
    title: 'High-Yield Physics Numerical Problem Drill',
    subject: 'Physics',
    description: 'Solve 35 PYQs from Kinematics, Rotational Motion & Electrostatics. Mark error notebook.',
    dayOfWeek: 'all',
    isCompleted: true,
    priority: 'high',
  },
  {
    id: 'slot-2',
    startTime: '08:15',
    endTime: '09:00',
    title: 'Breakfast & Active Mind Reset',
    subject: 'Break / Wellness',
    description: 'Healthy breakfast, hydrate, brief 10-minute walk before heavy chemistry session.',
    dayOfWeek: 'all',
    isCompleted: true,
    priority: 'low',
  },
  {
    id: 'slot-3',
    startTime: '09:00',
    endTime: '11:00',
    title: 'Organic Mechanisms & Reagent Reactions Drill',
    subject: 'Organic Chemistry',
    description: 'Revise Aldehydes, Ketones, Carboxylic Acids & Amines named reactions + NCERT conversions.',
    dayOfWeek: 'all',
    isCompleted: false,
    priority: 'high',
  },
  {
    id: 'slot-4',
    startTime: '11:30',
    endTime: '01:30',
    title: 'Biology NCERT Line-by-Line & Diagram Mastery',
    subject: 'Botany',
    description: 'Genetics, Molecular Basis of Inheritance & Plant Physiology NCERT line readings + Exemplar.',
    dayOfWeek: 'all',
    isCompleted: false,
    priority: 'high',
  },
  {
    id: 'slot-5',
    startTime: '03:30',
    endTime: '05:30',
    title: 'Speed Mock Test & Timed Question Practice',
    subject: 'Full Mock Test',
    description: 'Solve 45-question timed DPP at 45 seconds per question under strict exam conditions.',
    dayOfWeek: 'all',
    isCompleted: false,
    priority: 'medium',
  },
  {
    id: 'slot-6',
    startTime: '07:00',
    endTime: '08:30',
    title: 'Inorganic NCERT Line Memorization & Tables',
    subject: 'Inorganic Chemistry',
    description: 'Coordination Compounds, d & f block elements, and Chemical Bonding trend flashcards.',
    dayOfWeek: 'all',
    isCompleted: false,
    priority: 'medium',
  },
  {
    id: 'slot-7',
    startTime: '09:30',
    endTime: '10:30',
    title: 'Daily Error Analysis & Formula Revision',
    subject: 'Formula & Mistake Revision',
    description: 'Log any mistakes from today into the Mistake Notebook and review Physics formula sheets.',
    dayOfWeek: 'all',
    isCompleted: false,
    priority: 'high',
  },
];

export const TIMETABLE_TEMPLATES: TimetableTemplate[] = [
  {
    id: 'tpl-neet-topper',
    name: 'NEET 700+ Golden Routine (6.5 Hours Focus)',
    targetExam: 'NEET',
    description: 'Optimized for high-yield 3-subject balanced rotation with NCERT emphasis and timed speed drills.',
    totalPlannedHours: '6h 30m',
    slots: [
      {
        startTime: '06:00',
        endTime: '08:00',
        title: 'Physics Concept & Numerical Practice',
        subject: 'Physics',
        description: 'Focus on Rotational Motion, Optics, and Current Electricity numericals.',
        dayOfWeek: 'all',
        priority: 'high',
      },
      {
        startTime: '09:00',
        endTime: '11:00',
        title: 'Organic & Physical Chemistry Problem Solving',
        subject: 'Organic Chemistry',
        description: 'Thermodynamics, Equilibrium numericals & Hydrocarbon mechanisms.',
        dayOfWeek: 'all',
        priority: 'high',
      },
      {
        startTime: '11:30',
        endTime: '01:00',
        title: 'NCERT Biology High-Speed Memory Drill',
        subject: 'Botany',
        description: 'Line-by-line reading of NCERT Ecology, Genetics, and Human Physiology.',
        dayOfWeek: 'all',
        priority: 'high',
      },
      {
        startTime: '04:00',
        endTime: '05:30',
        title: 'Timed 45-Question DPP Practice',
        subject: 'Full Mock Test',
        description: 'Speed test targeting 40s per question with immediate error analysis.',
        dayOfWeek: 'all',
        priority: 'medium',
      },
      {
        startTime: '08:30',
        endTime: '09:30',
        title: 'Inorganic Tables & Flashcard Recall',
        subject: 'Inorganic Chemistry',
        description: 'Revise Periodic Trends, Coordination Isomerism, and Metallurgy NCERT points.',
        dayOfWeek: 'all',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'tpl-jee-ranker',
    name: 'JEE 99.5+ Percentile Problem Cruncher (6.0 Hours Focus)',
    targetExam: 'JEE',
    description: 'Multi-concept advanced questions across Mechanics, Calculus, and Physical Chemistry.',
    totalPlannedHours: '6h 00m',
    slots: [
      {
        startTime: '06:00',
        endTime: '08:00',
        title: 'JEE Mathematics Advanced Calculus & Algebra',
        subject: 'Mathematics',
        description: 'Integration, Differential Equations & Matrices challenging PYQs.',
        dayOfWeek: 'all',
        priority: 'high',
      },
      {
        startTime: '09:00',
        endTime: '11:00',
        title: 'Physics Multi-Concept Problems',
        subject: 'Physics',
        description: 'Electromagnetism, Modern Physics & Center of Mass tricky numericals.',
        dayOfWeek: 'all',
        priority: 'high',
      },
      {
        startTime: '03:00',
        endTime: '04:30',
        title: 'Physical & Organic Chemistry PYQ Sprint',
        subject: 'Physical Chemistry',
        description: 'Electrochemistry, Chemical Kinetics & Reaction Kinetics.',
        dayOfWeek: 'all',
        priority: 'high',
      },
      {
        startTime: '07:30',
        endTime: '08:30',
        title: 'Formula Vault & Mistake Notebook Revision',
        subject: 'Formula & Mistake Revision',
        description: 'Deep dive into previously incorrect questions and shortcut techniques.',
        dayOfWeek: 'all',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'tpl-school-selfstudy',
    name: 'School / Coaching + Evening Deep Study (4.5 Hours)',
    targetExam: 'All',
    description: 'Tailored for students attending regular classes who need focused, high-intensity evening study.',
    totalPlannedHours: '4h 30m',
    slots: [
      {
        startTime: '05:30',
        endTime: '07:00',
        title: 'Morning High-Retention Revision',
        subject: 'Formula & Mistake Revision',
        description: 'Quick formula review, Organic name reactions, and Biology NCERT diagrams.',
        dayOfWeek: 'all',
        priority: 'high',
      },
      {
        startTime: '05:00',
        endTime: '07:00',
        title: 'Evening Problem-Solving Block',
        subject: 'Physics',
        description: 'Solving coaching homework and 30 curated chapter PYQs.',
        dayOfWeek: 'all',
        priority: 'high',
      },
      {
        startTime: '08:30',
        endTime: '10:00',
        title: 'Night Chemistry & Bio Mastery',
        subject: 'Inorganic Chemistry',
        description: 'NCERT line reading + 25 questions daily target.',
        dayOfWeek: 'all',
        priority: 'medium',
      },
    ],
  },
];

export function loadTimetableSlots(): TimetableSlot[] {
  try {
    const raw = localStorage.getItem(TIMETABLE_STORAGE_KEY);
    if (!raw) return DEFAULT_TIMETABLE_SLOTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load timetable slots from localStorage', err);
  }
  return DEFAULT_TIMETABLE_SLOTS;
}

export function saveTimetableSlots(slots: TimetableSlot[]): void {
  try {
    localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(slots));
  } catch (err) {
    console.error('Failed to save timetable slots to localStorage', err);
  }
}

// Convert "HH:MM" (24h) to total minutes from midnight for sorting and calculations
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim();
  const parts = cleaned.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10) || 0;
    const mins = parseInt(parts[1].slice(0, 2), 10) || 0;
    return hours * 60 + mins;
  }
  return 0;
}

export function formatMinutesToTimeDisplay(totalMinutes: number): string {
  const mins = Math.max(0, totalMinutes);
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 === 0 ? 12 : h % 12;
  const displayMins = m.toString().padStart(2, '0');
  return `${displayHours}:${displayMins} ${period}`;
}

export function formatTime24to12(time24: string): string {
  if (!time24) return '';
  const mins = timeStringToMinutes(time24);
  return formatMinutesToTimeDisplay(mins);
}

export function calculateSlotDurationMinutes(startTime: string, endTime: string): number {
  const startMins = timeStringToMinutes(startTime);
  let endMins = timeStringToMinutes(endTime);
  if (endMins < startMins) {
    // overnight slot
    endMins += 24 * 60;
  }
  return Math.max(0, endMins - startMins);
}

export function formatDurationHuman(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function calculateTotalPlannedMinutes(slots: TimetableSlot[], day: DayOfWeekKey): {
  totalPlannedMins: number;
  totalCompletedMins: number;
  studySlotCount: number;
  completedSlotCount: number;
} {
  const relevantSlots = slots.filter(
    (s) => day === 'all' || s.dayOfWeek === 'all' || s.dayOfWeek === day
  );

  let totalPlannedMins = 0;
  let totalCompletedMins = 0;
  let studySlotCount = 0;
  let completedSlotCount = 0;

  for (const s of relevantSlots) {
    const isBreak = s.subject.toLowerCase().includes('break') || s.subject.toLowerCase().includes('wellness');
    const dur = calculateSlotDurationMinutes(s.startTime, s.endTime);
    
    if (!isBreak) {
      totalPlannedMins += dur;
      studySlotCount += 1;
      if (s.isCompleted) {
        totalCompletedMins += dur;
        completedSlotCount += 1;
      }
    }
  }

  return {
    totalPlannedMins,
    totalCompletedMins,
    studySlotCount,
    completedSlotCount,
  };
}
