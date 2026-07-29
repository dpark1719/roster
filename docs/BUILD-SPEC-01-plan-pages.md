# BUILD SPEC — Build 1: Plan Pages

**Status:** ready to build
**Owner:** David (product decisions) / Hermes (implementation)
**Companion doc:** `product-brief-v2.md` — read for context, but this spec governs. If the two conflict, this file wins.

---

## 0. Read this first

**The goal of Build 1 is to answer one question:** will people use a link to commit to a plan?

That's it. Not discovery. Not recommendations. Not calendars. Not accounts. Not a feed.

**Non-goals — do not build these in Build 1. If you find yourself building one, stop and ask.**

- User accounts, login, passwords, or auth of any kind for regular users
- Friend graphs, following, profiles, or any way to browse people
- Native mobile apps
- Calendar integration of any kind
- Push notifications
- Chat or messaging
- Recommendation logic or scoring
- Automated event ingestion or scraping
- Search
- Any second city or campus
- Payments

**The single hardest constraint, and the one most likely to get violated by accident:** a person who receives a plan link must be able to see the plan and respond to it without creating an account, installing anything, or entering a password. If any flow requires a signup, the build has failed its purpose.

---

## 1. What we're building

Two surfaces.

**Surface A — Admin (private, just for David).** A form to create and edit plans. Password-protected by a single shared secret. Ugly is fine.

**Surface B — Plan page (public, no auth).** A mobile web page for one plan, at a short shareable URL. Shows what/when/where, who's coming, and a one-tap way to respond. Designed to be pasted into a group chat.

That's the whole build.

---

## 2. Stack

Decided. Do not substitute without asking.

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router), TypeScript | Server components for the plan page so it renders fast and works with JS disabled for the read path |
| Hosting | Vercel free tier | |
| Database | Postgres — Supabase or Neon free tier | Use the Postgres client directly or Drizzle. Do not use Supabase Auth |
| Styling | Tailwind | |
| OG images | `next/og` (Satori) | Dynamic per-plan share image |
| Analytics | Vercel Analytics + a custom `events` table | Custom table is the important one |

Budget target: $0/month. If a choice costs money, ask first.

---

## 3. Data model

Concrete. Use these names.

```sql
create table plans (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,        -- 6-char url-safe, e.g. "k3m9xp"
  title         text not null,               -- "Trivia at the Sett"
  starts_at     timestamptz not null,
  ends_at       timestamptz,                 -- nullable
  location_name text not null,              -- "Union South, The Sett"
  location_note text,                        -- "2nd floor, look for the tall table"
  description   text,
  host_name     text not null,               -- "Maya" — a human, not an org
  category      text,                        -- free text for now, no enum
  min_needed    int,                         -- NULL = no minimum. See §5
  capacity      int,                         -- NULL = unlimited
  external_url  text,                        -- ticket link, org IG post, etc.
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table responses (
  id           uuid primary key default gen_random_uuid(),
  plan_id      uuid not null references plans(id) on delete cascade,
  visitor_id   uuid not null,                -- from signed cookie, see §4
  display_name text not null,               -- "Maya K."
  status       text not null,                -- 'in' | 'maybe' | 'out'
  contact      text,                         -- optional phone or email, opt-in only
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (plan_id, visitor_id)
);

create table events (                         -- instrumentation, see §8
  id         bigserial primary key,
  name       text not null,
  plan_id    uuid references plans(id) on delete set null,
  visitor_id uuid,
  props      jsonb,
  created_at timestamptz not null default now()
);
```

Notes:
- `slug` is what appears in the URL. Generate from a 32-char alphabet excluding lookalikes (`0`, `O`, `1`, `l`, `I`). Six characters.
- One response per visitor per plan, enforced by the unique constraint. Responding again is an update, not an insert.
- `contact` is nullable and must stay nullable. Never require it.

---

## 4. Identity without accounts

This is the crux of the build. Get it right.

When someone first hits any plan page, set an httpOnly signed cookie:

```
name:     visitor_id
value:    a UUID, signed with a server secret
maxAge:   1 year
sameSite: lax
secure:   true in production
```

That UUID is their identity. It lets them change or withdraw their response later, and lets us count distinct people, with no login and no PII.

To respond, a person supplies **a display name only**. First name plus last initial. That's the entire signup flow.

- Pre-fill the name field from the cookie if they've responded to any plan before — so the second response is genuinely one tap.
- Optional checkbox: *"Text me a reminder the day of"* → reveals a phone field. Unchecked by default. Never required. If they check it, that's the strongest signal in the whole build; log it.
- If the cookie is missing (cleared, different device), they get a new identity. Acceptable. Do not try to fix this with fingerprinting.

**Do not** send SMS in Build 1. Collect the number, store it, and I'll decide on sending later. Collecting intent is the experiment; delivery is a cost.

---

## 5. Plan page — behavior

Route: `/p/[slug]`

**Above the fold, in this order:**
1. Title
2. Day + time, in plain language relative to now — "Tonight, 8:00 PM", "Thursday, 8:00 PM", not "2026-07-30T20:00:00Z"
3. Location name
4. **Head count line** — see rules below
5. The response buttons

