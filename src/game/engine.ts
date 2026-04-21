import { WEAPONS, WeaponId, weaponStats } from "./weapons";

export type GameMode = "rank" | "practice";

export interface EngineCallbacks {
  onUpdate: (state: PublicState) => void;
  onEnd: (result: EndResult) => void;
}

export interface PublicState {
  hp: number;
  maxHp: number;
  score: number;
  kills: number;
  headshots: number;
  combo: number;
  wave: number;
  timeSec: number;
  ammoText: string;
  weaponName: string;
  difficulty: number;
}

export interface EndResult {
  score: number;
  kills: number;
  headshots: number;
  shotsFired: number;
  shotsHit: number;
  surviveSeconds: number;
  mode: GameMode;
}

interface Enemy {
  x: number; y: number; r: number;
  hp: number; maxHp: number;
  speed: number; damage: number;
  color: string;
  glow: string;
  shape: "circle" | "triangle" | "square" | "diamond" | "hex";
  rot: number;
  rotSpeed: number;
  hitFlash: number;
}
interface Bullet {
  x: number; y: number; vx: number; vy: number;
  damage: number; life: number;
}
interface Coin { x: number; y: number; vy: number; r: number; value: number; life: number; }
interface Pop { x: number; y: number; text: string; life: number; color: string; }

