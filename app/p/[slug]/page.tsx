import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPlanBySlug, getResponsesForPlan } from "@/lib/queries/plans";
import { getResponseForVisitor } from "@/lib/queries/responses";
import { getVisitorSession } from "@/lib/session";
import { computeHeadCount } from "@/lib/head-count";
import { formatPlanTime } from "@/lib/format-time";
import { initialsFor, avatarColorFor } from "@/lib/avatar-color";
import { ClockIcon, PinIcon, CalendarIcon, ExternalLinkIcon } from "@/lib/icons";
import { ThemeToggle } from "@/lib/theme-toggle";
import { ResponseWidget } from "./response-widget";
import { ViewTracker } from "./view-tracker";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const plan = await getPlanBySlug(slug);

  if (!plan) return {};

  const responses = await getResponsesForPlan(plan.id);
  const headCount = computeHeadCount(plan, responses);
  const time = formatPlanTime(new Date(plan.startsAt));

  return {
    title: plan.title,
    description: `${time} · ${headCount.line}`,
    openGraph: {
      title: plan.title,
      description: `${time} · ${headCount.line}`,
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function PlanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plan = await getPlanBySlug(slug);

  if (!plan || !plan.isPublished) {
    notFound();
  }

  const responses = await getResponsesForPlan(plan.id);
  const headCount = computeHeadCount(plan, responses);
  const time = formatPlanTime(new Date(plan.startsAt));

  const session = await getVisitorSession();
  const existingResponse = session.visitorId
    ? await getResponseForVisitor(plan.id, session.visitorId)
    : null;

  const inResponses = responses.filter((r) => r.status === "in");
  const progressPct =
    plan.minNeeded != null
      ? Math.min(100, Math.round((headCount.inCount / plan.minNeeded) * 100))
      : null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <ViewTracker planId={plan.id} />

      <div className="mx-auto max-w-md px-5 pb-16 pt-10">
        <div className="mb-3 flex items-start justify-between">
          {plan.category ? (
            <span className="inline-block rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              {plan.category}
            </span>
          ) : (
            <span />
          )}
          <ThemeToggle />
        </div>

        <h1 className="animate-fade-in-up text-[2rem] font-extrabold leading-tight tracking-tight text-[var(--foreground)]">
          {plan.title}
        </h1>

        <div
          className="animate-fade-in-up mt-3 flex flex-col gap-1.5 text-[15px] text-[var(--muted)]"
          style={{ animationDelay: "60ms" }}
        >
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 shrink-0" />
            <span className="font-medium text-[var(--foreground)]">{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <PinIcon className="h-4 w-4 shrink-0" />
            <span>{plan.locationName}</span>
          </div>
        </div>

        <div
          style={{ animationDelay: "120ms" }}
          className={`animate-fade-in-up mt-5 rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-card)] ${
            headCount.isMet
              ? "border-transparent bg-[var(--success-soft)]"
              : "border-[var(--border)] bg-[var(--surface)]"
          }`}
        >
          <p
            className={`text-lg font-bold leading-snug ${
              headCount.isMet ? "text-[var(--success)]" : "text-[var(--foreground)]"
            }`}
          >
            {headCount.line}
          </p>
          {headCount.maybeCount > 0 && (
            <p className="mt-0.5 text-sm text-[var(--muted-2)]">
              +{headCount.maybeCount} maybe
            </p>
          )}
          {progressPct !== null && (
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className={`h-full rounded-full transition-all ${
                  headCount.isMet ? "bg-[var(--success)]" : "bg-[var(--accent)]"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>

        <div className="animate-fade-in-up mt-5" style={{ animationDelay: "180ms" }}>
          <ResponseWidget
            slug={plan.slug}
            planId={plan.id}
            lastDisplayName={session.lastDisplayName ?? ""}
            initialResponse={
              existingResponse
                ? {
                    status: existingResponse.status as "in" | "maybe" | "out",
                    displayName: existingResponse.displayName,
                  }
                : null
            }
            isFull={headCount.isFull}
          />
        </div>

        {inResponses.length > 0 && (
          <div
            className="animate-fade-in-up mt-7"
            style={{ animationDelay: "220ms" }}
          >
            <p className="mb-2.5 text-sm font-semibold text-[var(--foreground)]">
              Who&apos;s in
            </p>
            <div className="flex flex-wrap gap-x-1 gap-y-2">
              {inResponses.map((r, i) => {
                const { bg, fg } = avatarColorFor(r.displayName);
                return (
                  <div
                    key={r.id}
                    className="animate-pop-in flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3"
                    style={{ animationDelay: `${240 + i * 30}ms` }}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{ background: bg, color: fg }}
                    >
                      {initialsFor(r.displayName)}
                    </span>
                    <span className="text-sm text-[var(--foreground)]">{r.displayName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-7 space-y-4 border-t border-[var(--border)] pt-6 text-[15px] text-[var(--muted)]">
          {plan.description && <p className="text-[var(--foreground)]">{plan.description}</p>}
          {plan.locationNote && <p>{plan.locationNote}</p>}
          <p>
            Hosted by <span className="font-medium text-[var(--foreground)]">{plan.hostName}</span>
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {plan.externalUrl && (
              <a
                href={plan.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--foreground)]"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                More details
              </a>
            )}
            <a
              href={`/p/${plan.slug}/ics`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--foreground)]"
            >
              <CalendarIcon className="h-4 w-4" />
              Add to calendar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
