import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/session";
import { ThemeToggle } from "@/lib/theme-toggle";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3.5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="text-sm font-bold tracking-tight text-[var(--foreground)]">
              roster
            </span>
            <div className="flex gap-4 text-sm font-medium text-[var(--muted)]">
              <Link href="/admin" className="hover:text-[var(--foreground)]">
                Plans
              </Link>
              <Link href="/admin/metrics" className="hover:text-[var(--foreground)]">
                Metrics
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-4 border-r border-[var(--border)] pr-4 text-sm text-[var(--muted-2)]">
              <Link href="/" target="_blank" className="hover:text-[var(--foreground)]">
                Homepage ↗
              </Link>
              <Link href="/map" target="_blank" className="hover:text-[var(--foreground)]">
                Map ↗
              </Link>
              <Link href="/calendar" target="_blank" className="hover:text-[var(--foreground)]">
                Calendar ↗
              </Link>
            </div>
            <ThemeToggle />
            <form action="/api/admin/logout" method="post">
              <button className="text-sm text-[var(--muted-2)] hover:text-[var(--foreground)]">
                Log out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-5 py-8">{children}</main>
    </div>
  );
}
