const PALETTE = [
  ["#eef2ff", "#4f46e5"],
  ["#fef3c7", "#b45309"],
  ["#dcfce7", "#15803d"],
  ["#fce7f3", "#be185d"],
  ["#e0f2fe", "#0369a1"],
  ["#fee2e2", "#b91c1c"],
] as const;

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function avatarColorFor(name: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const [bg, fg] = PALETTE[hash % PALETTE.length];
  return { bg, fg };
}
