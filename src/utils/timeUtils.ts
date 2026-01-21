export interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface WorkRecord {
  id: string;
  date: string;
  mode: 'range' | 'duration';
  startTime?: string;
  endTime?: string;
  breakMinutes: string;
  hoursInput?: string;
  minutesInput?: string;
  totalHoursDecimal: number;
  rate: number;
  totalWage: number;
}

export interface FinanceRecord {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  note: string;
}

export interface JournalTask {
  id: string;
  text: string;
  completed: boolean;
  category: 'work' | 'personal' | 'urgent';
  createdAt: string;
  scheduledTime: string; // New field for planned time
}

export interface UserProfile {
  employeeName: string;
  employeeRole: string;
  employeeId: string;
  companyName: string;
  companyAddress: string;
  defaultRate: string;
  monthlyTarget?: string;
}

export const DEFAULT_PROFILE: UserProfile = {
  employeeName: 'Mohammad Alfarizi Abdullah',
  employeeRole: 'Staff Ops',
  employeeId: 'TM-001',
  companyName: 'TimeMaster Corp.',
  companyAddress: 'Malang, Jawa Timur',
  defaultRate: '10000',
  monthlyTarget: '0'
};

/**
 * Generates a random Employee ID with format TM-YY-XXXXX
 */
export const generateEmployeeId = (): string => {
  const prefix = "TM"; 
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const randomBlock = Math.random().toString(36).substring(2, 7).toUpperCase(); 
  return `${prefix}-${year}-${randomBlock}`; 
};

/**
 * Converts hours, minutes, seconds to total seconds.
 */
export const toTotalSeconds = (h: number, m: number, s: number): number => {
  return h * 3600 + m * 60 + s;
};

/**
 * Converts total seconds back to formatted parts (H, M, S).
 */
export const fromTotalSeconds = (totalSeconds: number): TimeParts => {
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return { hours, minutes, seconds };
};

/**
 * Formats a currency number to IDR string.
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculates duration between two HH:MM strings.
 * Returns result in hours (decimal).
 * Handles overnight if end time is smaller than start time by adding 24h.
 */
export const calculateDurationInHours = (start: string, end: string): number => {
  if (!start || !end) return 0;

  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  let startTotalMinutes = startH * 60 + startM;
  let endTotalMinutes = endH * 60 + endM;

  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60; // Assume next day
  }

  const diffMinutes = endTotalMinutes - startTotalMinutes;
  return diffMinutes / 60;
};