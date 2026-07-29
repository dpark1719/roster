import Link from "next/link";
import { listPlans } from "@/lib/queries/plans";
import { formatPlanTime } from "@/lib/format-time";
import { DuplicateButton } from "./duplicate-button";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const { upcoming, past } = await listPlans();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Plans</h1>
        <Link
          href="/admin/new"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          New plan
        </Link>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Upcoming</h2>
        <PlanList plans={upcoming} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Past</h2>
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
  }>;
}) {
  if (plans.length === 0) {
    return <p className="text-sm text-neutral-400">No plans yet.</p>;
  }

  return (
    <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white">
      {plans.map((plan) => (
        <li key={plan.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href={`/admin/${plan.id}`} className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{plan.title}</p>
            <p className="truncate text-xs text-neutral-500">
              {formatPlanTime(new Date(plan.startsAt))} · {plan.locationName}
              {!plan.isPublished && " · draft"}
            </p>
          </Link>
          <DuplicateButton planId={plan.id} />
        </li>
      ))}
    </ul>
  );
}
