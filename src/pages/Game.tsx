import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePlayer } from "@/store/playerStore";
import { GameEngine, PublicState, EndResult } from "@/game/engine";
import { maxHpForLevel } from "@/game/progression";
import { Button } from "@/components/ui/button";
import { generateAIFeedback } from "@/game/missions";
import { Logo } from "@/components/Logo";
import { Pause, Play, X } from "lucide-react";

export default function Game() {
  const { mode } = useParams<{ mode: "rank" | "practice" }>();
  const nav = useNavigate();
  const player = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [state, setState] = useState<PublicState | null>(null);
  const [result, setResult] = useState<EndResult | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const w = player.weapons[player.currentWeapon];
    const eng = new GameEngine(
      canvasRef.current,
      {
        weapon: player.currentWeapon,
        upgradeLevel: w.upgradeLevel,
        level: player.level,
        maxHp: maxHpForLevel(player.level),
        mode: (mode as "rank" | "practice") ?? "rank",
      },
      { onUpdate: setState, onEnd: setResult }
    );
    engineRef.current = eng;
    eng.start();
    return () => eng.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!result) return;
    const finalRecord = player.finishMatch(
      {
        mode: result.mode,
        score: result.score,
        kills: result.kills,
        headshots: result.headshots,
        shotsFired: result.shotsFired,
        shotsHit: result.shotsHit,
        surviveSeconds: result.surviveSeconds,
      },
      result
    );
    void finalRecord;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const togglePause = () => {
    if (!engineRef.current) return;
    if (paused) { engineRef.current.start(); setPaused(false); }
    else { (engineRef.current as any).running = false; setPaused(true); }
  };

  const accuracy = result && result.shotsFired > 0 ? Math.round((result.shotsHit / result.shotsFired) * 100) : 0;
  const feedback = result ? generateAIFeedback({
    kills: result.kills, headshots: result.headshots, score: result.score,
    surviveSeconds: result.surviveSeconds, shotsFired: result.shotsFired, shotsHit: result.shotsHit,
  }) : [];

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Top HUD */}
      <div className="border-b border-primary/20 bg-background/80 backdrop-blur z-10">
        <div className="px-4 py-2 flex items-center gap-6 flex-wrap">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">HP</span>
            <div className="w-40 stat-bar"><span style={{ width: `${state ? (state.hp / state.maxHp) * 100 : 100}%` }} /></div>
            <span className="font-display font-bold text-danger w-14 text-right">{state?.hp ?? "—"}</span>
          </div>
          <div className="flex gap-4 ml-auto items-center font-display">
            <div><span className="text-xs text-muted-foreground uppercase tracking-widest mr-2">SCORE</span><span className="text-hud font-bold">{state?.score ?? 0}</span></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-widest mr-2">KILLS</span><span className="font-bold">{state?.kills ?? 0}</span></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-widest mr-2">WAVE</span><span className="text-warn font-bold">{state?.wave ?? 1}</span></div>
            {state && state.combo > 1 && <div className="text-gold font-bold animate-pulse">x{state.combo} COMBO</div>}
            <div className="text-xs text-muted-foreground uppercase tracking-widest hidden md:block">{state?.weaponName} · AMMO {state?.ammoText}</div>
            <Button size="sm" variant="ghost" onClick={togglePause}>{paused ? <Play className="size-4" /> : <Pause className="size-4" />}</Button>
            <Button size="sm" variant="ghost" onClick={() => engineRef.current?.endNow()}><X className="size-4" /></Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />
        {paused && !result && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
            <div className="hud-panel corner-frame p-8 text-center">
              <h2 className="font-display text-3xl font-bold mb-4">PAUSED</h2>
              <Button onClick={togglePause} className="btn-glow">Resume</Button>
            </div>
          </div>
        )}
        {result && (
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center z-20 p-4 overflow-auto">
            <div className="hud-panel corner-frame p-8 max-w-lg w-full space-y-5 animate-float-up">
              <div className="text-center">
                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Mission Complete</div>
                <h2 className="font-display text-4xl font-bold text-hud mt-2">ELIMINATED</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Score" value={result.score} accent />
                <Stat label="Kills" value={result.kills} />
                <Stat label="Headshots" value={result.headshots} />
                <Stat label="Accuracy" value={`${accuracy}%`} />
                <Stat label="Survived" value={`${result.surviveSeconds.toFixed(0)}s`} />
                <Stat label="Mode" value={result.mode.toUpperCase()} />
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="text-xs uppercase tracking-[0.3em] text-hud font-display">AI ANALYSIS</div>
                {feedback.map((f, i) => <p key={i} className="text-sm text-muted-foreground">› {f}</p>)}
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 btn-glow" onClick={() => nav("/lobby")}>Lobby</Button>
                <Button variant="outline" className="flex-1 border-primary/40" onClick={() => { setResult(null); nav(0); }}>Retry</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const Stat = ({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) => (
  <div className="bg-muted/30 px-3 py-2 rounded-sm border border-border/40">
    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    <div className={`font-display font-bold text-lg ${accent ? "text-hud" : ""}`}>{value}</div>
  </div>
);