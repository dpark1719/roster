import { toZonedTime } from "date-fns-tz";

const TIME_ZONE = "America/Chicago";

// For a plain calendar date (e.g. a grid cell built from year/month/day) — no TZ conversion.
export function dateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// For a real instant (e.g. plan.startsAt or "now") — resolves which Madison-local day it falls on.
export function zonedDateKey(instant: Date): string {
  return dateKey(toZonedTime(instant, TIME_ZONE));
}

export interface CalendarDay {
  date: Date;
  key: string;
  inCurrentMonth: boolean;
  isToday: boolean;
}

export function buildMonthGrid(year: number, month: number, today: Date): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = Sunday
  const gridStart = new Date(year, month, 1 - startOffset);

  const todayKey = zonedDateKey(today);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return {
      date,
      key: dateKey(date),
      inCurrentMonth: date.getMonth() === month,
      isToday: dateKey(date) === todayKey,
    };
  });
}

export function intensityOpacity(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 0.25;
  if (count === 2) return 0.55;
  return 0.9;
}
