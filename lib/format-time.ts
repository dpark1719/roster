import { isToday, isTomorrow, differenceInCalendarDays, format } from "date-fns";

export function formatPlanTime(startsAt: Date, now: Date = new Date()): string {
  const time = format(startsAt, "h:mm a");

  if (isToday(startsAt)) {
    const isEvening = startsAt.getHours() >= 17;
    return `${isEvening ? "Tonight" : "Today"}, ${time}`;
  }

  if (isTomorrow(startsAt)) {
    return `Tomorrow, ${time}`;
  }

  const daysAway = differenceInCalendarDays(startsAt, now);

  if (daysAway > 0 && daysAway < 7) {
    return `${format(startsAt, "EEEE")}, ${time}`;
  }

  return `${format(startsAt, "EEEE, MMM d")}, ${time}`;
}
