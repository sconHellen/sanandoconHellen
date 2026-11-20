/**
 * Breathing session engine — a faithful TypeScript port of the reference player logic
 * (design/respiraciones/index.html): session plan, Web Audio scheduling of voice cues, bell
 * tones, counting aloud, background songs with 6 s cross-fades, wake lock, and the canvas
 * stage (night sky, light motes, glowing circle, progress ring).
 *
 * Differences from the reference (by design):
 *  - audio comes from /api/media/respiraciones/* (access-checked, signed URLs) instead of
 *    local files, and each intro is its own losslessly cut file (see breathing-audio.json);
 *  - the idle animation pauses when the stage is off-screen and honours reduced motion.
 * Browser-only module.
 */
import manifest from "@/content/breathing-audio.json";
import {
  NUM,
  PALETTES,
  SONGS,
  WORDS,
  cycleLength,
  paletteOf,
  type Breathing,
  type Palette,
  type Phase,
} from "@/content/breathing";

export type Guide = "voz" | "campana" | "nada";

export interface EngineSettings {
  mins: number;
  guide: Guide;
  introOn: boolean;
  countAloud: boolean;
  /** Song id or "off". */
  bgChoice: string;
  /** 0..1 */
  volume: number;
}

export interface EngineElements {
  canvas: HTMLCanvasElement;
  left: HTMLElement;
  rounds: HTMLElement;
  phase: HTMLElement;
  count: HTMLElement;
  side: HTMLElement;
}

export type RunState = "idle" | "loading" | "running" | "paused";

export interface EngineEvents {
  onRunState(state: RunState): void;
  onIntroSkippable(visible: boolean): void;
  onError(kind: "locked" | "network"): void;
}

interface Segment extends Phase {
  t0: number;
  round: number;
  breath?: number;
  fingerNo?: number;
}

interface Plan {
  pre: number;
  segs: Segment[];
  end: number;
  rounds: number;
}

interface Run {
  p: Plan;
  t0: number;
  next: number;
  i: number;
  seg: Segment | null;
  from: number;
  closed: boolean;
  firstOfLast?: Segment;
  introSrc?: AudioBufferSourceNode;
  skipped?: boolean;
}

const MEDIA = "/api/media/respiraciones";
const INTROS = manifest.intros as unknown as Record<string, { clip: [number, number] }>;
const CLOSE = manifest.close.clip as unknown as [number, number];

class LockedError extends Error {}

