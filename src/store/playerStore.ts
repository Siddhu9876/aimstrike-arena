import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WEAPONS, WeaponId } from "@/game/weapons";
import { maxHpForLevel, xpForNextLevel } from "@/game/progression";
import { generateMissions, Mission, SessionStats } from "@/game/missions";

export interface WeaponState {
  unlocked: boolean;
  upgradeLevel: number;
}

export interface MatchRecord {
  id: string;
  date: number;
  mode: "rank" | "practice";
  score: number;
  kills: number;
  headshots: number;
  shotsFired: number;
  shotsHit: number;
  surviveSeconds: number;
  rankPointsGained: number;
}

interface PlayerState {
  // identity
  id: string | null;
  name: string;
  isGuest: boolean;
  // stats
  level: number;
  xp: number;
  hp: number;
  coins: number;
  rankPoints: number;
  currentWeapon: WeaponId;
  weapons: Record<WeaponId, WeaponState>;
  // meta
  totalKills: number;
  totalHeadshots: number;
  totalShotsFired: number;
  totalShotsHit: number;
  highScore: number;
  matches: MatchRecord[];
  missions: Mission[];
  feedback: string[];
  // actions
  login: (name: string, guest?: boolean) => void;
  logout: () => void;
  setWeapon: (id: WeaponId) => void;
  upgradeWeapon: (id: WeaponId, cost: number) => boolean;
  spendCoins: (n: number) => boolean;
  addCoins: (n: number) => void;
  buyHpBoost: (cost: number) => boolean;
  finishMatch: (record: Omit<MatchRecord, "id" | "date" | "rankPointsGained"> & { mode: "rank" | "practice" }, stats: SessionStats) => MatchRecord;
  rerollMissions: () => void;
  claimMission: (id: string) => void;
}

const initialWeapons = (level: number): Record<WeaponId, WeaponState> => {
  const out = {} as Record<WeaponId, WeaponState>;
  (Object.keys(WEAPONS) as WeaponId[]).forEach((id) => {
    out[id] = { unlocked: WEAPONS[id].unlockLevel <= level, upgradeLevel: 0 };
  });
  return out;
};

const fresh = (name: string, guest: boolean): Partial<PlayerState> => ({
  id: crypto.randomUUID(),
  name,
  isGuest: guest,
  level: 1, xp: 0, hp: 100, coins: 50, rankPoints: 0,
  currentWeapon: "pistol",
  weapons: initialWeapons(1),
  totalKills: 0, totalHeadshots: 0, totalShotsFired: 0, totalShotsHit: 0, highScore: 0,
  matches: [], missions: generateMissions(1, 3), feedback: [],
});

export const usePlayer = create<PlayerState>()(
  persist(
    (set, get) => ({
      id: null, name: "", isGuest: false,
      level: 1, xp: 0, hp: 100, coins: 0, rankPoints: 0,
      currentWeapon: "pistol",
      weapons: initialWeapons(1),
      totalKills: 0, totalHeadshots: 0, totalShotsFired: 0, totalShotsHit: 0, highScore: 0,
      matches: [], missions: [], feedback: [],

      login: (name, guest = false) => set(() => fresh(name || (guest ? "Recruit" : "Operator"), guest) as PlayerState),
      logout: () => set({ id: null, name: "", isGuest: false }),

      setWeapon: (id) => {
        const w = get().weapons[id];
        if (w?.unlocked) set({ currentWeapon: id });
      },
      upgradeWeapon: (id, cost) => {
        const s = get();
        if (s.coins < cost) return false;
        const w = s.weapons[id];
        if (!w || !w.unlocked) return false;
        set({
          coins: s.coins - cost,
          weapons: { ...s.weapons, [id]: { ...w, upgradeLevel: w.upgradeLevel + 1 } },
        });
        return true;
      },
      spendCoins: (n) => {
        const s = get();
        if (s.coins < n) return false;
        set({ coins: s.coins - n });
        return true;
      },
      addCoins: (n) => set({ coins: get().coins + n }),
      buyHpBoost: (cost) => {
        const s = get();
        if (s.coins < cost) return false;
        set({ coins: s.coins - cost, hp: Math.min(maxHpForLevel(s.level), s.hp + 50) });
        return true;
      },

      finishMatch: (record, stats) => {
        const s = get();
        // XP & level up
        let xp = s.xp + Math.round(record.score * 0.5 + record.kills * 5);
        let level = s.level;
        let leveledUp = false;
        while (xp >= xpForNextLevel(level)) {
          xp -= xpForNextLevel(level);
          level += 1;
          leveledUp = true;
        }
        // Unlock weapons by level
        const weapons = { ...s.weapons };
        (Object.keys(WEAPONS) as WeaponId[]).forEach((id) => {
          if (WEAPONS[id].unlockLevel <= level && !weapons[id].unlocked) {
            weapons[id] = { ...weapons[id], unlocked: true };
          }
        });
        // Rank points only in rank mode
        const rankGain = record.mode === "rank" ? Math.round(record.score / 4) : 0;
        // Update missions progress
        const missions = s.missions.map((m) => {
          if (m.completed) return m;
          let p = m.progress;
          if (m.type === "kills") p += stats.kills;
          if (m.type === "headshots") p += stats.headshots;
          if (m.type === "score") p = Math.max(p, stats.score);
          if (m.type === "survive") p = Math.max(p, Math.floor(stats.surviveSeconds));
          const completed = p >= m.target;
          return { ...m, progress: Math.min(m.target, p), completed };
        });
        const finalRecord: MatchRecord = {
          ...record,
          id: crypto.randomUUID(),
          date: Date.now(),
          rankPointsGained: rankGain,
        };
        set({
          xp, level,
          hp: leveledUp ? maxHpForLevel(level) : s.hp,
          coins: s.coins + Math.round(record.kills * 3 + record.score * 0.1),
          rankPoints: s.rankPoints + rankGain,
          weapons,
          totalKills: s.totalKills + record.kills,
          totalHeadshots: s.totalHeadshots + record.headshots,
          totalShotsFired: s.totalShotsFired + record.shotsFired,
          totalShotsHit: s.totalShotsHit + record.shotsHit,
          highScore: Math.max(s.highScore, record.score),
          matches: [finalRecord, ...s.matches].slice(0, 30),
          missions,
        });
        return finalRecord;
      },

      rerollMissions: () => set({ missions: generateMissions(get().level, 3) }),
      claimMission: (id) => {
        const s = get();
        const m = s.missions.find((x) => x.id === id);
        if (!m || !m.completed || m.claimed) return;
        set({
          coins: s.coins + m.rewardCoins,
          xp: s.xp + m.rewardXp,
          missions: s.missions.map((x) => (x.id === id ? { ...x, claimed: true } : x)),
        });
      },
    }),
    { name: "aimstrike-player" }
  )
);

export const isLoggedIn = (s: PlayerState) => !!s.id;