import { NextRequest, NextResponse } from "next/server";
import { getPlanBySlug } from "@/lib/queries/plans";
import { getResponseForVisitor, upsertResponse } from "@/lib/queries/responses";
import { getVisitorSession } from "@/lib/session";
import { logEvent } from "@/lib/events";
import { checkRateLimit } from "@/lib/rate-limit";

const VALID_STATUSES = ["in", "maybe", "out"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(`respond:${ip}`, 20, 60 * 60 * 1000);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many responses. Try again later." },
      { status: 429 }
    );
  }

  const { slug } = await params;
  const plan = await getPlanBySlug(slug);

  if (!plan || !plan.isPublished) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim().slice(0, 60) : "";
  const status = body?.status;
  const contact = typeof body?.contact === "string" ? body.contact.trim().slice(0, 40) : null;

  if (!displayName) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const session = await getVisitorSession();
  const visitorId = session.visitorId!;

  const existing = await getResponseForVisitor(plan.id, visitorId);

  session.lastDisplayName = displayName;
  await session.save();

  const { response } = await upsertResponse({
    planId: plan.id,
    visitorId,
    displayName,
    status,
    contact: contact || null,
  });

  await logEvent({
    name: existing ? "response_changed" : "response_submitted",
    planId: plan.id,
    visitorId,
    props: { status, hasContact: Boolean(contact) },
  });

  return NextResponse.json({ response });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const plan = await getPlanBySlug(slug);

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const session = await getVisitorSession();
  if (!session.visitorId) {
    return NextResponse.json({ response: null, lastDisplayName: session.lastDisplayName ?? null });
  }

  const response = await getResponseForVisitor(plan.id, session.visitorId);

  return NextResponse.json({
    response: response ?? null,
    lastDisplayName: session.lastDisplayName ?? null,
  });
}

