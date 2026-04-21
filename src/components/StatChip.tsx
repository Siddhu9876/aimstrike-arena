import { ReactNode } from "react";

export const StatChip = ({ label, value, accent, icon }: { label: string; value: ReactNode; accent?: "primary" | "gold" | "danger" | "warn"; icon?: ReactNode }) => {
  const color =
    accent === "primary" ? "text-hud" :
    accent === "gold" ? "text-gold" :
    accent === "danger" ? "text-danger" :
    accent === "warn" ? "text-warn" : "text-foreground";
  return (
    <div className="hud-panel corner-frame px-4 py-3 flex items-center gap-3">
      {icon && <div className={`${color}`}>{icon}</div>}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-display">{label}</span>
        <span className={`text-xl font-display font-bold ${color}`}>{value}</span>
      </div>
    </div>
  );
};