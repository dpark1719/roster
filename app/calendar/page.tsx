import Link from "next/link";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getCalendarPlans } from "@/lib/queries/plans";
import { buildMonthGrid, dateKey, zonedDateKey, intensityOpacity } from "@/lib/calendar";
import { formatPlanTime } from "@/lib/format-time";
import { PublicNav } from "@/lib/public-nav";
import { ClockIcon, PinIcon } from "@/lib/icons";

const TIME_ZONE = "America/Chicago";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const today = new Date();
  const zonedToday = toZonedTime(today, TIME_ZONE);

  let year = zonedToday.getFullYear();
  let month = zonedToday.getMonth();
  if (monthParam) {
    const [y, m] = monthParam.split("-").map(Number);
    if (y && m) {
      year = y;
      month = m - 1;
    }
  }

  const plans = await getCalendarPlans();
  const grid = buildMonthGrid(year, month, today);

  const plansByDay = new Map<string, typeof plans>();
  for (const plan of plans) {
    const key = zonedDateKey(new Date(plan.startsAt));
    if (!plansByDay.has(key)) plansByDay.set(key, []);
    plansByDay.get(key)!.push(plan);
  }

  const prevMonth = month === 0 ? { y: year - 1, m: 12 } : { y: year, m: month };
  const nextMonth = month === 11 ? { y: year + 1, m: 1 } : { y: year, m: month + 2 };

  const visibleDayKeys = new Set(grid.map((d) => d.key));
  const upcomingInMonth = plans
    .filter((p) => visibleDayKeys.has(zonedDateKey(new Date(p.startsAt))))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <PublicNav active="calendar" />

      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {MONTH_NAMES[month]} {year}
          </h1>
          <div className="flex gap-2">
            <Link
              href={`/calendar?month=${prevMonth.y}-${String(prevMonth.m).padStart(2, "0")}`}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)]"
            >
              ← Prev
            </Link>
            <Link
              href={`/calendar?month=${nextMonth.y}-${String(nextMonth.m).padStart(2, "0")}`}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)]"
            >
              Next →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted-2)]">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.map((day) => {
            const dayPlans = plansByDay.get(day.key) ?? [];
            const opacity = intensityOpacity(dayPlans.length);
            return (
              <a
                key={day.key}
                href={dayPlans.length > 0 ? `#${day.key}` : undefined}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-[var(--radius-sm)] text-sm ${
                  day.inCurrentMonth ? "text-[var(--foreground)]" : "text-[var(--muted-2)]"
                } ${day.isToday ? "ring-2 ring-[var(--accent)]" : ""}`}
              >
                <div
                  className="absolute inset-0 rounded-[var(--radius-sm)]"
                  style={{ background: "var(--accent)", opacity }}
                />
                <span className="relative font-medium">{day.date.getDate()}</span>
                {dayPlans.length > 0 && (
                  <span className="relative text-[10px] font-semibold">
                    {dayPlans.length}
                  </span>
                )}
              </a>
            );
          })}
        </div>

        <div className="mt-10 space-y-6">
          {upcomingInMonth.length === 0 ? (
            <p className="text-sm text-[var(--muted-2)]">No plans this month.</p>
          ) : (
            Object.entries(
              upcomingInMonth.reduce<Record<string, typeof plans>>((acc, plan) => {
                const key = zonedDateKey(new Date(plan.startsAt));
                (acc[key] ??= []).push(plan);
                return acc;
              }, {})
            ).map(([key, dayPlans]) => (
              <div key={key} id={key} className="scroll-mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-2)]">
                  {format(
                    toZonedTime(new Date(dayPlans[0].startsAt), TIME_ZONE),
                    "EEEE, MMMM d"
                  )}
                </p>
                <div className="space-y-2">
                  {dayPlans.map((plan) => (
                    <Link
                      key={plan.id}
                      href={`/p/${plan.slug}`}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--foreground)]">
                          {plan.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-[var(--muted)]">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {formatPlanTime(new Date(plan.startsAt))}
                          </span>
                          <span className="flex items-center gap-1">
                            <PinIcon className="h-3 w-3" />
                            {plan.locationName}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
