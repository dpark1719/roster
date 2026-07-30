"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { computeHeadCount, type ResponseSummary } from "@/lib/head-count";
import { formatPlanTime } from "@/lib/format-time";

const markerIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 16px; height: 16px; border-radius: 9999px;
    background: #4f46e5; border: 3px solid white;
    box-shadow: 0 1px 4px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export interface MapPlan {
  id: string;
  slug: string;
  title: string;
  startsAt: string;
  locationName: string;
  category: string | null;
  latitude: number;
  longitude: number;
  minNeeded: number | null;
  capacity: number | null;
  responses: ResponseSummary[];
}

export function LeafletMap({ plans }: { plans: MapPlan[] }) {
  const center: [number, number] =
    plans.length > 0
      ? [plans[0].latitude, plans[0].longitude]
      : [43.0731, -89.4012]; // Madison, WI

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {plans.map((plan) => {
        const headCount = computeHeadCount(plan, plan.responses);
        return (
          <Marker key={plan.id} position={[plan.latitude, plan.longitude]} icon={markerIcon}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <p style={{ fontWeight: 700, marginBottom: 2 }}>{plan.title}</p>
                <p style={{ fontSize: 13, color: "#71717a", marginBottom: 2 }}>
                  {formatPlanTime(new Date(plan.startsAt))} · {plan.locationName}
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{headCount.line}</p>
                <Link href={`/p/${plan.slug}`} style={{ fontSize: 13, color: "#4f46e5" }}>
                  View plan →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
