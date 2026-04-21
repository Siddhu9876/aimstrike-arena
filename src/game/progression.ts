export function maxHpForLevel(level: number) {
  // L1=100, L5=140, L10=200 → +10 per level
  return 100 + (level - 1) * 10;
}

export function xpForNextLevel(level: number) {
  return 80 + level * 60;
}

export function rankFromPoints(points: number) {
  if (points >= 700) return { name: "Gold", color: "gold" as const, next: null };
  if (points >= 300) return { name: "Silver", color: "silver" as const, next: 700 };
  if (points >= 100) return { name: "Bronze", color: "bronze" as const, next: 300 };
  return { name: "Unranked", color: "muted-foreground" as const, next: 100 };
}