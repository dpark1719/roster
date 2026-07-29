import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/session";

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
    <div className="min-h-screen bg-neutral-50">
      <nav className="border-b border-neutral-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex gap-4 text-sm font-medium">
            <Link href="/admin">Plans</Link>
            <Link href="/admin/metrics">Metrics</Link>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="text-sm text-neutral-500 hover:text-neutral-900">
              Log out
            </button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
