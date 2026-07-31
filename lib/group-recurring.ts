export interface RecurringGroup<T> {
  primary: T;
  otherDates: T[];
}

// Groups plans that look like recurring instances of the same thing (same
// title + location) so lists can show one card per series instead of one
// per occurrence. Each occurrence is still its own real plan — this only
// affects how they're displayed together, not the underlying data.
//
// The soonest occurrence becomes the card shown, unless one in the group is
// featured — a featured occurrence always becomes the primary so it's the
// one that actually gets highlighted.
export function groupRecurring<
  T extends { title: string; locationName: string; startsAt: Date | string; isFeatured?: boolean },
>(plans: T[]): RecurringGroup<T>[] {
  const groups = new Map<string, T[]>();

  for (const plan of plans) {
    const key = `${plan.title}::${plan.locationName}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(plan);
  }

  const result: RecurringGroup<T>[] = [];
  for (const group of groups.values()) {
    const sorted = [...group].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );
    const featuredIndex = sorted.findIndex((p) => p.isFeatured);
    const primaryIndex = featuredIndex !== -1 ? featuredIndex : 0;
    const primary = sorted[primaryIndex];
    const otherDates = sorted.filter((_, i) => i !== primaryIndex);
    result.push({ primary, otherDates });
  }

  // Preserve overall soonest-first ordering across groups, featured groups first.
  return result.sort((a, b) => {
    const aFeatured = a.primary.isFeatured ? 0 : 1;
    const bFeatured = b.primary.isFeatured ? 0 : 1;
    if (aFeatured !== bFeatured) return aFeatured - bFeatured;
    return new Date(a.primary.startsAt).getTime() - new Date(b.primary.startsAt).getTime();
  });
}