export const fmt = (s: number) => {
  s = Math.max(0, Math.round(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export class BreathingEngine {
  private cur!: Breathing;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bgGain: GainNode | null = null;
  private bufWords: AudioBuffer | null = null;
  private bufClose: AudioBuffer | null = null;
  private bufIntro = new Map<string, AudioBuffer>();
  private bgBufs = new Map<string, AudioBuffer>();
  private bgCur: { s: AudioBufferSourceNode; g: GainNode }[] | null = null;
  private bgTimer = 0;
  private run: Run | null = null;
  private raf = 0;
  private idleRaf = 0;
  private wake: WakeLockSentinel | null = null;
  private visible = true;
  private reducedMotion = false;
  // drawing state
  private g: CanvasRenderingContext2D;
  private size = 0.5;
  private CW = 0;
  private CH = 0;
  private U = 0;
  private P0: Palette = PALETTES.oceano!;
  private P1: Palette = PALETTES.oceano!;
  private palT = 0;
  private stars: { x: number; y: number; s: number; tw: number }[];
  private motes: { x: number; y: number; s: number; v: number; ph: number }[];
  private observer: IntersectionObserver | null = null;
  private cleanup: (() => void)[] = [];
  private skippable = false;

  constructor(
    private els: EngineElements,
    private settings: () => EngineSettings,
    private events: EngineEvents,
  ) {
    const notify = events.onIntroSkippable;
    // Only notify on change: frame() calls this ~60 times per second.
    this.events = {
      ...events,
      onIntroSkippable: (v) => {
        if (v === this.skippable) return;
        this.skippable = v;
        notify(v);
      },
    };
    this.g = els.canvas.getContext("2d")!;
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    this.stars = Array.from({ length: 110 }, () => ({ x: rnd(), y: rnd(), s: rnd() * 1.6 + 0.4, tw: rnd() * 6 }));
    this.motes = Array.from({ length: 46 }, () => ({ x: rnd(), y: rnd(), s: rnd() * 2 + 0.6, v: rnd() * 0.6 + 0.3, ph: rnd() * 6 }));

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = mq.matches;
    const onResize = () => {
      this.fit();
      if (!this.run) this.draw(0);
    };
    window.addEventListener("resize", onResize);
    this.cleanup.push(() => window.removeEventListener("resize", onResize));

    const onVisibility = async () => {
      if (!document.hidden && this.run && !this.wake) await this.requestWake();
    };
    document.addEventListener("visibilitychange", onVisibility);
    this.cleanup.push(() => document.removeEventListener("visibilitychange", onVisibility));

    this.observer = new IntersectionObserver(([entry]) => {
      this.visible = Boolean(entry?.isIntersecting);
      if (this.visible) this.ambient();
    });
    this.observer.observe(els.canvas);
  }

  destroy() {
    this.stop(true);
    cancelAnimationFrame(this.idleRaf);
    this.observer?.disconnect();
    this.cleanup.forEach((f) => f());
    void this.ctx?.close();
  }

  // ---------- selection ----------
  select(b: Breathing) {
    if (this.run) this.stop(true);
    this.cur = b;
    this.P0 = this.P1;
    this.P1 = paletteOf(b);
    this.palT = performance.now() / 1000;
    this.els.phase.textContent = "Lista para empezar";
    this.els.count.textContent = "·";
    this.els.side.textContent = "";
    this.els.rounds.textContent = "Ronda 0";
    this.els.left.textContent = fmt(this.settings().mins * 60);
    this.size = 0.5;
    if (!this.run) this.draw(0);
  }

  setMinutes(mins: number) {
    if (!this.run) this.els.left.textContent = fmt(mins * 60);
  }

  // ---------- audio ----------
  private async load(url: string): Promise<AudioBuffer> {
    const r = await fetch(url, { credentials: "same-origin" });
    if (r.status === 403) throw new LockedError();
    if (!r.ok) throw new Error(`audio ${r.status}`);
    return await this.ctx!.decodeAudioData(await r.arrayBuffer());
  }

  private async ensureAudio() {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.bgGain = this.ctx.createGain();
      this.bgGain.gain.value = 0;
      this.bgGain.connect(this.ctx.destination);
    }
    const tasks: Promise<unknown>[] = [];
    if (!this.bufWords) tasks.push(this.load(`${MEDIA}/palabras`).then((b) => (this.bufWords = b)));
    if (!this.bufClose) tasks.push(this.load(`${MEDIA}/cierre`).then((b) => (this.bufClose = b)));
    const id = this.cur.id;
    if (!this.bufIntro.has(id)) tasks.push(this.load(`${MEDIA}/intro/${id}`).then((b) => this.bufIntro.set(id, b)));
    await Promise.all(tasks);
  }

  private clip(buf: AudioBuffer | null | undefined, seg: [number, number] | undefined, when: number, gain = 1) {
    if (!buf || !seg || !this.ctx || !this.master) return undefined;
    const s = this.ctx.createBufferSource();
    s.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    s.connect(g);
    g.connect(this.master);
    const off = Math.max(0, seg[0] - 0.04);
    const dur = seg[1] - seg[0] + 0.1;
    s.start(when, off, dur);
    return s;
  }

  private bell(when: number, kind: Phase["k"]) {
    if (this.settings().guide === "nada" || !this.ctx || !this.master) return;
    const f = { in: 528, hold: 440, out: 396, pause: 352, pump: 660 }[kind] ?? 440;
    [1, 2.01].forEach((m, i) => {
      const o = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      o.type = "sine";
      o.frequency.value = f * m;
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime((kind === "pump" ? 0.05 : 0.12) / (i + 1), when + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, when + (kind === "pump" ? 0.35 : 1.6));
      o.connect(g);
      g.connect(this.master!);
      o.start(when);
      o.stop(when + 1.7);
    });
  }

  setVolume() {
    if (!this.ctx || !this.bgGain) return;
    const { bgChoice, volume } = this.settings();
    const v = bgChoice !== "off" && this.run ? volume * 0.9 : 0;
    this.bgGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.6);
  }

  private stopBg() {
    window.clearInterval(this.bgTimer);
    if (this.bgCur && this.ctx) {
      const t = this.ctx.currentTime;
      this.bgCur.forEach((x) => {
        try {
          x.g.gain.cancelScheduledValues(t);
          x.g.gain.setTargetAtTime(0, t, 0.5);
          x.s.stop(t + 3);
        } catch {
          /* already stopped */
        }
      });
    }
    this.bgCur = null;
  }

  /** Each song repeats with a soft 6-second cross-fade. */
  async playBackground() {
    if (!this.ctx || !this.bgGain) return;
    this.stopBg();
    this.setVolume();
    const id = this.settings().bgChoice;
    if (id === "off") return;
    const song = SONGS.find((s) => s.id === id);
    if (!song) return;
    if (!this.bgBufs.has(id)) {
      try {
        this.bgBufs.set(id, await this.load(`${MEDIA}/fondo/${id}`));
      } catch {
        return; // locked or unavailable: the session continues without background
      }
    }
    if (this.settings().bgChoice !== id || !this.run) return;
    const buf = this.bgBufs.get(id)!;
    // 6 s cross-fade as in the reference; shorter only if a song were under 18 s,
    // so the fade-out never starts before the fade-in (negative audio times throw).
    const XF = Math.min(6, buf.duration / 3);
    const list: { s: AudioBufferSourceNode; g: GainNode }[] = [];
    this.bgCur = list;
    const one = (when: number) => {
      const s = this.ctx!.createBufferSource();
      s.buffer = buf;
      const g = this.ctx!.createGain();
      s.connect(g);
      g.connect(this.bgGain!);
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(1, when + XF);
      const end = when + buf.duration;
      g.gain.setValueAtTime(1, end - XF);
      g.gain.linearRampToValueAtTime(0, end);
      s.start(when);
      s.stop(end + 0.1);
      list.push({ s, g });
      return end - XF;
    };
    let next = one(this.ctx.currentTime + 0.1);
    this.bgTimer = window.setInterval(() => {
      if (this.bgCur !== list || !this.ctx) return;
      if (this.ctx.currentTime > next - 3) {
        next = one(next);
        if (list.length > 3) list.shift();
      }
    }, 1000);
  }

  // ---------- session plan ----------
  private plan(): Plan {
    const st = this.settings();
    const intro = INTROS[this.cur.id];
    const pre = st.guide === "voz" && st.introOn && intro ? intro.clip[1] - intro.clip[0] + 1.5 : 5;
    const cl = cycleLength(this.cur);
    const n = Math.max(1, Math.floor((st.mins * 60) / cl));
    const segs: Segment[] = [];
    let t = pre;
    let breath = 0;
    let finger = 0;
    for (let r = 0; r < n; r++) {
      this.cur.ph.forEach((p) => {
        const s: Segment = { ...p, t0: t, round: r + 1 };
        if (p.countBreath) {
          breath = (breath % 10) + 1;
          s.breath = breath;
        }
        if (p.finger) finger = (finger % 5) + 1;
        if (p.k === "in" && this.cur.id === "dedos") s.fingerNo = (finger % 5) + 1;
        segs.push(s);
        t += p.d;
      });
    }
    return { pre, segs, end: t, rounds: n };
  }

  private schedule() {
    const run = this.run!;
    const ctx = this.ctx!;
    const st = this.settings();
    const now = ctx.currentTime;
    const ahead = now + 0.6;
    while (run.next < run.p.segs.length) {
      const s = run.p.segs[run.next]!;
      const at = run.t0 + s.t0;
      if (at > ahead) break;
      if (at >= now - 0.05) {
        this.bell(at, s.k);
        try {
          navigator.vibrate?.(s.k === "pump" ? 15 : 40);
        } catch {
          /* not supported */
        }
        if (st.guide === "voz") {
          let cue = s.cue;
          if (s.countBreath && s.breath) cue = NUM[s.breath]!;
          if (s.round === run.p.rounds && s === run.firstOfLast && this.cur.ph.length > 1) this.clip(this.bufWords, WORDS.ultima, at - 1.3);
          if (cue) this.clip(this.bufWords, WORDS[cue], at);
          const w = cue ? WORDS[cue] : undefined;
          const long = Boolean(w && w[1] - w[0] > 1.15);
          if (st.countAloud && !s.nonum && s.k !== "pump") {
            for (let c = long ? 3 : 2; c <= Math.min(10, s.d); c++) this.clip(this.bufWords, WORDS[NUM[c]!], at + c - 1);
          }
        }
      }
      run.next++;
    }
    if (!run.closed && run.t0 + run.p.end < ahead + 1) {
      run.closed = true;
      if (st.guide === "voz") this.clip(this.bufClose, CLOSE, run.t0 + run.p.end + 0.6);
    }
  }

  // ---------- controls ----------
  async start() {
    this.events.onRunState("loading");
    try {
      await this.ensureAudio();
    } catch (e) {
      this.events.onRunState("idle");
      this.els.phase.textContent = e instanceof LockedError ? "Esta respiración se abre con un plan" : "No se pudo cargar el audio";
      this.events.onError(e instanceof LockedError ? "locked" : "network");
      return;
    }
    const ctx = this.ctx!;
    if (ctx.state !== "running") await ctx.resume();
    const p = this.plan();
    const t0 = ctx.currentTime + 0.3;
    this.run = { p, t0, next: 0, i: 0, seg: null, from: this.size, closed: false };
    this.run.firstOfLast = p.segs.find((s) => s.round === p.rounds);
    const st = this.settings();
    const intro = INTROS[this.cur.id];
    if (st.guide === "voz" && st.introOn && intro) {
      this.run.introSrc = this.clip(this.bufIntro.get(this.cur.id), intro.clip, t0);
      this.events.onIntroSkippable(true);
    }
    void this.playBackground();
    await this.requestWake();
    this.events.onRunState("running");
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(() => this.frame());
  }

  togglePause() {
    if (!this.run || !this.ctx) return;
    if (this.ctx.state === "running") {
      void this.ctx.suspend();
      this.events.onRunState("paused");
    } else {
      void this.ctx.resume();
      this.events.onRunState("running");
    }
  }

  stop(silent: boolean) {
    if (!this.run) return;
    cancelAnimationFrame(this.raf);
    this.run = null;
    this.events.onIntroSkippable(false);
    this.stopBg();
    if (this.ctx && this.master) {
      this.master.disconnect();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      if (this.ctx.state !== "running") void this.ctx.resume();
    }
    this.setVolume();
    void this.wake?.release().catch(() => undefined);
    this.wake = null;
    this.events.onRunState("idle");
    if (!silent) {
      this.els.phase.textContent = "Gracias por darte este momento";
      this.els.count.textContent = "·";
    }
    this.ambient();
  }

  skipIntro() {
    const run = this.run;
    if (!run || !run.introSrc || !this.ctx) return;
    try {
      run.introSrc.stop();
    } catch {
      /* already stopped */
    }
    run.skipped = true;
    this.events.onIntroSkippable(false);
    const t = this.ctx.currentTime - run.t0;
    const left = run.p.pre - t;
    if (left > 3) run.t0 -= left - 3;
  }

  private async requestWake() {
    try {
      this.wake = await navigator.wakeLock.request("screen");
    } catch {
      /* not supported or not allowed */
    }
  }

  // ---------- drawing ----------
  private fit() {
    const r = this.els.canvas.getBoundingClientRect();
    const d = Math.min(2, window.devicePixelRatio || 1);
    this.els.canvas.width = Math.round(r.width * d);
    this.els.canvas.height = Math.round(r.height * d);
    this.CW = this.els.canvas.width;
    this.CH = this.els.canvas.height;
    this.U = Math.min(this.CW, this.CH);
  }

  private glow(x: number, y: number, r: number, col: string, a: number) {
    if (r <= 0 || a <= 0) return;
    const g = this.g;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, col.replace("A", String(a)));
    gr.addColorStop(1, col.replace("A", "0"));
    g.fillStyle = gr;
    g.beginPath();
    g.arc(x, y, r, 0, 7);
    g.fill();
  }

  private draw(t: number) {
    if (!this.CW) this.fit();
    if (!this.CW || !this.CH) return;
    const g = this.g;
    const { CW, CH, U } = this;
    const T = performance.now() / 1000;
    const m = Math.min(1, (T - this.palT) / 1.5);
    const mix = (a: number, b: number) => a + (b - a) * m;
    const lerp = (a: number[], b: number[]) => `rgb(${[0, 1, 2].map((i) => Math.round(mix(a[i]!, b[i]!))).join(",")})`;
    const sk = g.createLinearGradient(0, 0, 0, CH);
    sk.addColorStop(0, lerp(this.P0.top, this.P1.top));
    sk.addColorStop(1, lerp(this.P0.bot, this.P1.bot));
    g.fillStyle = sk;
    g.fillRect(0, 0, CW, CH);
    this.stars.forEach((st) => {
      g.fillStyle = `rgba(241,233,222,${0.5 * (0.3 + 0.35 * Math.sin(T * 0.8 + st.tw))})`;
      g.fillRect(st.x * CW, st.y * CH * 0.8, st.s, st.s);
    });
    const gl = this.P1.gl;
    const cx = CW / 2;
    const cy = CH / 2;
    const R = U * 0.4;
    g.fillStyle = gl.replace("A", "0.35");
    this.motes.forEach((mo) => {
      const y = (((mo.y - T * mo.v * 0.012) % 1) + 1) % 1;
      const x = mo.x * CW + Math.sin(T * 0.4 + mo.ph) * 8;
      g.beginPath();
      g.arc(x, y * CH, mo.s, 0, 7);
      g.fill();
    });
    g.lineWidth = Math.max(1, U * 0.003);
    g.strokeStyle = "rgba(244,239,230,.14)";
    g.beginPath();
    g.arc(cx, cy, R, 0, 7);
    g.stroke();
    const r = R * this.size;
    this.glow(cx, cy, r * 2.3, gl, 0.22 + 0.25 * this.size);
    this.glow(cx, cy, r * 1.15, gl, 0.35);
    g.fillStyle = gl.replace("A", String(0.14 + 0.16 * this.size));
    g.beginPath();
    g.arc(cx, cy, r, 0, 7);
    g.fill();
    g.lineWidth = Math.max(1.5, U * 0.004);
    g.strokeStyle = "rgba(250,245,236,.8)";
    g.beginPath();
    g.arc(cx, cy, r, 0, 7);
    g.stroke();
    const s = this.run?.seg;
    if (s) {
      const q = Math.min(1, (t - s.t0) / s.d);
      g.lineWidth = Math.max(2, U * 0.006);
      g.lineCap = "round";
      g.strokeStyle = this.P1.a;
      g.shadowColor = this.P1.a;
      g.shadowBlur = U * 0.02;
      g.beginPath();
      g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + q * Math.PI * 2);
      g.stroke();
      g.shadowBlur = 0;
      if (s.k === "hold" || s.k === "pause") {
        g.setLineDash([U * 0.006, U * 0.018]);
        g.strokeStyle = gl.replace("A", "0.7");
        g.lineWidth = Math.max(1, U * 0.003);
        g.beginPath();
        g.arc(cx, cy, r + U * 0.03 + Math.sin(T * 1.5) * U * 0.005, 0, 7);
        g.stroke();
        g.setLineDash([]);
      }
      if (s.hum) {
        for (let i = 0; i < 3; i++) {
          const k = (T * 0.9 + i / 3) % 1;
          g.strokeStyle = gl.replace("A", String((1 - k) * 0.55));
          g.lineWidth = Math.max(1, U * 0.003);
          g.beginPath();
          g.arc(cx, cy, r + k * R * 0.35, 0, 7);
          g.stroke();
        }
      }
      if (s.side === "Izquierda" || s.side === "Derecha") {
        const x = s.side === "Izquierda" ? cx - R * 1.15 : cx + R * 1.15;
        this.glow(x, cy, U * 0.06, gl, 0.8);
        g.fillStyle = this.P1.a;
        g.beginPath();
        g.arc(x, cy, U * 0.012, 0, 7);
        g.fill();
      }
    }
  }

  /** Idle animation: only while visible, and a single still frame with reduced motion. */
  ambient() {
    cancelAnimationFrame(this.idleRaf);
    if (this.run) return;
    this.draw(0);
    if (this.reducedMotion || !this.visible) return;
    this.idleRaf = requestAnimationFrame(() => this.ambient());
  }

  private frame() {
    const run = this.run;
    const ctx = this.ctx;
    if (!run || !ctx) return;
    cancelAnimationFrame(this.idleRaf);
    const t = ctx.currentTime - run.t0;
    this.schedule();
    const segs = run.p.segs;
    while (run.i < segs.length - 1 && t >= segs[run.i + 1]!.t0) run.i++;
    const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)));
    const E = this.els;
    if (t < 0 || t < run.p.pre) {
      const left = Math.ceil(run.p.pre - Math.max(0, t));
      run.seg = null;
      E.phase.textContent = run.introSrc && !run.skipped ? "Escucha la explicación" : "Prepárate";
      E.count.textContent = left <= 5 ? String(left) : "·";
      E.side.textContent = "";
      this.size = 0.5 + 0.03 * Math.sin(t * 2);
    } else if (t < run.p.end) {
      this.events.onIntroSkippable(false);
      const s = segs[run.i]!;
      if (run.seg !== s) {
        run.from = this.size;
        run.seg = s;
      }
      const q = (t - s.t0) / s.d;
      if (s.k === "in" || s.k === "out" || s.k === "pump") {
        const to = s.to ?? 0.5;
        this.size =
          s.k === "pump"
            ? q < 0.35
              ? run.from + (0.4 - run.from) * ease(q / 0.35)
              : 0.4 + (0.55 - 0.4) * ease((q - 0.35) / 0.65)
            : run.from + (to - run.from) * ease(q);
      }
      E.phase.textContent = s.lab;
      E.count.textContent = s.countBreath ? String(s.breath) : s.nonum ? "·" : String(Math.min(s.d, Math.floor(t - s.t0) + 1));
      E.side.textContent = s.side || (s.fingerNo ? `Dedo ${s.fingerNo} de 5` : "");
      E.rounds.textContent = `Ronda ${s.round} de ${run.p.rounds}`;
    } else {
      run.seg = null;
      this.size += (0.3 - this.size) * 0.03;
      E.phase.textContent = "Muy bien";
      E.count.textContent = "·";
      E.side.textContent = "Nota cómo te sientes";
      if (t > run.p.end + 12) {
        this.stop(false);
        return;
      }
    }
    E.left.textContent = fmt(Math.max(0, run.p.end - t));
    this.draw(t);
    this.raf = requestAnimationFrame(() => this.frame());
  }
}
