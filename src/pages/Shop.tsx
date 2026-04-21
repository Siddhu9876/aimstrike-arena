import { Layout } from "@/components/Layout";
import { usePlayer } from "@/store/playerStore";
import { Button } from "@/components/ui/button";
import { Coins, Heart, Crosshair, Palette } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const ShopItem = ({ icon: Icon, title, desc, cost, onBuy, disabled }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; cost: number; onBuy: () => void; disabled?: boolean }) => (
  <div className="hud-panel corner-frame p-5 flex flex-col gap-3">
    <Icon className="size-8 text-hud" />
    <div>
      <div className="font-display font-bold text-lg">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
    <Button onClick={onBuy} disabled={disabled} className="btn-glow font-display tracking-wider">
      <Coins className="size-4 mr-1" /> {cost}
    </Button>
  </div>
);

export default function Shop() {
  const p = usePlayer();
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Black Market</div>
            <h1 className="font-display text-4xl font-bold mt-1">Shop</h1>
          </div>
          <div className="flex items-center gap-2 text-gold font-display text-lg"><Coins className="size-5" /> {p.coins}</div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <ShopItem icon={Heart} title="HP Boost" desc="Restore +50 HP instantly" cost={40} disabled={p.coins < 40} onBuy={() => { p.buyHpBoost(40) ? toast.success("+50 HP") : toast.error("Not enough coins"); }} />
          <Link to="/weapons" className="hud-panel corner-frame p-5 flex flex-col gap-3 hover:border-primary/60 transition-all">
            <Crosshair className="size-8 text-hud" />
            <div>
              <div className="font-display font-bold text-lg">Weapon Upgrades</div>
              <div className="text-xs text-muted-foreground">Boost damage, fire rate & accuracy</div>
            </div>
            <Button variant="outline" className="border-primary/40 font-display tracking-wider">Open Armory →</Button>
          </Link>
          <ShopItem icon={Palette} title="Operator Skin" desc="Cosmetic — coming soon" cost={500} disabled onBuy={() => {}} />
        </div>
      </div>
    </Layout>
  );
}