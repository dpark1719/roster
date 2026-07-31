import { differenceInCalendarDays, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIME_ZONE = "America/Chicago";

export function formatPlanTime(startsAt: Date, now: Date = new Date()): string {
  const zoned = toZonedTime(startsAt, TIME_ZONE);
  const zonedNow = toZonedTime(now, TIME_ZONE);
  const time = format(zoned, "h:mm a");

  if (sameDay(zoned, zonedNow)) {
    const isEvening = zoned.getHours() >= 17;
    return `${isEvening ? "Tonight" : "Today"}, ${time}`;
  }

  if (isTomorrowOf(zoned, zonedNow)) {
    return `Tomorrow, ${time}`;
  }

  const daysAway = differenceInCalendarDays(zoned, zonedNow);

  if (daysAway > 0 && daysAway < 7) {
    return `${format(zoned, "EEEE")}, ${time}`;
  }

  return `${format(zoned, "EEEE, MMM d")}, ${time}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isTomorrowOf(date: Date, now: Date): boolean {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return sameDay(date, tomorrow);
}
