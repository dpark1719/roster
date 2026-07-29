import { db } from "@/db";
import { plans, responses } from "@/db/schema";
import { eq, desc, asc, gte, lt, and } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";

export type PlanInput = {
  title: string;
  startsAt: Date;
  endsAt?: Date | null;
  locationName: string;
  locationNote?: string | null;
  description?: string | null;
  hostName: string;
  category?: string | null;
  minNeeded?: number | null;
  capacity?: number | null;
  externalUrl?: string | null;
  isPublished?: boolean;
};

export async function createPlan(input: PlanInput) {
  let slug = generateSlug();

  // Extremely unlikely, but guard against slug collisions.
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.query.plans.findFirst({
      where: eq(plans.slug, slug),
    });
    if (!existing) break;
    slug = generateSlug();
  }

  const [plan] = await db
    .insert(plans)
    .values({ ...input, slug })
    .returning();

  return plan;
}

export async function updatePlan(id: string, input: Partial<PlanInput>) {
  const [plan] = await db
    .update(plans)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(plans.id, id))
    .returning();

  return plan;
}

export async function getPlanBySlug(slug: string) {
  return db.query.plans.findFirst({ where: eq(plans.slug, slug) });
}

export async function getPlanById(id: string) {
  return db.query.plans.findFirst({ where: eq(plans.id, id) });
}

export async function listPlans() {
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    db.query.plans.findMany({
      where: gte(plans.startsAt, now),
      orderBy: asc(plans.startsAt),
    }),
    db.query.plans.findMany({
      where: lt(plans.startsAt, now),
      orderBy: desc(plans.startsAt),
      limit: 50,
    }),
  ]);
  return { upcoming, past };
}

export async function getResponsesForPlan(planId: string) {
  return db.query.responses.findMany({
    where: eq(responses.planId, planId),
    orderBy: asc(responses.createdAt),
  });
}

export async function duplicatePlan(id: string) {
  const original = await getPlanById(id);
  if (!original) return null;

  return createPlan({
    title: original.title,
    startsAt: original.startsAt,
    endsAt: original.endsAt,
    locationName: original.locationName,
    locationNote: original.locationNote,
    description: original.description,
    hostName: original.hostName,
    category: original.category,
    minNeeded: original.minNeeded,
    capacity: original.capacity,
    externalUrl: original.externalUrl,
    isPublished: false,
  });
}
