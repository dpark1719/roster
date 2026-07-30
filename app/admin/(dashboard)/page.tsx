import Link from "next/link";
import { listPlans } from "@/lib/queries/plans";
import { formatPlanTime } from "@/lib/format-time";
import { DuplicateButton } from "./duplicate-button";
import { SyncButton } from "./sync-button";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const { upcoming, past } = await listPlans();

  return (
    <div className="space-y-9">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Plans</h1>
        <div className="flex items-center gap-3">
          <SyncButton />
          <Link
            href="/admin/new"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)]"
          >
            + New plan
          </Link>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-2)]">
          Upcoming
        </h2>
        <PlanList plans={upcoming} />
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-2)]">
          Past
        </h2>
        <PlanList plans={past} />
      </section>
    </div>
  );
}

function PlanList({
  plans,
}: {
  plans: Array<{
    id: string;
    slug: string;
    title: string;
    startsAt: Date;
    locationName: string;
    isPublished: boolean;
    minNeeded: number | null;
    inCount: number;
    source: string | null;
  }>;
}) {
  if (plans.length === 0) {
    return <p className="text-sm text-[var(--muted-2)]">No plans yet.</p>;
  }

  return (
    <div className="space-y-2">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-card)]"
        >
          <Link href={`/admin/${plan.id}`} className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-[var(--foreground)]">{plan.title}</p>
              {!plan.isPublished && (
                <span className="shrink-0 rounded-full bg-[var(--border)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted)]">
                  draft
                </span>
              )}
              {plan.source && (
                <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
                  auto
                </span>
              )}
            </div>
            <p className="truncate text-sm text-[var(--muted)]">
              {formatPlanTime(new Date(plan.startsAt))} · {plan.locationName}
            </p>
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
              {plan.inCount}
              {plan.minNeeded != null ? ` / ${plan.minNeeded}` : ""} in
            </span>
            <DuplicateButton planId={plan.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
