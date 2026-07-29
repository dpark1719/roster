import { NextRequest, NextResponse } from "next/server";
import { getVisitorSession } from "@/lib/session";
import { logEvent, type EventName } from "@/lib/events";

const VALID_EVENTS: EventName[] = [
  "plan_viewed",
  "response_started",
  "response_submitted",
  "response_changed",
  "share_clicked",
  "share_completed",
  "ics_downloaded",
  "external_link_clicked",
];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || !VALID_EVENTS.includes(body.name)) {
    return NextResponse.json({ error: "Invalid event name" }, { status: 400 });
  }

  const session = await getVisitorSession();

  await logEvent({
    name: body.name,
    planId: typeof body.planId === "string" ? body.planId : null,
    visitorId: session.visitorId ?? null,
    props: body.props ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
