export type MissionType = "kills" | "survive" | "headshots" | "score";

export interface Mission {
  id: string;
  type: MissionType;
  description: string;
  target: number;
  progress: number;
  rewardCoins: number;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
  source: "ai" | "system";
}

const TEMPLATES: Array<Omit<Mission, "id" | "progress" | "completed" | "claimed" | "source">> = [
  { type: "kills", description: "Eliminate {n} hostiles", target: 10, rewardCoins: 60, rewardXp: 40 },
  { type: "kills", description: "Take down {n} targets", target: 25, rewardCoins: 120, rewardXp: 80 },
  { type: "survive", description: "Survive {n} seconds in Rank Mode", target: 60, rewardCoins: 80, rewardXp: 60 },
  { type: "survive", description: "Hold the line for {n} seconds", target: 120, rewardCoins: 160, rewardXp: 120 },
  { type: "headshots", description: "Land {n} headshots", target: 5, rewardCoins: 100, rewardXp: 70 },
  { type: "headshots", description: "Pull off {n} clean headshots", target: 12, rewardCoins: 200, rewardXp: 140 },
  { type: "score", description: "Score {n} points in a single match", target: 200, rewardCoins: 90, rewardXp: 60 },
  { type: "score", description: "Reach {n} points in one run", target: 600, rewardCoins: 240, rewardXp: 180 },
];

export function generateMissions(level: number, count = 3): Mission[] {
  const pool = [...TEMPLATES];
  const result: Mission[] = [];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const t = pool.splice(idx, 1)[0];
    const scale = 1 + (level - 1) * 0.15;
    const target = Math.max(1, Math.round(t.target * scale));
    result.push({
      id: crypto.randomUUID(),
      type: t.type,
      description: t.description.replace("{n}", String(target)),
      target,
      progress: 0,
      rewardCoins: Math.round(t.rewardCoins * scale),
      rewardXp: Math.round(t.rewardXp * scale),
      completed: false,
      claimed: false,
      source: "system",
    });
  }
  return result;
}

export interface SessionStats {
  kills: number;
  headshots: number;
  score: number;
  surviveSeconds: number;
  shotsFired: number;
  shotsHit: number;
}

export function generateAIFeedback(s: SessionStats): string[] {
  const tips: string[] = [];
  const acc = s.shotsFired > 0 ? s.shotsHit / s.shotsFired : 0;
  if (s.shotsFired > 10 && acc < 0.35) tips.push("Your accuracy is low — slow down and aim before firing.");
  if (acc > 0.7) tips.push("Excellent accuracy! Try faster weapons to maximize damage output.");
  if (s.headshots / Math.max(1, s.kills) < 0.1 && s.kills > 5) tips.push("Aim higher — headshots double your score.");
  if (s.kills < 5 && s.surviveSeconds > 30) tips.push("You're surviving but not pushing — engage more enemies.");
  if (s.kills > 20) tips.push("Great combat performance. Consider upgrading your weapon damage.");
  if (tips.length === 0) tips.push("Solid run. Keep stacking kills to climb the ranks.");
  return tips;
}