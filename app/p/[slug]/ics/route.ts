import { NextRequest, NextResponse } from "next/server";
import { getPlanBySlug } from "@/lib/queries/plans";
import { generateIcs } from "@/lib/ics";
import { getVisitorSession } from "@/lib/session";
import { logEvent } from "@/lib/events";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const plan = await getPlanBySlug(slug);

  if (!plan || !plan.isPublished) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const session = await getVisitorSession();
  await logEvent({
    name: "ics_downloaded",
    planId: plan.id,
    visitorId: session.visitorId ?? null,
  });

  const ics = generateIcs(plan);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
    },
  });
}
