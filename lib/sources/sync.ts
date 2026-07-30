import ical, { type VEvent, type CalendarComponent } from "node-ical";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { and, eq, inArray, lt } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";
import type { FeedSource } from "./config";

const BAD_LOCATION_MARKERS = ["sign in to download", "online"];

function isUsableLocation(location: string | undefined): location is string {
  if (!location) return false;
  const trimmed = location.trim();
  if (trimmed.length === 0) return false;
  return !BAD_LOCATION_MARKERS.some((marker) => trimmed.toLowerCase().includes(marker));
}

function paramValue(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "object" && "val" in (v as Record<string, unknown>)) {
    return String((v as { val: unknown }).val);
  }
  return String(v);
}

export interface SyncResult {
  source: string;
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
  error?: string;
}

export async function syncSource(source: FeedSource): Promise<SyncResult> {
  const result: SyncResult = {
    source: source.key,
    fetched: 0,
    created: 0,
    updated: 0,
    skipped: 0,
  };

  let events: Record<string, CalendarComponent | undefined>;
  try {
    events = await ical.async.fromURL(source.feedUrl);
  } catch (err) {
    result.error = err instanceof Error ? err.message : "Failed to fetch feed";
    return result;
  }

  const now = new Date();

  for (const item of Object.values(events)) {
    if (!item || item.type !== "VEVENT") continue;
    const event = item as VEvent;
    result.fetched++;

    const uid = event.uid;
    const title = paramValue(event.summary)?.trim();
    const startsAt = event.start ? new Date(event.start) : null;
    const location = paramValue(event.location);

    if (!uid || !title || !startsAt || startsAt < now || !isUsableLocation(location)) {
      result.skipped++;
      continue;
    }

    const endsAt = event.end ? new Date(event.end) : null;
    const description = paramValue(event.description)?.slice(0, 2000) ?? null;
    const externalUrl = paramValue(event.url) ?? null;
    const organizer =
      typeof event.organizer === "object" && event.organizer && "params" in event.organizer
        ? event.organizer.params?.CN
        : paramValue(event.organizer);

    const existing = await db.query.plans.findFirst({
      where: and(eq(plans.source, source.key), eq(plans.sourceUid, uid)),
    });

    if (existing) {
      await db
        .update(plans)
        .set({
          title,
          startsAt,
          endsAt,
          locationName: location,
          description,
          externalUrl,
          lastSyncedAt: now,
          updatedAt: now,
        })
        .where(eq(plans.id, existing.id));
      result.updated++;
    } else {
      await db.insert(plans).values({
        slug: generateSlug(),
        title,
        startsAt,
        endsAt,
        locationName: location,
        description,
        hostName: organizer || source.defaultHostName,
        category: source.category,
        externalUrl,
        isPublished: true,
        source: source.key,
        sourceUid: uid,
        lastSyncedAt: now,
      });
      result.created++;
    }
  }

  return result;
}

export async function syncAllSources(sources: FeedSource[]): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  for (const source of sources) {
    results.push(await syncSource(source));
  }
  return results;
}

export async function pruneStaleIngested(sources: FeedSource[]): Promise<number> {
  const keys = sources.map((s) => s.key);
  if (keys.length === 0) return 0;

  const deleted = await db
    .delete(plans)
    .where(and(inArray(plans.source, keys), lt(plans.startsAt, new Date())))
    .returning({ id: plans.id });

  return deleted.length;
}
