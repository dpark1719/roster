import { db } from "@/db";
import { events, responses, plans } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export interface MetricsWindow {
  planViews: number;
  uniqueVisitors: number;
  responsesSubmitted: number;
  conversionRate: number;
  plansWithTwoPlusIn: number;
  shareClicks: number;
  returningVisitors: number;
}

async function computeWindow(since: Date): Promise<MetricsWindow> {
  const [viewRows, uniqueVisitorRows, responseRows, shareRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(and(eq(events.name, "plan_viewed"), gte(events.createdAt, since))),
    db
      .select({ count: sql<number>`count(distinct ${events.visitorId})` })
      .from(events)
      .where(and(eq(events.name, "plan_viewed"), gte(events.createdAt, since))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(
        and(eq(events.name, "response_submitted"), gte(events.createdAt, since))
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(and(eq(events.name, "share_clicked"), gte(events.createdAt, since))),
  ]);

  const planViews = Number(viewRows[0]?.count ?? 0);
  const uniqueVisitors = Number(uniqueVisitorRows[0]?.count ?? 0);
  const responsesSubmitted = Number(responseRows[0]?.count ?? 0);
  const shareClicks = Number(shareRows[0]?.count ?? 0);

  const conversionRate = planViews > 0 ? responsesSubmitted / planViews : 0;

  const plansWithTwoPlusInRows = await db
    .select({ planId: responses.planId })
    .from(responses)
    .innerJoin(plans, eq(plans.id, responses.planId))
    .where(and(eq(responses.status, "in"), gte(responses.createdAt, since)))
    .groupBy(responses.planId)
    .having(sql`count(*) >= 2`);

  const returningVisitorRows = await db
    .select({ visitorId: responses.visitorId })
    .from(responses)
    .where(gte(responses.createdAt, since))
    .groupBy(responses.visitorId)
    .having(sql`count(distinct ${responses.planId}) >= 2`);

  return {
    planViews,
    uniqueVisitors,
    responsesSubmitted,
    conversionRate,
    plansWithTwoPlusIn: plansWithTwoPlusInRows.length,
    shareClicks,
    returningVisitors: returningVisitorRows.length,
  };
}

export async function getMetrics() {
  const now = Date.now();
  const days7 = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const days28 = new Date(now - 28 * 24 * 60 * 60 * 1000);

  const [last7, last28] = await Promise.all([
    computeWindow(days7),
    computeWindow(days28),
  ]);

  return { last7, last28 };
}
