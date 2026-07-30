export interface FeedSource {
  /** Stable key stored in plans.source, used for dedup + display. */
  key: string;
  label: string;
  feedUrl: string;
  category: string;
  defaultHostName: string;
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
];