**Response buttons:** `I'm in` · `Maybe` · `Can't`. Three taps, side by side, thumb-reachable. Tapping opens a single name field inline — not a new page, not a modal that covers the plan.

**Below the fold:** description, location note, the list of who's in, host name, external link if present, an "add to calendar" `.ics` download (a static file, not an integration).

### Head count display rules

These matter more than they look. The head count is the reason the link gets pasted.

- `min_needed` is set and unmet → **"4 of 8 in — need 4 more by Thursday 7pm"**. This is the highest-urgency state and the whole reason the intramural wedge works.
- `min_needed` is set and met → **"8 of 8 in — we're on"**
- No `min_needed`, 2 or more in → **"Maya, Jordan and 4 others are in"** (names of the first two responders, then a count)
- No `min_needed`, exactly 1 in → **"Maya is in"**
- Nobody in yet → **"Be the first"**. Never render "0 people are going." An explicit zero kills the plan on sight.
- `capacity` set and reached → replace `I'm in` with **"Full"**, keep `Maybe` active as a waitlist signal

Show `maybe` counts separately and quietly. Never fold maybes into the "in" number.

### Who's in — visibility

Names of everyone with `status = 'in'` are visible to anyone with the link. Maybes and can'ts are **counts only, never names.** Someone who declines should never be publicly listed as having declined.

### After responding

Confirmation state, in place, no redirect. Show what they signed up for and a `Change` link. Then a share affordance: **"Know someone who'd come? Send them this."** with a native share sheet (`navigator.share`) and copy-link fallback.

That share prompt is the growth loop. Put real effort into it — it's the most important six words in the build.

---

## 6. Share preview

Generate a dynamic OG image per plan at `/p/[slug]/opengraph-image` using `next/og`. It must contain:

- Title, large
- Day and time
- The head count line from §5

This image is what appears in iMessage, GroupMe, Discord, and Instagram DMs. **It is the product's entire first impression.** A plan link that unfurls into something that looks better than a Canva flyer is a large part of why anyone shares it.

Test the unfurl in iMessage and Discord specifically before calling this done. Set `og:title`, `og:description`, and `twitter:card = summary_large_image`.

---

## 7. Admin

Route: `/admin`, gated by a single password compared against an env var, stored in an httpOnly cookie on success. No user table. No password reset. Rate-limit to 10 attempts per hour per IP.

Needs: list plans (upcoming / past), create, edit, duplicate, publish/unpublish, and per-plan a response list with names, statuses, timestamps, and any collected contacts.

**Optimize the create form for speed.** You'll use it dozens of times a week. Time yourself: entering a plan should take under 30 seconds. Sensible defaults (starts_at defaults to 7pm today), remembered last-used location, duplicate-from-last for recurring plans.

---

## 8. Instrumentation

Write to the `events` table. Nothing is real without these.

`plan_viewed`, `response_started`, `response_submitted` (props: status, whether contact given), `response_changed`, `share_clicked`, `share_completed`, `ics_downloaded`, `external_link_clicked`

One admin view at `/admin/metrics` showing, for the last 7 and 28 days:
- Plan views, unique visitors
- View → response conversion rate
- **Plans with 2+ distinct visitors marked `in`** ← this is the north star. Make it the biggest number on the page.
- Share clicks per plan
- Returning visitors (a `visitor_id` responding to 2+ different plans) — this is the retention signal, and the number I care about most after the north star

---

## 9. Acceptance criteria

Build 1 is done when all of these pass on a real phone, not a desktop emulator:

1. Admin creates a plan in under 30 seconds
2. The plan link, pasted into iMessage, unfurls with title, time, and head count in the image
3. A person with no account, no app, and no prior visit can open the link and mark themselves in, in under 15 seconds, entering only a first name
4. Their name appears in the who's-in list on reload
5. They can change their response from `in` to `can't` and back
6. A second visitor on a different device sees the updated count
7. A plan with `min_needed: 8` and 4 responses renders the "need 4 more" state correctly
8. A plan with zero responses never displays the number zero
9. Everything works with cookies allowed and JS enabled; the read path still renders with JS disabled
10. Every event in §8 is landing in the table

---

## 10. Open decisions — blocked on David

Do not guess at these. Build 1 works either way; these affect Build 2.

1. **Beachhead:** head-count-dependent groups (intramural captains, orgs with food/capacity) vs. nightlife/general social. Determines whether `min_needed` is the headline feature or an edge case.
2. **Name.** Affects the domain, and the domain affects how the link looks in a group chat, which is not cosmetic — a link people are embarrassed to paste doesn't get pasted.
3. **Recurring plans:** does the same weekly game get one plan page or a new one each week? Affects the schema. Defer until we've seen a real captain use it.
4. **Org-facing self-serve:** at what point do we let an org create their own plan without going through David? Not Build 1, but it changes the auth story when it comes.

---

## 11. What comes after — for orientation only, do not build

**Build 2** — the weekly curated list at `/` as a public page, hand-entered, no personalization. Turns single-plan pages into a destination.
**Build 3** — lightweight friends via mutual invite links, so the who's-in list means something socially.
**Build 4** — calendar (`calendar.freebusy` scope only), framed as conflict removal and group scheduling. Not before Build 3 retains.
