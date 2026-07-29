"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

export function ViewTracker({ planId }: { planId: string }) {
  useEffect(() => {
    track("plan_viewed", planId);
  }, [planId]);

  return null;
}
