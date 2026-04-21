import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { StatChip } from "@/components/StatChip";
import { usePlayer } from "@/store/playerStore";
import { WEAPONS, WeaponId, upgradeCost } from "@/game/weapons";
import { WEAPON_IMAGES } from "@/assets/weapons";
import { maxHpForLevel, rankFromPoints, xpForNextLevel } from "@/game/progression";
import { Heart, Coins, Trophy, Zap, Crosshair, Target, ShoppingBag, BarChart3, Swords, ListChecks, Lock, Check, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NavCard = ({ to, icon: Icon, title, sub }: { to: string; icon: React.ComponentType<{ className?: string }>; title: string; sub: string }) => (
  <Link to={to} className="hud-panel corner-frame p-5 flex flex-col gap-3 group hover:border-primary/60 transition-all">
    <Icon className="size-7 text-hud group-hover:scale-110 transition-transform" />
    <div>
      <div className="font-display font-bold tracking-wider">{title}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  </Link>
);

export default function Lobby() {
  const p = usePlayer();
  const rank = rankFromPoints(p.rankPoints);
  const maxHp = maxHpForLevel(p.level);
  const nextXp = xpForNextLevel(p.level);
  const weapon = WEAPONS[p.currentWeapon];
  const activeMissions = p.missions.filter((m) => !m.claimed).length;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Command Center</div>
            <h1 className="font-display text-4xl font-bold mt-1">Welcome back, <span className="text-hud">{p.name}</span></h1>
          </div>
          <Link to="/play">
            <Button size="lg" className="btn-glow font-display tracking-widest text-base px-8">
              <Swords className="size-5 mr-2" /> DEPLOY
            </Button>
          </Link>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatChip label="Level" value={p.level} accent="primary" icon={<Zap className="size-5" />} />
          <StatChip label="HP" value={`${p.hp}/${maxHp}`} accent="danger" icon={<Heart className="size-5" />} />
          <StatChip label="Coins" value={p.coins} accent="gold" icon={<Coins className="size-5" />} />
          <StatChip label="Rank Pts" value={p.rankPoints} accent="warn" icon={<Trophy className="size-5" />} />
          <StatChip label="Rank" value={rank.name} accent={rank.color === "gold" ? "gold" : rank.color === "silver" ? "primary" : "warn"} icon={<Target className="size-5" />} />
          <StatChip label="Weapon" value={weapon.name.split(" ")[0]} accent="primary" icon={<Crosshair className="size-5" />} />
        </div>

        {/* XP bar */}
        <div className="hud-panel corner-frame p-5">
          <div className="flex justify-between items-center mb-2">
            <div className="font-display tracking-wider text-sm">XP PROGRESS</div>
            <div className="text-xs text-muted-foreground font-mono">{p.xp} / {nextXp}</div>
          </div>
          <div className="stat-bar">
            <span style={{ width: `${Math.min(100, (p.xp / nextXp) * 100)}%` }} />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Next unlock at L{Object.values(WEAPONS).find((w) => w.unlockLevel > p.level)?.unlockLevel ?? "—"}
            {" · "} {rank.next ? `${rank.next - p.rankPoints} RP to next rank` : "Max rank achieved"}
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <NavCard to="/play" icon={Swords} title="Play" sub="Rank or practice" />
          <NavCard to="/weapons" icon={Crosshair} title="Weapons" sub="Loadout & upgrades" />
          <NavCard to="/missions" icon={ListChecks} title="Missions" sub={`${activeMissions} active`} />
          <NavCard to="/shop" icon={ShoppingBag} title="Shop" sub="Spend coins" />
          <NavCard to="/stats" icon={BarChart3} title="Stats" sub="Performance" />
        </div>

        {/* Weapon Purchase Showcase */}
        <div>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Armory</div>
              <h2 className="font-display text-2xl font-bold mt-1">Weapon Purchase</h2>
            </div>
            <Link to="/weapons" className="text-xs text-hud font-display tracking-wider hover:underline">VIEW ALL →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(WEAPONS) as WeaponId[]).map((id) => {
              const def = WEAPONS[id];
              const ws = p.weapons[id];
              const cost = upgradeCost(ws.upgradeLevel);
              const equipped = p.currentWeapon === id;
              const locked = !ws.unlocked;
              const maxed = ws.upgradeLevel >= 10;
              return (
                <div key={id} className={`hud-panel corner-frame p-3 flex flex-col gap-3 ${equipped ? "ring-1 ring-primary/60" : ""}`}>
                  <div className="relative aspect-square overflow-hidden bg-black/60 border border-border/60">
                    <img
                      src={WEAPON_IMAGES[id]}
                      alt={`${def.name} weapon icon`}
                      loading="lazy"
                      width={512}
                      height={512}
                      className={`w-full h-full object-contain transition-transform ${locked ? "opacity-30 grayscale" : "group-hover:scale-105"}`}
                    />
                    {locked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs px-2 py-1 bg-muted/90 text-muted-foreground font-display tracking-wider flex items-center gap-1">
                          <Lock className="size-3" /> L{def.unlockLevel}
                        </span>
                      </div>
                    )}
                    {equipped && (
                      <span className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 bg-primary/30 text-hud font-display tracking-wider">EQUIPPED</span>
                    )}
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm tracking-wider truncate">{def.name}</div>
                    <div className="text-[10px] text-muted-foreground">Lv {ws.upgradeLevel}/10</div>
                  </div>
                  <Button
                    size="sm"
                    disabled={locked || maxed || p.coins < cost}
                    onClick={() => {
                      if (p.upgradeWeapon(id, cost)) toast.success(`${def.name} upgraded`);
                      else toast.error("Not enough coins");
                    }}
                    className="btn-glow font-display tracking-wider text-xs"
                  >
                    {maxed ? <><Check className="size-3 mr-1" /> MAX</> : <><ArrowUp className="size-3 mr-1" /> {cost}c</>}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}