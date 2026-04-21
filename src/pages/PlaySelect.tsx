import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Trophy, Target } from "lucide-react";

export default function PlaySelect() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Mission Briefing</div>
          <h1 className="font-display text-4xl font-bold mt-1">Select Mode</h1>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <Link to="/game/rank" className="hud-panel corner-frame p-8 hover:border-primary/60 transition-all group">
            <Trophy className="size-12 text-gold mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="font-display text-2xl font-bold tracking-wider">RANK MODE</h2>
            <p className="text-muted-foreground mt-2">Compete for rank points and climb the leaderboard. Performance affects your rank.</p>
            <div className="mt-4 text-xs text-hud uppercase tracking-[0.3em]">Awards Rank Points</div>
          </Link>
          <Link to="/game/practice" className="hud-panel corner-frame p-8 hover:border-primary/60 transition-all group">
            <Target className="size-12 text-hud mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="font-display text-2xl font-bold tracking-wider">PRACTICE</h2>
            <p className="text-muted-foreground mt-2">Free training. Test loadouts and refine your aim. No rank impact.</p>
            <div className="mt-4 text-xs text-muted-foreground uppercase tracking-[0.3em]">Coins & XP only</div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}