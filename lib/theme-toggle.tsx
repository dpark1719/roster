"use client";

import { useEffect, useState } from "react";

type ThemePref = "system" | "light" | "dark";

const STORAGE_KEY = "roster:theme";

function applyTheme(pref: ThemePref) {
  if (pref === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", pref);
  }
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M16.5 12.3A7 7 0 0 1 7.7 3.5a7 7 0 1 0 8.8 8.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AutoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2.75a7.25 7.25 0 0 0 0 14.5V2.75Z" fill="currentColor" />
    </svg>
  );
}

const ORDER: ThemePref[] = ["system", "light", "dark"];
const LABELS: Record<ThemePref, string> = { system: "Auto", light: "Light", dark: "Dark" };

export function ThemeToggle({ className }: { className?: string }) {
  const [pref, setPref] = useState<ThemePref>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePref | null;
    if (stored && ORDER.includes(stored)) {
      setPref(stored);
    }
  }, []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
    setPref(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  if (!mounted) {
    return <div className={`h-8 w-8 ${className ?? ""}`} />;
  }

  return (
    <button
      onClick={cycle}
      title={`Theme: ${LABELS[pref]} (click to change)`}
      className={`flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition hover:text-[var(--foreground)] active:scale-90 ${className ?? ""}`}
    >
      <span key={pref} className="animate-pop-in flex">
        {pref === "system" && <AutoIcon className="h-4 w-4" />}
        {pref === "light" && <SunIcon className="h-4 w-4" />}
        {pref === "dark" && <MoonIcon className="h-4 w-4" />}
      </span>
    </button>
  );
}
