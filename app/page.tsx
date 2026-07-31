import Link from "next/link";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getHomepagePlans, getResponsesForPlan } from "@/lib/queries/plans";
import { computeHeadCount } from "@/lib/head-count";
import { formatPlanTime } from "@/lib/format-time";
import { groupRecurring } from "@/lib/group-recurring";
import { PublicNav } from "@/lib/public-nav";
import { ClockIcon, PinIcon } from "@/lib/icons";

export const dynamic = "force-dynamic";

const TIME_ZONE = "America/Chicago";

export default async function HomePage() {
  const plans = await getHomepagePlans();
  const groups = groupRecurring(plans);

  const withHeadCounts = await Promise.all(
    groups.map(async (group) => ({
      group,
      headCount: computeHeadCount(group.primary, await getResponsesForPlan(group.primary.id)),
    }))
  );

  const firstNonFeaturedIndex = withHeadCounts.findIndex(({ group }) => !group.primary.isFeatured);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <PublicNav active="home" />

      <div className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="animate-fade-in-up text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
          What&apos;s happening around Madison
        </h1>
        <p
          className="animate-fade-in-up mt-1.5 text-[15px] text-[var(--muted)]"
          style={{ animationDelay: "40ms" }}
        >
          Everything upcoming, all in one place — hand-picked plans pinned to the top.
        </p>

        {withHeadCounts.length === 0 ? (
          <p className="mt-10 text-sm text-[var(--muted-2)]">Nothing upcoming right now.</p>
        ) : (
          <div className="mt-8 space-y-3">
            {withHeadCounts.map(({ group, headCount }, i) => {
              const plan = group.primary;
              return (
                <div key={plan.id}>
                  {i === firstNonFeaturedIndex && i > 0 && (
                    <div className="mb-3 mt-6 border-t border-[var(--border)] pt-1" />
                  )}
                  <Link
                    href={`/p/${plan.slug}`}
                    className={`animate-fade-in-up flex gap-4 rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 ${
                      plan.isFeatured
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border)] bg-[var(--surface)]"
                    }`}
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
                      <div className="mb-1 flex items-center gap-1.5">
                        {plan.isFeatured && (
                          <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--accent)]">
                            ★ Featured
                          </span>
                        )}
                        {plan.category && (
                          <span className="inline-block rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                            {plan.category}
                          </span>
                        )}
                      </div>
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
                  {group.otherDates.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 pl-1 text-xs text-[var(--muted-2)]">
                      <span>Also:</span>
                      {group.otherDates.map((other, j) => (
                        <span key={other.id}>
                          <Link href={`/p/${other.slug}`} className="underline hover:text-[var(--accent)]">
                            {format(toZonedTime(new Date(other.startsAt), TIME_ZONE), "EEE M/d")}
                          </Link>
                          {j < group.otherDates.length - 1 && ","}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
