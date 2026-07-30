import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/session";
import { FEED_SOURCES } from "@/lib/sources/config";
import { syncAllSources, pruneStaleIngested } from "@/lib/sources/sync";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await syncAllSources(FEED_SOURCES);
  const pruned = await pruneStaleIngested(FEED_SOURCES);

  return NextResponse.json({ results, pruned });
}
