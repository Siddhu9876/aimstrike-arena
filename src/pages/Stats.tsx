import { Layout } from "@/components/Layout";
import { usePlayer } from "@/store/playerStore";
import { rankFromPoints } from "@/game/progression";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";

export default function Stats() {
  const p = usePlayer();
  const acc = p.totalShotsFired > 0 ? Math.round((p.totalShotsHit / p.totalShotsFired) * 100) : 0;
  const rank = rankFromPoints(p.rankPoints);

  const series = [...p.matches].reverse().map((m, i) => ({
    idx: `#${i + 1}`,
    score: m.score,
    kills: m.kills,
    rp: m.rankPointsGained,
  }));

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Combat Analytics</div>
          <h1 className="font-display text-4xl font-bold mt-1">Statistics</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card label="Total Kills" value={p.totalKills} />
          <Card label="Headshots" value={p.totalHeadshots} accent="gold" />
          <Card label="Accuracy" value={`${acc}%`} accent="primary" />
          <Card label="High Score" value={p.highScore} accent="primary" />
          <Card label="Rank" value={rank.name} accent={rank.color === "gold" ? "gold" : "primary"} />
          <Card label="Rank Points" value={p.rankPoints} />
          <Card label="Matches" value={p.matches.length} />
          <Card label="Shots Fired" value={p.totalShotsFired} />
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="hud-panel corner-frame p-5">
            <div className="font-display tracking-wider text-sm mb-4">SCORE HISTORY</div>
            {series.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={series}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="idx" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
          <div className="hud-panel corner-frame p-5">
            <div className="font-display tracking-wider text-sm mb-4">KILLS PER MATCH</div>
            {series.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={series}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="idx" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="kills" fill="hsl(var(--warn))" />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
        </div>

        <div className="hud-panel corner-frame p-5">
          <div className="font-display tracking-wider text-sm mb-4">RECENT MATCHES</div>
          {p.matches.length === 0 ? <Empty /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                    <th className="py-2">Date</th><th>Mode</th><th>Score</th><th>Kills</th><th>HS</th><th>Acc</th><th>RP</th>
                  </tr>
                </thead>
                <tbody>
                  {p.matches.map((m) => {
                    const a = m.shotsFired > 0 ? Math.round((m.shotsHit / m.shotsFired) * 100) : 0;
                    return (
                      <tr key={m.id} className="border-b border-border/40 font-display">
                        <td className="py-2 text-muted-foreground">{new Date(m.date).toLocaleString()}</td>
                        <td className={m.mode === "rank" ? "text-gold" : "text-muted-foreground"}>{m.mode.toUpperCase()}</td>
                        <td className="text-hud font-bold">{m.score}</td>
                        <td>{m.kills}</td>
                        <td>{m.headshots}</td>
                        <td>{a}%</td>
                        <td className="text-warn">+{m.rankPointsGained}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

const Card = ({ label, value, accent }: { label: string; value: React.ReactNode; accent?: "gold" | "primary" }) => (
  <div className="hud-panel corner-frame p-4">
    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    <div className={`font-display font-bold text-2xl mt-1 ${accent === "gold" ? "text-gold" : accent === "primary" ? "text-hud" : ""}`}>{value}</div>
  </div>
);

const Empty = () => <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No matches yet — go deploy.</div>;