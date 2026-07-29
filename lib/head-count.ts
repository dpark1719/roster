export interface ResponseSummary {
  displayName: string;
  status: string;
}

export interface Plan {
  minNeeded: number | null;
  capacity: number | null;
}

export interface HeadCountResult {
  line: string;
  inCount: number;
  maybeCount: number;
  isFull: boolean;
  isMet: boolean;
}

export function computeHeadCount(
  plan: Plan,
  responses: ResponseSummary[]
): HeadCountResult {
  const inResponses = responses.filter((r) => r.status === "in");
  const maybeResponses = responses.filter((r) => r.status === "maybe");
  const inCount = inResponses.length;
  const maybeCount = maybeResponses.length;

  const isFull = plan.capacity != null && inCount >= plan.capacity;

  if (plan.minNeeded != null) {
    const isMet = inCount >= plan.minNeeded;
    if (isMet) {
      return {
        line: `${inCount} of ${plan.minNeeded} in — we're on`,
        inCount,
        maybeCount,
        isFull,
        isMet,
      };
    }
    const remaining = plan.minNeeded - inCount;
    return {
      line: `${inCount} of ${plan.minNeeded} in — need ${remaining} more`,
      inCount,
      maybeCount,
      isFull,
      isMet,
    };
  }

  if (inCount === 0) {
    return {
      line: "Be the first",
      inCount,
      maybeCount,
      isFull,
      isMet: false,
    };
  }

  if (inCount === 1) {
    return {
      line: `${inResponses[0].displayName} is in`,
      inCount,
      maybeCount,
      isFull,
      isMet: true,
    };
  }

  const [first, second] = inResponses;
  const others = inCount - 2;

  if (others <= 0) {
    return {
      line: `${first.displayName} and ${second.displayName} are in`,
      inCount,
      maybeCount,
      isFull,
      isMet: true,
    };
  }

  return {
    line: `${first.displayName}, ${second.displayName} and ${others} other${
      others === 1 ? "" : "s"
    } are in`,
    inCount,
    maybeCount,
    isFull,
    isMet: true,
  };
}
