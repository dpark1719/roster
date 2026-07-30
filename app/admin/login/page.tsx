"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/lib/theme-toggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Login failed.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <form
        onSubmit={handleSubmit}
        className="animate-fade-in-up w-full max-w-sm space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]"
      >
        <h1 className="text-lg font-bold text-[var(--foreground)]">roster admin</h1>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] transition active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Checking..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
