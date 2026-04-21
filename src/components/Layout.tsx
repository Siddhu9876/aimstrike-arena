import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePlayer } from "@/store/playerStore";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const Layout = ({ children }: { children: ReactNode }) => {
  const { name, isGuest, logout } = usePlayer();
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/60 backdrop-blur-sm bg-background/40 sticky top-0 z-30">
        <div className="container flex items-center justify-between py-3">
          <Link to="/lobby" className="flex items-center gap-3">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-widest">Operator</div>
              <div className="font-display font-bold text-sm">{name} {isGuest && <span className="text-[10px] text-warn">GUEST</span>}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { logout(); nav("/"); }} aria-label="Logout">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8 animate-float-up">{children}</main>
    </div>
  );
};