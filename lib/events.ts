import { db } from "@/db";
import { events } from "@/db/schema";

export type EventName =
  | "plan_viewed"
  | "response_started"
  | "response_submitted"
  | "response_changed"
  | "share_clicked"
  | "share_completed"
  | "ics_downloaded"
  | "external_link_clicked";

export async function logEvent(params: {
  name: EventName;
  planId?: string | null;
  visitorId?: string | null;
  props?: Record<string, unknown>;
}) {
  try {
    await db.insert(events).values({
      name: params.name,
      planId: params.planId ?? null,
      visitorId: params.visitorId ?? null,
      props: params.props ?? null,
    });
  } catch (err) {
    // Instrumentation must never break the user-facing flow.
    console.error("logEvent failed", err);
  }
}
