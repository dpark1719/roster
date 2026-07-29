"use client";

import type { EventName } from "@/lib/events";

export function track(name: EventName, planId?: string, props?: Record<string, unknown>) {
  const body = JSON.stringify({ name, planId, props });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    return;
  }

  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
