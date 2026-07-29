"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DuplicateButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch(`/api/admin/plans/${planId}/duplicate`, { method: "POST" });
    setLoading(false);
    if (res.ok) {
      const { plan } = await res.json();
      router.push(`/admin/${plan.id}`);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="shrink-0 rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
    >
      {loading ? "..." : "Duplicate"}
    </button>
  );
}
