import ical, { type VEvent, type CalendarComponent } from "node-ical";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { and, eq, inArray, lt } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";
import { geocodeLocation, sleep } from "@/lib/geocode";
import type { FeedSource } from "./config";

// One geocode lookup per unique location string per sync run (many events
// share a venue), spaced 1/sec per Nominatim's usage policy.
async function geocodeCached(
  location: string,
  cache: Map<string, { latitude: number; longitude: number } | null>
): Promise<{ latitude: number; longitude: number } | null> {
  if (cache.has(location)) return cache.get(location)!;
  await sleep(1100);
  const result = await geocodeLocation(location);
  cache.set(location, result);
  return result;
}

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
    // "fetch failed" on its own is useless for diagnosis — undici hides the
    // real reason (DNS, TLS, timeout, reset) in err.cause.
    const cause = err instanceof Error ? (err.cause as { code?: string; message?: string }) : null;
    const detail = cause?.code ?? cause?.message;
    const base = err instanceof Error ? err.message : "Failed to fetch feed";
    result.error = detail ? `${base} (${detail})` : base;
    console.error(`[sync] ${source.key} fetch failed:`, err);
    return result;
  }

  const now = new Date();
  const geocodeCache = new Map<string, { latitude: number; longitude: number } | null>();

  for (const item of Object.values(events)) {
    if (!item || item.type !== "VEVENT") continue;
    const event = item as VEvent;
    result.fetched++;

    const uid = event.uid;
    const title = paramValue(event.summary)?.trim();
    const startsAt = event.start ? new Date(event.start) : null;
    const rawLocation = paramValue(event.location);
    const location = isUsableLocation(rawLocation) ? rawLocation : source.fallbackLocation;

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
      const locationChanged = existing.locationName !== location;
      const needsCoords = locationChanged || existing.latitude == null;
      const coords = needsCoords ? await geocodeCached(location, geocodeCache) : null;

      await db
        .update(plans)
        .set({
          title,
          startsAt,
          endsAt,
          locationName: location,
          ...(coords && { latitude: coords.latitude, longitude: coords.longitude }),
          description,
          externalUrl,
          lastSyncedAt: now,
          updatedAt: now,
        })
        .where(eq(plans.id, existing.id));
      result.updated++;
    } else {
      const coords = await geocodeCached(location, geocodeCache);

      await db.insert(plans).values({
        slug: generateSlug(),
        title,
        startsAt,
        endsAt,
        locationName: location,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
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
