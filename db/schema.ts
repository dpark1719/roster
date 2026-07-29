import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  bigserial,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  locationName: text("location_name").notNull(),
  locationNote: text("location_note"),
  description: text("description"),
  hostName: text("host_name").notNull(),
  category: text("category"),
  minNeeded: integer("min_needed"),
  capacity: integer("capacity"),
  externalUrl: text("external_url"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const responses = pgTable(
  "responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    visitorId: uuid("visitor_id").notNull(),
    displayName: text("display_name").notNull(),
    status: text("status").notNull(), // 'in' | 'maybe' | 'out'
    contact: text("contact"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [unique().on(table.planId, table.visitorId)]
);

export const events = pgTable("events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  planId: uuid("plan_id").references(() => plans.id, {
    onDelete: "set null",
  }),
  visitorId: uuid("visitor_id"),
  props: jsonb("props"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});
