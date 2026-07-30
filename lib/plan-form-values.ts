export interface PlanFormValues {
  title: string;
  startsAt: string; // datetime-local value
  endsAt: string;
  locationName: string;
  locationNote: string;
  description: string;
  hostName: string;
  category: string;
  minNeeded: string;
  capacity: string;
  externalUrl: string;
  isPublished: boolean;
}

function defaultStartsAt(): string {
  const d = new Date();
  d.setHours(19, 0, 0, 0);
  if (d < new Date()) {
    d.setDate(d.getDate() + 1);
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function emptyPlanForm(lastLocation = "", lastHost = ""): PlanFormValues {
  return {
    title: "",
    startsAt: defaultStartsAt(),
    endsAt: "",
    locationName: lastLocation,
    locationNote: "",
    description: "",
    hostName: lastHost,
    category: "",
    minNeeded: "",
    capacity: "",
    externalUrl: "",
    isPublished: true,
  };
}

export function planToFormValues(plan: {
  title: string;
  startsAt: string;
  endsAt: string | null;
  locationName: string;
  locationNote: string | null;
  description: string | null;
  hostName: string;
  category: string | null;
  minNeeded: number | null;
  capacity: number | null;
  externalUrl: string | null;
  isPublished: boolean;
}): PlanFormValues {
  return {
    title: plan.title,
    startsAt: toDatetimeLocal(plan.startsAt),
    endsAt: toDatetimeLocal(plan.endsAt),
    locationName: plan.locationName,
    locationNote: plan.locationNote ?? "",
    description: plan.description ?? "",
    hostName: plan.hostName,
    category: plan.category ?? "",
    minNeeded: plan.minNeeded != null ? String(plan.minNeeded) : "",
    capacity: plan.capacity != null ? String(plan.capacity) : "",
    externalUrl: plan.externalUrl ?? "",
    isPublished: plan.isPublished,
  };
}
