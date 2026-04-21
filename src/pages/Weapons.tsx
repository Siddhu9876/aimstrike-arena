import { Layout } from "@/components/Layout";
import { usePlayer } from "@/store/playerStore";
import { WEAPONS, WeaponId, weaponStats, upgradeCost } from "@/game/weapons";
import { WEAPON_IMAGES } from "@/assets/weapons";
import { Button } from "@/components/ui/button";
import { Check, Lock, Coins, ArrowUp } from "lucide-react";
import { toast } from "sonner";

const Bar = ({ label, value, max = 1 }: { label: string; value: number; max?: number }) => (
  <div>
    <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
      <span>{label}</span><span>{(value * 100 / max).toFixed(0)}%</span>
    </div>
    <div className="stat-bar"><span style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div>
  </div>
);

export default function Weapons() {
  const p = usePlayer();
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Armory</div>
            <h1 className="font-display text-4xl font-bold mt-1">Weapons</h1>
          </div>
          <div className="flex items-center gap-2 text-gold font-display"><Coins className="size-4" /> {p.coins}</div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {(Object.keys(WEAPONS) as WeaponId[]).map((id) => {
            const def = WEAPONS[id];
            const ws = p.weapons[id];
            const stats = weaponStats(def, ws.upgradeLevel);
            const cost = upgradeCost(ws.upgradeLevel);
            const equipped = p.currentWeapon === id;
            return (
              <div key={id} className={`hud-panel corner-frame p-5 space-y-4 ${equipped ? "ring-1 ring-primary/60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="size-20 shrink-0 bg-black/60 border border-border/60 overflow-hidden">
                      <img
                        src={WEAPON_IMAGES[id]}
                        alt={`${def.name} weapon icon`}
                        loading="lazy"
                        width={512}
                        height={512}
                        className={`w-full h-full object-contain ${!ws.unlocked ? "opacity-30 grayscale" : ""}`}
                      />
                    </div>
                    <div>
                      <div className="font-display font-bold text-xl tracking-wider">{def.name}</div>
                      <div className="text-xs text-muted-foreground">{def.description}</div>
                    </div>
                  </div>
                  {ws.unlocked ? (
                    equipped ? (
                      <span className="text-xs px-2 py-1 bg-primary/20 text-hud font-display tracking-wider">EQUIPPED</span>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => { p.setWeapon(id); toast.success(`${def.name} equipped`); }} className="border-primary/40">Equip</Button>
                    )
                  ) : (
                    <span className="text-xs px-2 py-1 bg-muted text-muted-foreground font-display tracking-wider flex items-center gap-1"><Lock className="size-3" /> L{def.unlockLevel}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Bar label="Damage" value={stats.damage} max={80} />
                  <Bar label="Fire Rate" value={stats.fireRate} max={15} />
                  <Bar label="Accuracy" value={stats.accuracy} max={1} />
                  <Bar label="Upgrade Lv" value={ws.upgradeLevel} max={10} />
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <div className="text-xs text-muted-foreground">Upgrade Lv {ws.upgradeLevel}</div>
                  <Button
                    size="sm"
                    disabled={!ws.unlocked || p.coins < cost || ws.upgradeLevel >= 10}
                    onClick={() => {
                      if (p.upgradeWeapon(id, cost)) toast.success(`${def.name} upgraded`);
                      else toast.error("Not enough coins");
                    }}
                    className="btn-glow font-display tracking-wider"
                  >
                    {ws.upgradeLevel >= 10 ? <><Check className="size-3 mr-1" /> MAX</> : <><ArrowUp className="size-3 mr-1" /> {cost}c</>}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}