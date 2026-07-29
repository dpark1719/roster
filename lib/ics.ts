function toIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export function generateIcs(plan: {
  slug: string;
  title: string;
  startsAt: Date;
  endsAt: Date | null;
  locationName: string;
  description: string | null;
}): string {
  const end = plan.endsAt ?? new Date(plan.startsAt.getTime() + 60 * 60 * 1000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//roster//plan//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${plan.slug}@roster`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(plan.startsAt)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(plan.title)}`,
    `LOCATION:${escapeIcsText(plan.locationName)}`,
  ];

  if (plan.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(plan.description)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}
