export function dateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

  const todayKey = dateKey(today);

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
