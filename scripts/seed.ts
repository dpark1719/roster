import { createPlan } from "../lib/queries/plans";

function at(daysFromNow: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const SCHOOL_PLANS = [
  {
    title: "IM Basketball: Badger Ballers vs. Bucky's Best",
    startsAt: at(1, 20, 0),
    locationName: "Nicholas Recreation Center (SERF)",
    locationNote: "Court 2, main gym",
    description: "Rec league game — we need a full roster or we forfeit. Come ball.",
    hostName: "Jordan T.",
    category: "school",
    minNeeded: 10,
    capacity: null,
  },
  {
    title: "Memorial Union Terrace Live Music",
    startsAt: at(2, 19, 30),
    locationName: "Memorial Union Terrace",
    locationNote: "Grab a chair by the lake side",
    description: "Free show on the Terrace, bringing a group down after class.",
    hostName: "Priya S.",
    category: "school",
    minNeeded: null,
    capacity: null,
  },
  {
    title: "CS/ECE 354 Study Group Before the Midterm",
    startsAt: at(3, 18, 0),
    locationName: "College Library",
    locationNote: "3rd floor group study room 3316",
    description: "Going through old exams together. Bring your notes.",
    hostName: "Wei L.",
    category: "school",
    minNeeded: null,
    capacity: 8,
  },
  {
    title: "Camp Randall Tailgate",
    startsAt: at(5, 10, 0),
    locationName: "Lot 60, Camp Randall",
    locationNote: "Look for the red canopy",
    description: "Pregame food and games before kickoff. BYO chair.",
    hostName: "Maya K.",
    category: "school",
    minNeeded: null,
    capacity: 40,
  },
];

const LOCAL_PLANS = [
  {
    title: "Dane County Farmers' Market Meetup",
    startsAt: at(4, 9, 0),
    locationName: "Capitol Square",
    locationNote: "Meet at the King Street corner",
    description: "Coffee, cheese curds, and a loop around the square.",
    hostName: "Sam R.",
    category: "local",
    minNeeded: null,
    capacity: null,
  },
  {
    title: "Trivia Night at Working Draft",
    startsAt: at(6, 19, 0),
    locationName: "Working Draft Beer Company",
    locationNote: null,
    description: "Casual trivia, no pressure team. Winners get a growler.",
    hostName: "Alex D.",
    category: "local",
    minNeeded: 6,
    capacity: null,
  },
  {
    title: "Pickup Ultimate at Tenney Park",
    startsAt: at(2, 17, 30),
    locationName: "Tenney Park",
    locationNote: "North field, by the lagoon",
    description: "Casual pickup, all skill levels. Bring light/dark shirts.",
    hostName: "Chris B.",
    category: "local",
    minNeeded: 12,
    capacity: null,
  },
  {
    title: "Sunset Yoga at Olbrich Gardens",
    startsAt: at(3, 18, 30),
    locationName: "Olbrich Botanical Gardens",
    locationNote: "Great Lawn, bring your own mat",
    description: "Free-flow vinyasa as the sun sets over the gardens.",
    hostName: "Nina P.",
    category: "local",
    minNeeded: null,
    capacity: 20,
  },
  {
    title: "Board Game Night at Mint Mark",
    startsAt: at(7, 19, 0),
    locationName: "Mint Mark",
    locationNote: "Back room, ask for the Roster table",
    description: "Bringing Wingspan, Catan, and whatever else people want to play.",
    hostName: "Devon H.",
    category: "local",
    minNeeded: null,
    capacity: null,
  },
];

async function main() {
  const all = [...SCHOOL_PLANS, ...LOCAL_PLANS];

  for (const p of all) {
    const plan = await createPlan({
      title: p.title,
      startsAt: p.startsAt,
      endsAt: null,
      locationName: p.locationName,
      locationNote: p.locationNote ?? null,
      description: p.description,
      hostName: p.hostName,
      category: p.category,
      minNeeded: p.minNeeded,
      capacity: p.capacity,
      externalUrl: null,
      isPublished: true,
    });
    console.log(`Created /p/${plan.slug} — ${plan.title}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
