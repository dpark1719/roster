"use client";

import dynamic from "next/dynamic";
import type { MapPlan } from "./leaflet-map";

const LeafletMap = dynamic(() => import("./leaflet-map").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
      Loading map...
    </div>
  ),
});

export function MapClient({ plans }: { plans: MapPlan[] }) {
  return <LeafletMap plans={plans} />;
}
