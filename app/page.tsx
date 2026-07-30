import Link from "next/link";
import { getFeaturedPlans, getResponsesForPlan } from "@/lib/queries/plans";
import { computeHeadCount } from "@/lib/head-count";
import { formatPlanTime } from "@/lib/format-time";
import { PublicNav } from "@/lib/public-nav";
import { ClockIcon, PinIcon } from "@/lib/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const plans = await getFeaturedPlans();

  const withHeadCounts = await Promise.all(
    plans.map(async (plan) => ({
      plan,
      headCount: computeHeadCount(plan, await getResponsesForPlan(plan.id)),
    }))
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <PublicNav active="home" />

      <div className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="animate-fade-in-up text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
          What&apos;s on this week
        </h1>
        <p
          className="animate-fade-in-up mt-1.5 text-[15px] text-[var(--muted)]"
          style={{ animationDelay: "40ms" }}
        >
          Hand-picked plans around Madison. No algorithm, just what&apos;s actually happening.
        </p>

        {withHeadCounts.length === 0 ? (
          <p className="mt-10 text-sm text-[var(--muted-2)]">
            Nothing featured right now — check back soon.
          </p>
        ) : (
          <div className="mt-8 space-y-3">
            {withHeadCounts.map(({ plan, headCount }, i) => (
              <Link
                key={plan.id}
                href={`/p/${plan.slug}`}
                className="animate-fade-in-up flex gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5"
                style={{ animationDelay: `${80 + i * 40}ms` }}
              >
                {plan.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={plan.imageUrl}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-[var(--radius-md)] object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  {plan.category && (
                    <span className="mb-1 inline-block rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                      {plan.category}
                    </span>
                  )}
                  <p className="truncate text-lg font-bold text-[var(--foreground)]">
                    {plan.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-[var(--muted)]">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {formatPlanTime(new Date(plan.startsAt))}
                    </span>
                    <span className="flex items-center gap-1">
                      <PinIcon className="h-3.5 w-3.5" />
                      {plan.locationName}
                    </span>
                  </div>
                  <p
                    className={`mt-1.5 text-sm font-semibold ${
                      headCount.isMet ? "text-[var(--success)]" : "text-[var(--foreground)]"
                    }`}
                  >
                    {headCount.line}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
