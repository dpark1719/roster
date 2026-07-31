// Nominatim (OpenStreetMap) usage policy requires a descriptive User-Agent
// and at most 1 request/second — see https://operations.osmfoundation.org/policies/nominatim/
const USER_AGENT = "roster-madison-app (contact: via github.com/dpark1719/roster)";

async function nominatimSearch(query: string): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return null;

    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (results.length === 0) return null;

    return {
      latitude: parseFloat(results[0].lat),
      longitude: parseFloat(results[0].lon),
    };
  } catch {
    return null;
  }
}

// Real venue strings from event feeds are messy — "Studio G, Memorial Union"
// (a room inside a venue) or "Kohl Center (601 W. Dayton St.), 333 East Campus
// Mall, 3rd Floor, Madison, WI 53715" (a venue plus internal address noise).
// Nominatim can't geocode either verbatim, so build a few simplified fallback
// candidates and use the first one that resolves.
function candidateQueries(locationName: string): string[] {
  const candidates = new Set<string>();
  const trimmed = locationName.trim();

  candidates.add(`${trimmed}, Madison, WI`);

  const beforeParen = trimmed.split("(")[0].trim().replace(/,$/, "");
  if (beforeParen && beforeParen !== trimmed) {
    candidates.add(`${beforeParen}, Madison, WI`);
  }

  const commaIndex = trimmed.indexOf(",");
  if (commaIndex !== -1) {
    const afterFirstComma = trimmed.slice(commaIndex + 1).trim();
    if (afterFirstComma) {
      candidates.add(`${afterFirstComma}, Madison, WI`);
    }

    const firstSegment = trimmed.slice(0, commaIndex).trim();
    if (firstSegment) {
      candidates.add(`${firstSegment}, Madison, WI`);
    }
  }

  return Array.from(candidates);
}

export async function geocodeLocation(locationName: string): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const candidates = candidateQueries(locationName);

  for (let i = 0; i < candidates.length; i++) {
    if (i > 0) await sleep(1100);
    const result = await nominatimSearch(candidates[i]);
    if (result) return result;
  }

  return null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
