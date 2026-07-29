import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPlanBySlug, getResponsesForPlan } from "@/lib/queries/plans";
import { getResponseForVisitor } from "@/lib/queries/responses";
import { getVisitorSession } from "@/lib/session";
import { computeHeadCount } from "@/lib/head-count";
import { formatPlanTime } from "@/lib/format-time";
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

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 py-8">
      <ViewTracker planId={plan.id} />

      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{plan.title}</h1>
        <p className="text-lg text-neutral-700">{time}</p>
        <p className="text-neutral-600">{plan.locationName}</p>
        <p
          className={`text-lg font-semibold ${
            headCount.isMet ? "text-green-600" : "text-neutral-900"
          }`}
        >
          {headCount.line}
          {headCount.maybeCount > 0 && (
            <span className="ml-2 text-sm font-normal text-neutral-400">
              +{headCount.maybeCount} maybe
            </span>
          )}
        </p>
      </div>

      <div className="mt-5">
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

      <div className="mt-8 space-y-4 border-t border-neutral-200 pt-6 text-sm text-neutral-700">
        {plan.description && <p>{plan.description}</p>}
        {plan.locationNote && (
          <p className="text-neutral-500">{plan.locationNote}</p>
        )}
        <p>Hosted by {plan.hostName}</p>

        {inResponses.length > 0 && (
          <div>
            <p className="mb-1 font-medium text-neutral-900">Who&apos;s in</p>
            <p>{inResponses.map((r) => r.displayName).join(", ")}</p>
          </div>
        )}

        {plan.externalUrl && (
          <a
            href={plan.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-medium text-blue-600 underline"
          >
            More details →
          </a>
        )}

        <a
          href={`/p/${plan.slug}/ics`}
          className="block font-medium text-blue-600 underline"
        >
          Add to calendar
        </a>
      </div>
    </div>
  );
}
