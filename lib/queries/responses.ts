import { db } from "@/db";
import { responses } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type ResponseStatus = "in" | "maybe" | "out";

export async function upsertResponse(params: {
  planId: string;
  visitorId: string;
  displayName: string;
  status: ResponseStatus;
  contact?: string | null;
}) {
  const existing = await db.query.responses.findFirst({
    where: and(
      eq(responses.planId, params.planId),
      eq(responses.visitorId, params.visitorId)
    ),
  });

  if (existing) {
    const [updated] = await db
      .update(responses)
      .set({
        displayName: params.displayName,
        status: params.status,
        contact: params.contact ?? existing.contact,
        updatedAt: new Date(),
      })
      .where(eq(responses.id, existing.id))
      .returning();
    return { response: updated, wasUpdate: true };
  }

  const [created] = await db
    .insert(responses)
    .values({
      planId: params.planId,
      visitorId: params.visitorId,
      displayName: params.displayName,
      status: params.status,
      contact: params.contact ?? null,
    })
    .returning();

  return { response: created, wasUpdate: false };
}

export async function getResponseForVisitor(planId: string, visitorId: string) {
  return db.query.responses.findFirst({
    where: and(eq(responses.planId, planId), eq(responses.visitorId, visitorId)),
  });
}
