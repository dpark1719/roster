export interface FeedSource {
  /** Stable key stored in plans.source, used for dedup + display. */
  key: string;
  label: string;
  feedUrl: string;
  category: string;
  defaultHostName: string;
  /**
   * Single-venue feeds often omit LOCATION on individual events (an event at
   * the children's museum is obviously at the children's museum). Setting this
   * lets those events through instead of being skipped as location-less.
   * Leave undefined for multi-venue feeds, where guessing a location would be
   * wrong.
   */
  fallbackLocation?: string;
}

export const FEED_SOURCES: FeedSource[] = [
  {
    key: "today.wisc.edu:arts",
    label: "UW–Madison Events — Arts",
    feedUrl: "https://today.wisc.edu/events/tag/arts.ics",
    category: "school",
    defaultHostName: "UW–Madison",
  },
  {
    key: "today.wisc.edu:athletics",
    label: "UW–Madison Events — Athletics",
    feedUrl: "https://today.wisc.edu/events/tag/athletics.ics",
    category: "school",
    defaultHostName: "UW–Madison",
  },
  {
    key: "win.wisc.edu",
    label: "Registered Student Organizations",
    feedUrl: "https://static-prod-us-east-1.campusgroups.com/ical/wisc/ical_wisc.ics",
    category: "school",
    defaultHostName: "Registered Student Org",
  },
  {
    key: "henryvilaszoo.gov",
    label: "Henry Vilas Zoo",
    feedUrl: "https://www.henryvilaszoo.gov/event-listing/?ical=1",
    category: "local",
    defaultHostName: "Henry Vilas Zoo",
    fallbackLocation: "Henry Vilas Zoo, 702 S. Randall Avenue, Madison, WI 53715",
  },
];

/**
 * Investigated and deliberately NOT enabled — don't re-add without re-checking:
 *
 * - madisonchildrensmuseum.org (?ical=1): valid feed with ~30 events, but the
 *   server sends a broken TLS chain (leaf issued by GlobalSign AlphaSSL CA
 *   2025, serves the 2023 intermediate). Node rejects it with
 *   UNABLE_TO_VERIFY_LEAF_SIGNATURE. Browsers/curl mask this via AIA fetching.
 *   Fixable only by disabling cert verification (unacceptable) or pinning a
 *   custom CA (fragile). Worth re-testing later — they may fix their chain.
 * - olbrich.org, isthmus.com: return 403 to automated requests. Not bypassing.
 * - visitmadison.com, cityofmadison.com, madisonpubliclibrary.org: no ICS feed
 *   and no schema.org Event JSON-LD — events are JS-rendered.
 * - overture.org, garverevents.com, highnoonsaloon.com, themajesticmadison.com,
 *   arboretum.wisc.edu, wisconsinhistory.org, madisonparks.org: no ?ical=1 feed.
 * - Eventbrite: public Event Search API was shut off in Feb 2020. Only
 *   per-organization/per-venue endpoints remain, which need an org ID per
 *   venue plus an API key — viable but narrow, not a citywide search.
 * - Facebook/Instagram: no public events API. Meta removed public Page event
 *   access; only Pages you administer are readable. Scraping violates ToS.
 */
