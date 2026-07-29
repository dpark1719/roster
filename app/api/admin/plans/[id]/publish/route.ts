import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/session";
import { updatePlan } from "@/lib/queries/plans";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const isPublished = Boolean(body.isPublished);

  const plan = await updatePlan(id, { isPublished });
  return NextResponse.json({ plan });
}
