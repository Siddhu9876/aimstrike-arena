export type WeaponId = "pistol" | "dual_pistol" | "smg" | "rifle";

export interface WeaponDef {
  id: WeaponId;
  name: string;
  unlockLevel: number;
  baseDamage: number;
  baseFireRate: number; // shots per second
  baseAccuracy: number; // 0..1
  bullets: number; // bullets per shot
  spread: number; // radians
  color: string;
  description: string;
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  pistol: {
    id: "pistol", name: "Basic Pistol", unlockLevel: 1,
    baseDamage: 18, baseFireRate: 3, baseAccuracy: 0.9,
    bullets: 1, spread: 0.04,
    color: "hsl(var(--muted-foreground))",
    description: "Reliable sidearm. Balanced and accurate.",
  },
  dual_pistol: {
    id: "dual_pistol", name: "Dual Pistols", unlockLevel: 3,
    baseDamage: 14, baseFireRate: 5, baseAccuracy: 0.85,
    bullets: 2, spread: 0.12,
    color: "hsl(var(--warn))",
    description: "Twin pistols. Higher rate of fire.",
  },
  smg: {
    id: "smg", name: "SMG", unlockLevel: 5,
    baseDamage: 11, baseFireRate: 9, baseAccuracy: 0.7,
    bullets: 1, spread: 0.18,
    color: "hsl(var(--primary))",
    description: "Rapid fire, lower accuracy.",
  },
  rifle: {
    id: "rifle", name: "Assault Rifle", unlockLevel: 8,
    baseDamage: 28, baseFireRate: 6, baseAccuracy: 0.92,
    bullets: 1, spread: 0.05,
    color: "hsl(var(--gold))",
    description: "High damage, precise long-range.",
  },
};

export function weaponStats(def: WeaponDef, upgradeLevel: number) {
  const u = upgradeLevel;
  return {
    damage: Math.round(def.baseDamage * (1 + u * 0.18)),
    fireRate: +(def.baseFireRate * (1 + u * 0.08)).toFixed(2),
    accuracy: Math.min(0.99, +(def.baseAccuracy + u * 0.015).toFixed(3)),
    spread: Math.max(0.005, def.spread * (1 - u * 0.05)),
  };
}

export function upgradeCost(currentLevel: number) {
  return 80 + currentLevel * 60;
}