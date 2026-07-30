import { getMapPlans, getResponsesForPlan } from "@/lib/queries/plans";
import { PublicNav } from "@/lib/public-nav";
import { MapClient } from "./map-client";
import type { MapPlan } from "./leaflet-map";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const plans = await getMapPlans();

  const mapPlans: MapPlan[] = await Promise.all(
    plans
      .filter((p) => p.latitude != null && p.longitude != null)
      .map(async (p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        startsAt: p.startsAt.toISOString(),
        locationName: p.locationName,
        category: p.category,
        latitude: p.latitude as number,
        longitude: p.longitude as number,
        minNeeded: p.minNeeded,
        capacity: p.capacity,
        responses: await getResponsesForPlan(p.id),
      }))
  );

  return (
    <div className="flex h-screen flex-col bg-[var(--background)]">
      <PublicNav active="map" />
      <div className="flex-1">
        {mapPlans.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted-2)]">
            No plans with a location set yet.
          </div>
        ) : (
          <MapClient plans={mapPlans} />
        )}
      </div>
    </div>
  );
}
