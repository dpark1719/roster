import Link from "next/link";
import { ThemeToggle } from "@/lib/theme-toggle";

export function PublicNav({ active }: { active: "home" | "map" | "calendar" }) {
  const linkClass = (key: typeof active) =>
    `text-sm font-medium transition ${
      active === key ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
    }`;

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3.5">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/" className="text-sm font-bold tracking-tight text-[var(--foreground)]">
            roster
          </Link>
          <Link href="/" className={linkClass("home")}>
            This week
          </Link>
          <Link href="/map" className={linkClass("map")}>
            Map
          </Link>
          <Link href="/calendar" className={linkClass("calendar")}>
            Calendar
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}
