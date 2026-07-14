// IST = UTC+5:30 = Asia/Kolkata
// All date logic in the app uses this module.
// Vercel Cron runs at 18:30 UTC = 00:00 IST.

const TIMEZONE = "Asia/Kolkata";

/**
 * Returns "YYYY-MM-DD" for the current date in IST.
 */
export function todayIST(): string {
  return toISTDateString(new Date());
}

/**
 * Returns "YYYY-MM-DD" for a given Date in IST.
 */
export function toISTDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Returns the ISO weekday number (0=Sun,1=Mon,...,6=Sat) for today in IST.
 */
export function weekdayIST(date?: Date): number {
  const d = date ?? new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
  }).format(d);
  const map: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return map[parts] ?? 0;
}

/**
 * Returns "YYYY-MM-DD" for the Monday of the current ISO week in IST.
 */
export function startOfWeekIST(date?: Date): string {
  const d = date ?? new Date();
  const dayOfWeek = weekdayIST(d); // 0=Sun..6=Sat
  // Shift so Monday=0
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(d);
  monday.setUTCHours(0, 0, 0, 0);
  monday.setUTCDate(d.getUTCDate() - daysFromMonday);
  return toISTDateString(monday);
}

/**
 * Returns the full Date object at midnight IST for a given YYYY-MM-DD string.
 */
export function istDateToUTC(dateIST: string): Date {
  // YYYY-MM-DD in IST → parse as if it's a local midnight in IST
  const [year, month, day] = dateIST.split("-").map(Number);
  // IST is UTC+5:30, so midnight IST = (day-1)T18:30 UTC
  return new Date(Date.UTC(year, month - 1, day, 18, 30, 0) - 24 * 60 * 60 * 1000);
  // Simpler: just return a UTC date adjusted for display; for comparisons use string form
}

/**
 * Returns a human-readable time label in IST (e.g. "09:00 AM").
 */
export function formatTimeIST(timeHHMM: string): string {
  const [h, m] = timeHHMM.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/**
 * Returns true if dateISTString is today in IST.
 */
export function isToday(dateIST: string): boolean {
  return dateIST === todayIST();
}

/**
 * Returns the month label for today in IST (e.g. "July 2026").
 */
export function currentMonthLabelIST(): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TIMEZONE,
    month: "long",
    year: "numeric",
  }).format(new Date());
}

/**
 * Returns the first and last day (YYYY-MM-DD) of the current calendar month in IST.
 */
export function currentMonthRangeIST(): { start: string; end: string } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).format(now);
  const [year, month] = parts.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start: `${year}-${String(month).padStart(2, "0")}-01`,
    end: `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}
