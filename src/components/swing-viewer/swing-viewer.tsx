"use client";
import {
  Activity,
  Bone,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  Component,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type Club,
  clubs,
  type Hand,
  isWedge,
  type Language,
  type Preferences,
  type Shot,
  shotNames,
} from "@/lib/golf";
import {
  leadTrailSplit,
  type Phase,
  phaseNames,
  phases,
  pressureAt,
  swingFor,
} from "@/lib/swing";
import { clipData } from "@/lib/swing-data";
import type { Colors } from "./golfer";
import { createPlayer } from "./player-store";
import { PosterFallback } from "./poster-fallback";
import { useSwingPlayer } from "./use-swing-player";

const Canvas = dynamic(() => import("./swing-canvas"), { ssr: false });
class CanvasBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
const looks = ["side", "front", "top", "back"] as const;
const lookNames = {
  side: { en: "Side", es: "Lateral" },
  front: { en: "Front", es: "Frente" },
  top: { en: "Top", es: "Arriba" },
  back: { en: "Back", es: "Espalda" },
};
export function SwingViewer({
  initialized,
  club,
  shot,
  hand,
  lang,
  overlays,
  look,
  speed,
  poseRequest,
  onClub,
  onShot,
  onPreferences,
}: {
  initialized: boolean;
  club: Club;
  shot: Shot;
  hand: Hand;
  lang: Language;
  overlays: Preferences["overlays"];
  look: Preferences["look"];
  speed: 1 | 0.5;
  poseRequest: { phase: Phase; nonce: number };
  onClub: (id: string) => void;
  onShot: (shot: Shot) => void;
  onPreferences: (patch: Partial<Preferences>) => void;
}) {
  const t = (en: string, es: string) => (lang === "en" ? en : es);
  const [player] = useState(() => createPlayer(swingFor(club, shot), speed));
  const state = useSwingPlayer(player),
    spec = player.getState().spec;
  const [selected, setSelected] = useState<Preferences["look"] | null>(look),
    [reduced, setReduced] = useState(false),
    [failed, setFailed] = useState(false),
    [ready, setReady] = useState(false),
    [mounted, setMounted] = useState(false);
  const duration = useRef(5.8666667),
    clipName = useRef("full"),
    scrubber = useRef<HTMLInputElement>(null);
  const [colors, setColors] = useState<Colors>({
    body: "#252a27",
    mid: "#be8152",
    signal: "#a74724",
    green: "#386e50",
    blue: "#326582",
    ground: "#eeeee5",
  });
  useEffect(() => {
    player.configure(swingFor(club, shot));
    duration.current = clipData[swingFor(club, shot).clip].duration;
    clipName.current = swingFor(club, shot).clip;
  }, [player, club, shot]);
  useEffect(() => {
    player.setSpeed(speed);
  }, [player, speed]);
  useEffect(() => {
    setSelected(look);
  }, [look]);
  useEffect(() => {
    player.seek(poseRequest.phase, true);
  }, [player, poseRequest]);
  useEffect(() => {
    setMounted(true);
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(mq.matches);
    change();
    mq.addEventListener("change", change);
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl || new URLSearchParams(location.search).has("poster"))
      setFailed(true);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return () => {
      mq.removeEventListener("change", change);
      player.dispose();
    };
  }, [player]);
  useEffect(() => {
    const read = () => {
      const css = getComputedStyle(document.documentElement);
      const color = (name: string) => css.getPropertyValue(name).trim();
      setColors({
        body: color("--golfer"),
        mid: color("--heat-mid"),
        signal: color("--signal"),
        green: color("--diagram-green"),
        blue: color("--diagram-blue"),
        ground: color("--muted"),
      });
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!initialized) return;
    const url = new URL(location.href);
    url.searchParams.set("club", club.id);
    url.searchParams.set("look", look);
    url.searchParams.set("phase", String(state.phase));
    history.replaceState(null, "", url);
  }, [initialized, club.id, look, state.phase]);
  const onReady = useCallback((name: string, seconds: number) => {
    clipName.current = name;
    duration.current = seconds;
    setReady(true);
  }, []);
  const onFailure = useCallback(() => {
    setFailed(true);
    setReady(false);
  }, []);
  const onOrbit = useCallback(() => setSelected(null), []);
  useEffect(() => {
    let frame = 0,
      last = performance.now();
    const tick = (now: number) => {
      player.advance(Math.min(0.1, (now - last) / 1000), duration.current);
      last = now;
      frame = requestAnimationFrame(tick);
    };
    if (state.playing) frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [player, state.playing]);
  useEffect(() => {
    const update = () => {
      if (scrubber.current)
        scrubber.current.value = String(player.getState().t);
    };
    update();
    return player.onFrame(update);
  }, [player]);
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      !new URLSearchParams(location.search).has("debug")
    )
      return;
    Object.defineProperty(window, "__rangeNotesViewer", {
      configurable: true,
      get: () => {
        const s = player.getState();
        return {
          t: s.t,
          phase: s.phase,
          look: selected,
          overlays,
          clipName: clipName.current,
          clipDuration: duration.current,
          pressure: pressureAt(s.spec, s.t),
          ready: ready && !failed,
        };
      },
    });
    return () => {
      Reflect.deleteProperty(window, "__rangeNotesViewer");
    };
  }, [player, selected, overlays, ready, failed]);
  const split = leadTrailSplit(spec.pressure[state.phase]);
  const lead = split.lead >= 0.5;
  const pressure = t(
    `Pressure ${Math.round((lead ? split.lead : split.trail) * 100)}% ${lead ? "lead" : "trail"}`,
    `Presión ${Math.round((lead ? split.lead : split.trail) * 100)}% ${lead ? "delante" : "atrás"}`,
  );
  const cue = `${spec.cues[state.phase][lang]}${spec.approximation ? ` ${spec.approximation[lang]}` : ""}${overlays.pressure ? ` ${pressure}.` : ""}`;
  return (
    <section
      className="swing-viewer"
      aria-label={t("Swing viewer", "Visor de swing")}
    >
      <label className="viewer-club">
        <span className="sr-only">{t("Your club", "Tu palo")}</span>
        <select value={club.id} onChange={(e) => onClub(e.target.value)}>
          {[...new Set(clubs.map((c) => c.group.en))].map((group) => (
            <optgroup
              label={clubs.find((c) => c.group.en === group)?.group[lang]}
              key={group}
            >
              {clubs
                .filter((c) => c.group.en === group)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name[lang]}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      {isWedge(club) && (
        <fieldset className="viewer-shots">
          <legend className="sr-only">{t("Shot type", "Tipo de golpe")}</legend>
          {(Object.keys(shotNames) as Shot[]).map((s) => (
            <button
              type="button"
              key={s}
              aria-pressed={shot === s}
              onClick={() => onShot(s)}
            >
              {s === "stock" ? t("Stock", "Normal") : shotNames[s][lang]}
            </button>
          ))}
        </fieldset>
      )}
      <div className="view-controls">
        <div
          role="tablist"
          aria-label={t("View", "Vista")}
          className="view-tabs"
        >
          {looks.map((l, i) => (
            <button
              role="tab"
              type="button"
              key={l}
              aria-selected={selected === l}
              tabIndex={selected === l || (!selected && i === 0) ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const next =
                    looks[(i + (e.key === "ArrowRight" ? 1 : 3)) % 4];
                  onPreferences({ look: next });
                  setSelected(next);
                  (
                    e.currentTarget.parentElement?.children[
                      looks.indexOf(next)
                    ] as HTMLElement
                  )?.focus();
                }
              }}
              onClick={() => {
                onPreferences({ look: l });
                setSelected(l);
              }}
            >
              {lookNames[l][lang]}
            </button>
          ))}
        </div>
        {!selected && (
          <button
            className="reset-view"
            type="button"
            onClick={() => {
              setSelected("front");
              onPreferences({ look: "front" });
            }}
          >
            {t("Reset view", "Restablecer vista")}
          </button>
        )}
      </div>
      <div className="viewer-stage">
        {(!ready || failed) && (
          <PosterFallback
            player={player}
            hand={hand}
            label={cue}
            lang={lang}
            failed={failed}
          />
        )}
        <div
          className="canvas-layer"
          style={{ visibility: ready && !failed ? "visible" : "hidden" }}
        >
          {mounted && !failed && (
            <CanvasBoundary onFailure={onFailure}>
              <Canvas
                player={player}
                club={club}
                hand={hand}
                overlays={overlays}
                colors={colors}
                look={selected}
                reduced={reduced}
                onOrbit={onOrbit}
                onReady={onReady}
                label={`${cue} ${t("Arrow keys orbit; plus and minus zoom.", "Las flechas giran; más y menos acercan o alejan.")}`}
                onFailure={onFailure}
              />
            </CanvasBoundary>
          )}
        </div>
        <div className="overlay-controls">
          {(
            [
              {
                name: "pressure",
                label: t("Pressure", "Presión"),
                Icon: Activity,
              },
              {
                name: "skeleton",
                label: t("Skeleton", "Esqueleto"),
                Icon: Bone,
              },
            ] as const
          ).map(({ name, label, Icon }) => (
            <button
              key={name}
              type="button"
              aria-label={label}
              title={label}
              aria-pressed={overlays[name]}
              onClick={() =>
                onPreferences({
                  overlays: { ...overlays, [name]: !overlays[name] },
                })
              }
            >
              <Icon size={20} />
            </button>
          ))}
        </div>
      </div>
      {overlays.pressure && (
        <p className="pressure-legend">
          <span>{t("Low", "Baja")}</span>
          <span className="heat-ramp" />
          <span>{t("High", "Alta")}</span>
          <span>{t("Authored coaching model", "Modelo didáctico")}</span>
        </p>
      )}
      <div className="phase-strip">
        {phases.map((p) => (
          <button
            type="button"
            key={p}
            aria-pressed={state.phase === p}
            onClick={() => player.seek(p, reduced)}
          >
            {phaseNames[p][lang]}
          </button>
        ))}
      </div>
      <input
        ref={scrubber}
        className="swing-scrubber"
        type="range"
        min={0}
        max={1}
        step={0.001}
        defaultValue={0}
        aria-label={t("Swing position", "Posición del swing")}
        onChange={(e) => player.scrub(Number(e.target.value))}
      />
      <fieldset
        className="transport"
        aria-label={t("Playback", "Reproducción")}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            player.step(e.key === "ArrowLeft" ? -1 : 1, reduced);
          }
          if (e.key === " ") {
            e.preventDefault();
            player.toggle();
          }
        }}
      >
        <button
          type="button"
          aria-label={t("Previous phase", "Fase anterior")}
          disabled={state.phase === 0}
          onClick={() => player.step(-1, reduced)}
        >
          <SkipBack size={22} />
        </button>
        <button
          type="button"
          className="play-button"
          aria-label={
            state.playing ? t("Pause", "Pausa") : t("Play", "Reproducir")
          }
          onClick={() => player.toggle()}
        >
          {state.playing ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          type="button"
          aria-label={t("Next phase", "Siguiente fase")}
          disabled={state.phase === 4}
          onClick={() => player.step(1, reduced)}
        >
          <SkipForward size={22} />
        </button>
        <button
          type="button"
          className="half-speed"
          aria-label={t("Half speed", "Media velocidad")}
          aria-pressed={speed === 0.5}
          onClick={() => onPreferences({ speed: speed === 1 ? 0.5 : 1 })}
        >
          ½×
        </button>
      </fieldset>
      <p className="swing-cue">{cue}</p>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {phaseNames[state.phase][lang]}. {cue}
      </span>
    </section>
  );
}
