import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/session";
import { createPlan } from "@/lib/queries/plans";

function parsePlanBody(body: Record<string, unknown>) {
  return {
    title: String(body.title ?? "").trim(),
    startsAt: new Date(String(body.startsAt)),
    endsAt: body.endsAt ? new Date(String(body.endsAt)) : null,
    locationName: String(body.locationName ?? "").trim(),
    locationNote: body.locationNote ? String(body.locationNote) : null,
    latitude: body.latitude != null && body.latitude !== "" ? Number(body.latitude) : null,
    longitude: body.longitude != null && body.longitude !== "" ? Number(body.longitude) : null,
    description: body.description ? String(body.description) : null,
    hostName: String(body.hostName ?? "").trim(),
    category: body.category ? String(body.category) : null,
    minNeeded: body.minNeeded != null && body.minNeeded !== "" ? Number(body.minNeeded) : null,
    capacity: body.capacity != null && body.capacity !== "" ? Number(body.capacity) : null,
    externalUrl: body.externalUrl ? String(body.externalUrl) : null,
    imageUrl: body.imageUrl ? String(body.imageUrl) : null,
    isPublished: Boolean(body.isPublished),
    isFeatured: Boolean(body.isFeatured),
  };
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const input = parsePlanBody(body);

  if (!input.title || !input.locationName || !input.hostName || isNaN(input.startsAt.getTime())) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const plan = await createPlan(input);
  return NextResponse.json({ plan });
}
