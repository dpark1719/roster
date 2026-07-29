"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

const LAST_LOCATION_KEY = "roster:last-location";
const LAST_HOST_KEY = "roster:last-host";

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

export function emptyPlanForm(): PlanFormValues {
  const lastLocation =
    typeof window !== "undefined" ? localStorage.getItem(LAST_LOCATION_KEY) ?? "" : "";
  const lastHost =
    typeof window !== "undefined" ? localStorage.getItem(LAST_HOST_KEY) ?? "" : "";

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

export function PlanForm({
  initial,
  planId,
  slug,
}: {
  initial?: PlanFormValues;
  planId?: string;
  slug?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<PlanFormValues>(initial ?? emptyPlanForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initial) {
      setValues(emptyPlanForm());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof PlanFormValues>(key: K, value: PlanFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    localStorage.setItem(LAST_LOCATION_KEY, values.locationName);
    localStorage.setItem(LAST_HOST_KEY, values.hostName);

    const payload = {
      title: values.title,
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : null,
      locationName: values.locationName,
      locationNote: values.locationNote || null,
      description: values.description || null,
      hostName: values.hostName,
      category: values.category || null,
      minNeeded: values.minNeeded || null,
      capacity: values.capacity || null,
      externalUrl: values.externalUrl || null,
      isPublished: values.isPublished,
    };

    const url = planId ? `/api/admin/plans/${planId}` : "/api/admin/plans";
    const method = planId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to save plan.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {slug && (
        <div className="rounded-md bg-neutral-100 px-3 py-2 text-sm">
          Public link:{" "}
          <a
            href={`/p/${slug}`}
            target="_blank"
            className="font-medium text-blue-600 underline"
          >
            /p/{slug}
          </a>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          autoFocus
          required
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Trivia at the Sett"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Starts</label>
          <input
            type="datetime-local"
            required
            value={values.startsAt}
            onChange={(e) => update("startsAt", e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Ends (optional)</label>
          <input
            type="datetime-local"
            value={values.endsAt}
            onChange={(e) => update("endsAt", e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Location name</label>
        <input
          required
          value={values.locationName}
          onChange={(e) => update("locationName", e.target.value)}
          placeholder="Union South, The Sett"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Location note (optional)</label>
        <input
          value={values.locationNote}
          onChange={(e) => update("locationNote", e.target.value)}
          placeholder="2nd floor, look for the tall table"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description (optional)</label>
        <textarea
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Host name</label>
          <input
            required
            value={values.hostName}
            onChange={(e) => update("hostName", e.target.value)}
            placeholder="Maya"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Category (optional)</label>
          <input
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            placeholder="trivia, IM, run club..."
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Min needed (optional)</label>
          <input
            type="number"
            min={1}
            value={values.minNeeded}
            onChange={(e) => update("minNeeded", e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Capacity (optional)</label>
          <input
            type="number"
            min={1}
            value={values.capacity}
            onChange={(e) => update("capacity", e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">External link (optional)</label>
        <input
          value={values.externalUrl}
          onChange={(e) => update("externalUrl", e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.isPublished}
          onChange={(e) => update("isPublished", e.target.checked)}
        />
        Published
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : planId ? "Save changes" : "Create plan"}
      </button>
    </form>
  );
}
