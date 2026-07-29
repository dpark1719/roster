import { ImageResponse } from "next/og";
import { getPlanBySlug, getResponsesForPlan } from "@/lib/queries/plans";
import { computeHeadCount } from "@/lib/head-count";
import { formatPlanTime } from "@/lib/format-time";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plan = await getPlanBySlug(slug);

  if (!plan) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            background: "#171717",
            color: "white",
          }}
        >
          Plan not found
        </div>
      ),
      size
    );
  }

  const responses = await getResponsesForPlan(plan.id);
  const headCount = computeHeadCount(plan, responses);
  const time = formatPlanTime(new Date(plan.startsAt));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#a1a1aa",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {time}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {plan.title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            fontWeight: 600,
            color: headCount.isMet ? "#4ade80" : "#fafafa",
          }}
        >
          {headCount.line}
        </div>
      </div>
    ),
    size
  );
}
