"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BREATHINGS,
  FREE_BREATHING_ID,
  FREE_SONG_ID,
  SONGS,
  SUGGESTED,
  paletteOf,
  songsFor,
  type Breathing,
} from "@/content/breathing";
import { canPractise, type ViewerAccess } from "@/lib/media/breathing-assets";
import { BreathingEngine, fmt, type Guide, type RunState } from "@/lib/breathing/engine";
import styles from "./BreathingPlayer.module.css";

export const GIFT_EVENT = "sch:gift-unlocked";
export const SELECT_EVENT = "sch:select-breathing";

const store = {
  get(k: string) {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      window.localStorage.setItem(k, v);
    } catch {
      /* private mode */
    }
  },
};

const byId = (id: string | null): Breathing => BREATHINGS.find((b) => b.id === id) ?? BREATHINGS[0]!;

/**
 * "Espacio para respirar": Hellen's breathing player, same layout and behaviour as the
 * reference (stage, info, controls, library), rendered with the project's identity.
 */
export function BreathingPlayer({ initialAccess }: { initialAccess: ViewerAccess }) {
  const [access, setAccess] = useState(initialAccess);
  const [cur, setCur] = useState<Breathing>(BREATHINGS[0]!);
  const [mins, setMins] = useState(5);
  const [guide, setGuide] = useState<Guide>("voz");
  const [introOn, setIntroOn] = useState(true);
  const [countAloud, setCountAloud] = useState(false);
  const [bgChoice, setBgChoice] = useState(SUGGESTED[BREATHINGS[0]!.id]!);
  const [volume, setVolume] = useState(0.5);
  const [runState, setRunState] = useState<RunState>("idle");
  const [skippable, setSkippable] = useState(false);

  const playerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leftRef = useRef<HTMLSpanElement>(null);
  const roundsRef = useRef<HTMLSpanElement>(null);
  const phaseRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const sideRef = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<BreathingEngine | null>(null);
  const settings = useRef({ mins, guide, introOn, countAloud, bgChoice, volume });
  settings.current = { mins, guide, introOn, countAloud, bgChoice, volume };

  const songAllowed = useCallback((id: string) => access.breathing || (access.gift && id === FREE_SONG_ID), [access]);

  const select = useCallback(
    (b: Breathing) => {
      setCur(b);
      store.set("resp", b.id);
      const sug = SUGGESTED[b.id] ?? "rio";
      setBgChoice(songAllowed(sug) ? sug : "off");
      engineRef.current?.select(b);
    },
    [songAllowed],
  );

  // Engine lifecycle + stored preferences.
  useEffect(() => {
    const engine = new BreathingEngine(
      {
        canvas: canvasRef.current!,
        left: leftRef.current!,
        rounds: roundsRef.current!,
        phase: phaseRef.current!,
        count: countRef.current!,
        side: sideRef.current!,
      },
      () => settings.current,
      { onRunState: setRunState, onIntroSkippable: setSkippable, onError: () => undefined },
    );
    engineRef.current = engine;
    if (store.get("num") === "on") setCountAloud(true);
    if (store.get("intro") === "off") setIntroOn(false);
    const initial = byId(store.get("resp"));
    setCur(initial);
    engine.select(initial);
    engine.ambient();
    return () => engine.destroy();
  }, []);

  // Keep the suggested song valid when access changes (e.g. after the gift form).
  useEffect(() => {
    setBgChoice((c) => (c === "off" || songAllowed(c) ? c : "off"));
    const sug = SUGGESTED[cur.id] ?? "rio";
    if (songAllowed(sug)) setBgChoice((c) => (c === "off" ? sug : c));
  }, [songAllowed, cur.id]);

  // Gift unlocked elsewhere on the page; "practise this one" requests from the gift card.
  useEffect(() => {
    const onGift = () => setAccess((a) => ({ ...a, gift: true }));
    const onSelect = (e: Event) => {
      const b = byId((e as CustomEvent<string>).detail);
      select(b);
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener(GIFT_EVENT, onGift);
    window.addEventListener(SELECT_EVENT, onSelect);
    return () => {
      window.removeEventListener(GIFT_EVENT, onGift);
      window.removeEventListener(SELECT_EVENT, onSelect);
    };
  }, [select]);

  // Live background changes while a session runs.
  useEffect(() => {
    if (runState === "running" || runState === "paused") void engineRef.current?.playBackground();
  }, [bgChoice]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => engineRef.current?.setVolume(), [volume]);
  useEffect(() => engineRef.current?.setMinutes(mins), [mins]);

  const palette = paletteOf(cur);
  const practisable = canPractise(cur.id, access);
  const songs = useMemo(() => songsFor(cur), [cur]);
  const sug = SUGGESTED[cur.id] ?? "rio";
  const activating = songs.some((s) => s.energia);
  const sugName = (SONGS.find((s) => s.id === sug) ?? SONGS[0]!).n;
  const running = runState === "running" || runState === "paused";

  const onGo = () => {
    if (!practisable) return;
    if (running) engineRef.current?.togglePause();
    else void engineRef.current?.start();
  };

  const chip = (pressed: boolean, onClick: () => void, label: string) => (
    <button type="button" className={styles.chip} aria-pressed={pressed} onClick={onClick}>
      {label}
    </button>
  );

  return (
    <div className={styles.wrap} style={{ ["--sage" as string]: palette.a }}>
      <section ref={playerRef} className={styles.player} aria-label="Reproductor de respiraciones" id="respirar">
        <div className={styles.stage}>
          <canvas ref={canvasRef} aria-hidden="true" />
          <div className={styles.meta}>
            <span ref={leftRef}>{fmt(mins * 60)}</span>
            <span ref={roundsRef}>Ronda 0</span>
          </div>
          <div className={styles.center}>
            <div>
              <span className={styles.side} ref={sideRef} />
              <span className={styles.phase} ref={phaseRef}>
                Lista para empezar
              </span>
              <span className={styles.count} ref={countRef}>
                ·
              </span>
            </div>
          </div>
          <div className={styles.actions}>
            {skippable ? (
              <button type="button" className={styles.ghost} onClick={() => engineRef.current?.skipIntro()}>
                Saltar intro
              </button>
            ) : null}
            {practisable ? (
              <button type="button" className={styles.go} onClick={onGo} disabled={runState === "loading"}>
                {runState === "loading" ? "Cargando…" : runState === "running" ? "Pausar" : runState === "paused" ? "Continuar" : "Empezar"}
              </button>
            ) : cur.id === FREE_BREATHING_ID ? (
              <a className={styles.go} href="#regalo">
                Ábrela con tu regalo gratis
              </a>
            ) : (
              <a className={styles.go} href="#planes">
                Ábrela con un plan
              </a>
            )}
            {running ? (
              <button type="button" className={styles.ghost} onClick={() => engineRef.current?.stop(false)}>
                Terminar
              </button>
            ) : null}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.info}>
            <div className={styles.eyebrow}>{cur.p}</div>
            <h3 className={styles.name}>{cur.n}</h3>
            <div className={styles.rhythm}>{cur.r}</div>
            <p>{cur.how}</p>
            <div className={styles.fact}>
              <b>Dato curioso</b>
              <span>{cur.f}</span>
            </div>
            {cur.warn ? <p className={styles.warn}>{cur.warn}</p> : null}
          </div>

          <div className={styles.controls}>
            <div className={styles.row} role="group" aria-label="Duración">
              <span className={styles.lab}>Duración</span>
              {[3, 5, 10].map((m) => chip(mins === m, () => setMins(m), `${m} min`))}
            </div>
            <div className={styles.row} role="group" aria-label="Guía">
              <span className={styles.lab}>Guía</span>
              {chip(guide === "voz", () => setGuide("voz"), "Voz y campana")}
              {chip(guide === "campana", () => setGuide("campana"), "Solo campana")}
              {chip(guide === "nada", () => setGuide("nada"), "Silencio")}
            </div>
            <div className={styles.row} role="group" aria-label="Introducción">
              <span className={styles.lab}>Intro</span>
              {chip(introOn, () => (setIntroOn(true), store.set("intro", "on")), "Con explicación")}
              {chip(!introOn, () => (setIntroOn(false), store.set("intro", "off")), "Directo a respirar")}
            </div>
            <div className={styles.row} role="group" aria-label="Números">
              <span className={styles.lab}>Números</span>
              {chip(!countAloud, () => (setCountAloud(false), store.set("num", "off")), "Solo en pantalla")}
              {chip(countAloud, () => (setCountAloud(true), store.set("num", "on")), "Contar en voz alta")}
            </div>
            <div className={styles.row}>
              <label className={styles.lab} htmlFor="bgsel">
                Fondo
              </label>
              <select id="bgsel" className={styles.sel} value={bgChoice} onChange={(e) => setBgChoice(e.target.value)}>
                {songs.map((s) => (
                  <option key={s.id} value={s.id} disabled={!songAllowed(s.id)}>
                    {s.n}
                    {s.id === sug ? "  ★ sugerida" : ""}
                    {songAllowed(s.id) ? "" : " · con un plan"}
                  </option>
                ))}
                <option value="off">Sin fondo</option>
              </select>
              <label className={styles.vol} htmlFor="bgv">
                Volumen
                <input id="bgv" type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(+e.target.value)} />
              </label>
            </div>
            <p className={styles.hint}>
              Sugerida para esta respiración: {sugName}.{" "}
              {activating
                ? "Como es una respiración para activarte, aquí aparecen las canciones con más energía."
                : "Como es una respiración para calmarte o soltar, aquí solo aparecen canciones tranquilas."}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.lib} aria-label="Respiraciones">
        <h3>Las respiraciones</h3>
        <p className={styles.sub}>
          Veintidós técnicas, de las más calmantes a las más activadoras. Cada una empieza con una explicación hablada.
        </p>
        <div className={styles.grid}>
          {BREATHINGS.map((b) => {
            const p = paletteOf(b);
            const open = canPractise(b.id, access);
            return (
              <button
                key={b.id}
                type="button"
                className={styles.card}
                style={{ ["--c" as string]: p.a, ["--t" as string]: p.t }}
                aria-current={b.id === cur.id ? "true" : "false"}
                onClick={() => {
                  select(b);
                  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                  playerRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
                }}
              >
                <span className={styles.top}>
                  <span className={styles.dot} />
                  <span className={styles.n}>{b.n}</span>
                  {b.id === FREE_BREATHING_ID ? <span className={styles.tag}>Gratis</span> : !open ? <span className={styles.tag}>Con un plan</span> : null}
                </span>
                <span className={styles.r}>{b.r}</span>
                <span className={styles.p}>{b.p}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
