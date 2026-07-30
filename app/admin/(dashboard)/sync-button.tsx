"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SyncResult } from "@/lib/sources/sync";

export function SyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setSummary(null);

    const res = await fetch("/api/admin/sync", { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      setSummary("Sync failed.");
      return;
    }

    const { results, pruned }: { results: SyncResult[]; pruned: number } = await res.json();
    const created = results.reduce((sum, r) => sum + r.created, 0);
    const updated = results.reduce((sum, r) => sum + r.updated, 0);
    const errors = results.filter((r) => r.error);

    setSummary(
      errors.length > 0
        ? `Synced with errors: ${errors.map((e) => `${e.source} — ${e.error}`).join("; ")}`
        : `+${created} new, ${updated} updated, ${pruned} past events removed.`
    );
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] disabled:opacity-50"
      >
        {loading ? "Syncing..." : "Sync from sources"}
      </button>
      {summary && <p className="text-sm text-[var(--muted)]">{summary}</p>}
    </div>
  );
}
