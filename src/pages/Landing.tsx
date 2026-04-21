import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/store/playerStore";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crosshair, Play, UserCircle2, Zap } from "lucide-react";

export default function Landing() {
  const nav = useNavigate();
  const { id, name: existingName, login } = usePlayer();
  const [name, setName] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute inset-0 scanlines pointer-events-none opacity-40" />
      <header className="container py-6 flex items-center justify-between">
        <Logo size="sm" />
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground hidden sm:block">v1.0 // tactical_arena</span>
      </header>

      <section className="container flex-1 grid lg:grid-cols-2 gap-12 items-center py-10">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/40 rounded-sm text-xs uppercase tracking-[0.3em] text-hud bg-primary/5">
            <Zap className="size-3" /> AI-Enhanced Combat
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl leading-[0.95] tracking-tight">
            <span className="block">AIM. ADAPT.</span>
            <span className="block text-hud">DOMINATE.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            A top-down arena shooter powered by adaptive AI missions and dynamic difficulty.
            Climb from <span className="text-bronze">Bronze</span> to <span className="text-gold">Gold</span> across endless waves.
          </p>

          {!showLogin ? (
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="btn-glow font-display tracking-widest text-base px-8" onClick={() => setShowLogin(true)}>
                <Play className="size-5 mr-2" /> START GAME
              </Button>
              {id && (
                <Button size="lg" variant="outline" className="font-display tracking-widest text-base px-8 border-primary/40" onClick={() => nav("/lobby")}>
                  CONTINUE AS {existingName.toUpperCase()}
                </Button>
              )}
            </div>
          ) : (
            <div className="hud-panel corner-frame p-6 max-w-md space-y-4 animate-float-up">
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Operator Identification</div>
              <Input
                placeholder="Enter callsign..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/60 border-primary/30 font-display tracking-wider text-lg h-12"
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  className="btn-glow flex-1 font-display tracking-widest"
                  disabled={!name.trim()}
                  onClick={() => { login(name.trim(), false); nav("/lobby"); }}
                >
                  <UserCircle2 className="size-4 mr-2" /> ENLIST
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 font-display tracking-widest border-primary/40"
                  onClick={() => { login("Recruit", true); nav("/lobby"); }}
                >
                  GUEST RUN
                </Button>
              </div>
              <button onClick={() => setShowLogin(false)} className="text-xs text-muted-foreground hover:text-foreground">← back</button>
            </div>
          )}

          <div className="flex flex-wrap gap-6 pt-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <span><span className="text-hud font-bold">04</span> WEAPONS</span>
            <span><span className="text-hud font-bold">∞</span> WAVES</span>
            <span><span className="text-hud font-bold">AI</span> MISSIONS</span>
          </div>
        </div>

        <div className="relative aspect-square max-w-lg mx-auto w-full hidden lg:block">
          <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse-glow" />
          <div className="absolute inset-8 rounded-full border border-primary/20" />
          <div className="absolute inset-20 rounded-full border border-primary/15" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Crosshair className="size-48 text-hud" strokeWidth={1} />
          </div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
          <div className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.3em] text-hud font-display">SECTOR 7</div>
          <div className="absolute bottom-4 right-4 text-[10px] uppercase tracking-[0.3em] text-hud font-display">LOCK ON</div>
        </div>
      </section>

      <footer className="container py-4 text-center text-xs text-muted-foreground uppercase tracking-[0.3em]">
        Built for combat-ready operators
      </footer>
    </div>
  );
}