export interface EngineConfig {
  weapon: WeaponId;
  upgradeLevel: number;
  level: number;
  maxHp: number;
  mode: GameMode;
}

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private cb: EngineCallbacks;
  private cfg: EngineConfig;
  private raf = 0;
  private last = 0;
  private running = false;

  // entities
  private px = 0; private py = 0; private pr = 14;
  private mx = 0; private my = 0;
  private mouseDown = false;
  private spaceDown = false;
  private keys: Record<string, boolean> = {};
  private hp: number; private maxHp: number;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private coins: Coin[] = [];
  private pops: Pop[] = [];

  // stats
  private score = 0;
  private kills = 0;
  private headshots = 0;
  private combo = 0;
  private comboTimer = 0;
  private shotsFired = 0;
  private shotsHit = 0;
  private timeSec = 0;
  private spawnTimer = 0;
  private fireTimer = 0;
  private wave = 1;
  private waveTimer = 0;
  private difficulty = 1;
  private invuln = 0;

  constructor(canvas: HTMLCanvasElement, cfg: EngineConfig, cb: EngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.cfg = cfg;
    this.cb = cb;
    this.maxHp = cfg.maxHp;
    this.hp = cfg.maxHp;
    this.resize();
    window.addEventListener("resize", this.resize);
    canvas.addEventListener("mousemove", this.onMouseMove);
    canvas.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    canvas.addEventListener("touchstart", this.onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", this.onTouchMove, { passive: false });
    canvas.addEventListener("touchend", this.onTouchEnd);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  start() {
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.resize);
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    this.canvas.removeEventListener("touchstart", this.onTouchStart);
    this.canvas.removeEventListener("touchmove", this.onTouchMove);
    this.canvas.removeEventListener("touchend", this.onTouchEnd);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  endNow() {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.cb.onEnd({
      score: this.score, kills: this.kills, headshots: this.headshots,
      shotsFired: this.shotsFired, shotsHit: this.shotsHit,
      surviveSeconds: this.timeSec, mode: this.cfg.mode,
    });
  }

  private resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = this.canvas.getBoundingClientRect();
    this.canvas.width = r.width * dpr;
    this.canvas.height = r.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.px = r.width / 2;
    this.py = r.height / 2;
  };

  private onMouseMove = (e: MouseEvent) => {
    const r = this.canvas.getBoundingClientRect();
    this.mx = e.clientX - r.left;
    this.my = e.clientY - r.top;
  };
  private onMouseDown = (e: MouseEvent) => { this.onMouseMove(e); this.mouseDown = true; };
  private onMouseUp = () => { this.mouseDown = false; };

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const r = this.canvas.getBoundingClientRect();
    const t = e.touches[0];
    this.mx = t.clientX - r.left; this.my = t.clientY - r.top;
    this.mouseDown = true;
  };
  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const r = this.canvas.getBoundingClientRect();
    const t = e.touches[0];
    this.mx = t.clientX - r.left; this.my = t.clientY - r.top;
  };
  private onTouchEnd = () => { this.mouseDown = false; };

  private loop = (t: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    this.update(dt);
    this.render();
    this.raf = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.timeSec += dt;
    // dynamic difficulty
    this.difficulty = 1 + this.timeSec / 30 + (this.cfg.level - 1) * 0.1;

    // combo decay
    this.comboTimer -= dt;
    if (this.comboTimer <= 0) this.combo = 0;

    // spawn enemies in waves
    this.spawnTimer -= dt;
    this.waveTimer += dt;
    if (this.waveTimer > 12) { this.wave += 1; this.waveTimer = 0; }
    const spawnInterval = Math.max(0.35, 1.4 - this.difficulty * 0.12);
    if (this.spawnTimer <= 0) {
      this.spawnEnemy();
      this.spawnTimer = spawnInterval;
    }

    // shooting
    const def = WEAPONS[this.cfg.weapon];
    const stats = weaponStats(def, this.cfg.upgradeLevel);
    this.fireTimer -= dt;
    if (this.mouseDown && this.fireTimer <= 0) {
      this.fireTimer = 1 / stats.fireRate;
      const baseAng = Math.atan2(this.my - this.py, this.mx - this.px);
      for (let i = 0; i < def.bullets; i++) {
        const offset = def.bullets > 1 ? (i - (def.bullets - 1) / 2) * 0.08 : 0;
        const inacc = (1 - stats.accuracy) * (Math.random() - 0.5) * stats.spread * 4;
        const ang = baseAng + offset + inacc;
        const sp = 720;
        this.bullets.push({
          x: this.px + Math.cos(ang) * (this.pr + 4),
          y: this.py + Math.sin(ang) * (this.pr + 4),
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          damage: stats.damage,
          life: 1.4,
        });
        this.shotsFired++;
      }
    }

    // bullets
    for (const b of this.bullets) {
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    }
    this.bullets = this.bullets.filter((b) => b.life > 0);

    // enemies
    for (const e of this.enemies) {
      const ang = Math.atan2(this.py - e.y, this.px - e.x);
      e.x += Math.cos(ang) * e.speed * dt;
      e.y += Math.sin(ang) * e.speed * dt;
      e.hitFlash = Math.max(0, e.hitFlash - dt);
      // contact damage
      const dx = e.x - this.px, dy = e.y - this.py;
      if (dx * dx + dy * dy < (e.r + this.pr) * (e.r + this.pr)) {
        if (this.invuln <= 0) {
          this.hp -= e.damage;
          this.invuln = 0.5;
          if (this.hp <= 0) { this.hp = 0; this.cb.onUpdate(this.publicState()); this.endNow(); return; }
        }
      }
    }
    this.invuln = Math.max(0, this.invuln - dt);

    // collisions bullet-enemy
    for (const b of this.bullets) {
      for (const e of this.enemies) {
        if (e.hp <= 0) continue;
        const dx = b.x - e.x, dy = b.y - e.y;
        if (dx * dx + dy * dy < e.r * e.r) {
          this.shotsHit++;
          // headshot if hit upper third
          const head = (b.y - e.y) < -e.r * 0.45;
          const dmg = head ? b.damage * 2 : b.damage;
          e.hp -= dmg;
          e.hitFlash = 0.12;
          b.life = 0;
          if (e.hp <= 0) {
            this.kills++;
            this.combo += 1; this.comboTimer = 2.2;
            const comboBonus = this.combo > 2 ? (this.combo - 2) * 5 : 0;
            const gained = (head ? 20 : 10) + comboBonus;
            this.score += gained;
            if (head) this.headshots++;
            this.pops.push({
              x: e.x, y: e.y, life: 0.8,
              text: head ? `HEADSHOT +${gained}` : `+${gained}${this.combo > 2 ? ` x${this.combo}` : ""}`,
              color: head ? "hsl(var(--gold))" : "hsl(var(--hud))",
            });
            // coin drop
            if (Math.random() < 0.55) {
              this.coins.push({ x: e.x, y: e.y, vy: -40 - Math.random() * 30, r: 6, value: 1 + Math.floor(Math.random() * 3), life: 8 });
            }
          }
          break;
        }
      }
    }
    this.enemies = this.enemies.filter((e) => e.hp > 0);

    // coins auto-collect (magnet)
    for (const c of this.coins) {
      const dx = this.px - c.x, dy = this.py - c.y;
      const d = Math.hypot(dx, dy);
      if (d < 140) {
        c.x += (dx / d) * 220 * dt;
        c.y += (dy / d) * 220 * dt;
      } else {
        c.y += c.vy * dt; c.vy += 60 * dt;
      }
      c.life -= dt;
      if (d < this.pr + c.r) {
        this.score += c.value * 2;
        this.pops.push({ x: c.x, y: c.y, life: 0.6, text: `+${c.value}c`, color: "hsl(var(--gold))" });
        c.life = 0;
      }
    }
    this.coins = this.coins.filter((c) => c.life > 0);
    this.pops.forEach((p) => (p.life -= dt));
    this.pops = this.pops.filter((p) => p.life > 0);

    this.cb.onUpdate(this.publicState());
  }

  private spawnEnemy() {
    const r = this.canvas.getBoundingClientRect();
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    if (side === 0) { x = -20; y = Math.random() * r.height; }
    if (side === 1) { x = r.width + 20; y = Math.random() * r.height; }
    if (side === 2) { x = Math.random() * r.width; y = -20; }
    if (side === 3) { x = Math.random() * r.width; y = r.height + 20; }
    const d = this.difficulty;
    // 5 colorful enemy archetypes
    const archetypes = [
      { name: "grunt",   radius: 14, hp: 30 * d, speed: 70 + d * 8,  damage: 10, color: "#ff3b5c", glow: "#ff7a8e", shape: "circle"   as const },
      { name: "runner",  radius: 11, hp: 18 * d, speed: 130 + d * 10, damage: 8,  color: "#ff8a00", glow: "#ffc266", shape: "triangle" as const },
      { name: "brute",   radius: 24, hp: 90 * d, speed: 42 + d * 4,  damage: 20, color: "#a855f7", glow: "#d8b4fe", shape: "square"   as const },
      { name: "shocker", radius: 13, hp: 26 * d, speed: 90 + d * 8,  damage: 12, color: "#22d3ee", glow: "#a5f3fc", shape: "diamond"  as const },
      { name: "wasp",    radius: 12, hp: 22 * d, speed: 110 + d * 9, damage: 9,  color: "#facc15", glow: "#fde68a", shape: "hex"      as const },
    ];
    // weighted: more grunts/runners/wasps, fewer brutes
    const weights = [0.30, 0.22, 0.13, 0.18, 0.17];
    const roll = Math.random();
    let acc = 0; let pick = archetypes[0];
    for (let i = 0; i < archetypes.length; i++) { acc += weights[i]; if (roll <= acc) { pick = archetypes[i]; break; } }
    this.enemies.push({
      x, y, r: pick.radius, hp: pick.hp, maxHp: pick.hp,
      speed: pick.speed, damage: pick.damage,
      color: pick.color, glow: pick.glow, shape: pick.shape,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 4,
      hitFlash: 0,
    });
  }

  private publicState(): PublicState {
    return {
      hp: Math.max(0, Math.round(this.hp)),
      maxHp: this.maxHp,
      score: this.score,
      kills: this.kills,
      headshots: this.headshots,
      combo: this.combo,
      wave: this.wave,
      timeSec: this.timeSec,
      ammoText: "∞",
      weaponName: WEAPONS[this.cfg.weapon].name,
      difficulty: +this.difficulty.toFixed(2),
    };
  }

  private render() {
    const ctx = this.ctx;
    const r = this.canvas.getBoundingClientRect();
    // background
    ctx.fillStyle = "hsl(20 8% 5%)";
    ctx.fillRect(0, 0, r.width, r.height);
    // grid
    ctx.strokeStyle = "hsla(86, 50%, 50%, 0.08)";
    ctx.lineWidth = 1;
    const grid = 40;
    for (let x = 0; x < r.width; x += grid) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, r.height); ctx.stroke();
    }
    for (let y = 0; y < r.height; y += grid) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(r.width, y); ctx.stroke();
    }
    // arena ring
    ctx.strokeStyle = "hsla(86, 95%, 55%, 0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.px, this.py, 220, 0, Math.PI * 2);
    ctx.stroke();

    // bullets — bright glowing tracers
    for (const b of this.bullets) {
      const ang = Math.atan2(b.vy, b.vx);
      // tracer trail
      const trailLen = 18;
      const tx = b.x - Math.cos(ang) * trailLen;
      const ty = b.y - Math.sin(ang) * trailLen;
      const grad = ctx.createLinearGradient(tx, ty, b.x, b.y);
      grad.addColorStop(0, "rgba(190, 255, 80, 0)");
      grad.addColorStop(1, "rgba(220, 255, 120, 0.95)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(b.x, b.y); ctx.stroke();
      // glowing core
      ctx.shadowColor = "#d4ff5c"; ctx.shadowBlur = 16;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // coins
    for (const c of this.coins) {
      ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 10;
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#fff7cc"; ctx.lineWidth = 1.5; ctx.stroke();
    }

    // enemies — colorful shapes with glow
    for (const e of this.enemies) {
      e.rot += e.rotSpeed * 0.016;
      const fill = e.hitFlash > 0 ? "#ffffff" : e.color;
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.rot);
      ctx.shadowColor = e.glow;
      ctx.shadowBlur = 18;
      ctx.fillStyle = fill;
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1.5;
      this.drawShape(e.shape, e.r);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.stroke();
      ctx.restore();
      // hp bar
      const w = e.r * 2;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(e.x - w / 2, e.y - e.r - 9, w, 4);
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x - w / 2, e.y - e.r - 9, w * (e.hp / e.maxHp), 4);
    }

    // player
    const ang = Math.atan2(this.my - this.py, this.mx - this.px);
    // aim line
    ctx.strokeStyle = "rgba(190, 255, 80, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(this.px + Math.cos(ang) * (this.pr + 6), this.py + Math.sin(ang) * (this.pr + 6));
    ctx.lineTo(this.mx, this.my);
    ctx.stroke();
    ctx.setLineDash([]);

    // outer aura ring
    ctx.strokeStyle = "rgba(190, 255, 80, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(this.px, this.py, this.pr + 6, 0, Math.PI * 2); ctx.stroke();

    // body — glowing neon green
    const flashing = this.invuln > 0 && Math.floor(this.invuln * 20) % 2 === 0;
    ctx.shadowColor = flashing ? "#ff5c7a" : "#c6ff3d";
    ctx.shadowBlur = 24;
    ctx.fillStyle = flashing ? "#ff5c7a" : "#c6ff3d";
    ctx.beginPath(); ctx.arc(this.px, this.py, this.pr, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // inner core
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(this.px, this.py, this.pr * 0.45, 0, Math.PI * 2); ctx.fill();
    // gun
    ctx.fillStyle = "#1a1a14";
    ctx.strokeStyle = "#c6ff3d";
    ctx.lineWidth = 1.5;
    ctx.save();
    ctx.translate(this.px, this.py);
    ctx.rotate(ang);
    ctx.fillRect(this.pr - 2, -4, 18, 8);
    ctx.strokeRect(this.pr - 2, -4, 18, 8);
    ctx.restore();

    // crosshair
    ctx.strokeStyle = "#c6ff3d";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.mx, this.my, 10, 0, Math.PI * 2);
    ctx.moveTo(this.mx - 16, this.my); ctx.lineTo(this.mx - 6, this.my);
    ctx.moveTo(this.mx + 6, this.my); ctx.lineTo(this.mx + 16, this.my);
    ctx.moveTo(this.mx, this.my - 16); ctx.lineTo(this.mx, this.my - 6);
    ctx.moveTo(this.mx, this.my + 6); ctx.lineTo(this.mx, this.my + 16);
    ctx.stroke();

    // floating texts
    ctx.font = "600 14px Rajdhani, sans-serif";
    ctx.textAlign = "center";
    for (const p of this.pops) {
      ctx.globalAlpha = Math.min(1, p.life * 1.5);
      ctx.fillStyle = p.color.startsWith("hsl(var") ? "#c6ff3d" : p.color;
      ctx.fillText(p.text, p.x, p.y - (0.8 - p.life) * 30);
    }
    ctx.globalAlpha = 1;
  }

  private drawShape(shape: Enemy["shape"], r: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    if (shape === "circle") {
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    } else if (shape === "triangle") {
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else if (shape === "square") {
      ctx.rect(-r, -r, r * 2, r * 2);
    } else if (shape === "diamond") {
      ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath();
    } else if (shape === "hex") {
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI * 2) / 6;
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }
  }
}