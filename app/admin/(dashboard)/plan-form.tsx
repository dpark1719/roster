"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { emptyPlanForm, type PlanFormValues } from "@/lib/plan-form-values";

const LAST_LOCATION_KEY = "roster:last-location";
const LAST_HOST_KEY = "roster:last-host";

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
      setValues(
        emptyPlanForm(
          localStorage.getItem(LAST_LOCATION_KEY) ?? "",
          localStorage.getItem(LAST_HOST_KEY) ?? ""
        )
      );
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
      imageUrl: values.imageUrl || null,
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
        <div className="rounded-[var(--radius-sm)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
          Public link:{" "}
          <a
            href={`/p/${slug}`}
            target="_blank"
            className="font-semibold text-[var(--accent)] underline"
          >
            /p/{slug}
          </a>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Title</label>
        <input
          autoFocus
          required
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Trivia at the Sett"
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Starts</label>
          <input
            type="datetime-local"
            required
            value={values.startsAt}
            onChange={(e) => update("startsAt", e.target.value)}
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Ends (optional)</label>
          <input
            type="datetime-local"
            value={values.endsAt}
            onChange={(e) => update("endsAt", e.target.value)}
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Location name</label>
        <input
          required
          value={values.locationName}
          onChange={(e) => update("locationName", e.target.value)}
          placeholder="Union South, The Sett"
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Location note (optional)</label>
        <input
          value={values.locationNote}
          onChange={(e) => update("locationNote", e.target.value)}
          placeholder="2nd floor, look for the tall table"
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Description (optional)</label>
        <textarea
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Host name</label>
          <input
            required
            value={values.hostName}
            onChange={(e) => update("hostName", e.target.value)}
            placeholder="Maya"
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Category (optional)</label>
          <input
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            placeholder="trivia, IM, run club..."
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Min needed (optional)</label>
          <input
            type="number"
            min={1}
            value={values.minNeeded}
            onChange={(e) => update("minNeeded", e.target.value)}
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Capacity (optional)</label>
          <input
            type="number"
            min={1}
            value={values.capacity}
            onChange={(e) => update("capacity", e.target.value)}
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">External link (optional)</label>
        <input
          value={values.externalUrl}
          onChange={(e) => update("externalUrl", e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Photo URL (optional)</label>
        <input
          value={values.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
          placeholder="https://... (a photo you have rights to use)"
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
        {values.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={values.imageUrl}
            alt=""
            className="mt-2 h-32 w-full rounded-[var(--radius-sm)] object-cover"
          />
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
        <input
          type="checkbox"
          checked={values.isPublished}
          onChange={(e) => update("isPublished", e.target.checked)}
          className="accent-[var(--accent)]"
        />
        Published
      </label>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] transition active:scale-[0.98] disabled:opacity-50"
      >
        {saving ? "Saving..." : planId ? "Save changes" : "Create plan"}
      </button>
    </form>
  );
}
