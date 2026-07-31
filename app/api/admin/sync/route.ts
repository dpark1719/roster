import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/session";
import { FEED_SOURCES } from "@/lib/sources/config";
import { syncAllSources, pruneStaleIngested } from "@/lib/sources/sync";

// Geocoding is rate-limited to ~1 req/sec (Nominatim's usage policy), so a
// sync with many new/uncoordinatd locations can take well past Vercel's
// default serverless timeout. Raise it; Hobby plans cap this around 60s
// regardless — a sync slower than that will still be cut off mid-run (safe:
// already-written plans stay, it just picks up remaining ones next run).
export const maxDuration = 60;

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await syncAllSources(FEED_SOURCES);
  const pruned = await pruneStaleIngested(FEED_SOURCES);

  return NextResponse.json({ results, pruned });
}
