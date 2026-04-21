import { Layout } from "@/components/Layout";
import { usePlayer } from "@/store/playerStore";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles, Zap, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function Missions() {
  const p = usePlayer();
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2"><Sparkles className="size-3 text-hud" /> AI-Generated</div>
            <h1 className="font-display text-4xl font-bold mt-1">Missions</h1>
          </div>
          <Button variant="outline" className="border-primary/40" onClick={() => { p.rerollMissions(); toast.success("New missions deployed"); }}>
            <RefreshCw className="size-4 mr-2" /> Generate New
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {p.missions.map((m) => {
            const pct = Math.min(100, (m.progress / m.target) * 100);
            return (
              <div key={m.id} className="hud-panel corner-frame p-5 flex flex-col gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-hud font-display">{m.type}</div>
                  <div className="font-display font-bold mt-1">{m.description}</div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span><span>{m.progress}/{m.target}</span>
                  </div>
                  <div className="stat-bar"><span style={{ width: `${pct}%` }} /></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-gold"><Coins className="size-4" /> {m.rewardCoins}</span>
                    <span className="flex items-center gap-1 text-hud"><Zap className="size-4" /> {m.rewardXp}</span>
                  </div>
                  {m.claimed ? (
                    <span className="text-xs flex items-center gap-1 text-muted-foreground"><Check className="size-3" /> Claimed</span>
                  ) : (
                    <Button
                      size="sm"
                      disabled={!m.completed}
                      onClick={() => { p.claimMission(m.id); toast.success("Reward claimed"); }}
                      className="btn-glow font-display tracking-wider"
                    >
                      {m.completed ? "Claim" : "Locked"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}