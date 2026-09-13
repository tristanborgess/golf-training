"use client";
import {
  Activity,
  Bone,
  ChevronDown,
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
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  type Club,
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
import { cn } from "@/lib/utils";
import type { Colors } from "./golfer";
import { emptyPerf, formatPerf } from "./perf";
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
const isLook = (value: string): value is Preferences["look"] =>
  (looks as readonly string[]).includes(value);
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
  onMenu,
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
  onMenu: () => void;
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
    [mounted, setMounted] = useState(false),
    [debug, setDebug] = useState(false),
    [readout, setReadout] = useState("");
  const [perf] = useState(emptyPerf);
  const duration = useRef(5.8666667),
    clipName = useRef("full"),
    scrubber = useRef<HTMLInputElement>(null);
  const [colors, setColors] = useState<Colors>({
    body: "#252a27",
    rim: "#5a625c",
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
    setDebug(new URLSearchParams(location.search).has("debug"));
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
        rim: color("--golfer-rim"),
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
  const live = ready && !failed;
  /* The canvas advances the swing from its own render loop; the poster needs this clock instead. */
  useEffect(() => {
    if (live || !state.playing) return;
    let frame = 0,
      last = performance.now();
    const tick = (now: number) => {
      player.advance(Math.min(0.1, (now - last) / 1000), duration.current);
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [player, state.playing, live]);
  useEffect(() => {
    const update = () => {
      if (scrubber.current)
        scrubber.current.value = String(player.getState().t);
    };
    update();
    return player.onFrame(update);
  }, [player]);
  useEffect(() => {
    if (!debug) return;
    const timer = window.setInterval(() => setReadout(formatPerf(perf)), 500);
    return () => window.clearInterval(timer);
  }, [debug, perf]);
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && !debug) return;
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
          perf: { ...perf },
        };
      },
    });
    return () => {
      Reflect.deleteProperty(window, "__rangeNotesViewer");
    };
  }, [player, selected, overlays, ready, failed, debug, perf]);
  const split = leadTrailSplit(spec.pressure[state.phase]);
  const lead = split.lead >= 0.5;
  const pressure = t(
    `Pressure ${Math.round((lead ? split.lead : split.trail) * 100)}% ${lead ? "lead" : "trail"}`,
    `Presión ${Math.round((lead ? split.lead : split.trail) * 100)}% ${lead ? "delante" : "atrás"}`,
  );
  const cue = `${spec.cues[state.phase][lang]}${spec.approximation ? ` ${spec.approximation[lang]}` : ""}${overlays.pressure ? ` ${pressure}.` : ""}`;
  const chooseLook = (value: string) => {
    if (!isLook(value)) return;
    onPreferences({ look: value });
    setSelected(value);
  };
  return (
    <section
      className="swing-viewer"
      aria-label={t("Swing viewer", "Visor de swing")}
    >
      <div className="viewer-heading">
        <Button
          type="button"
          variant="outline"
          className="viewer-club h-12 rounded-full px-5 text-lg"
          onClick={onMenu}
          aria-label={t(
            `${club.name[lang]}. Change club`,
            `${club.name[lang]}. Cambiar palo`,
          )}
        >
          <span className="viewer-club-name">{club.name[lang]}</span>
          <span className="viewer-club-loft">{club.loft}</span>
          <ChevronDown aria-hidden="true" />
        </Button>
        {isWedge(club) && (
          <fieldset className="viewer-shots">
            <legend className="sr-only">
              {t("Shot type", "Tipo de golpe")}
            </legend>
            {(Object.keys(shotNames) as Shot[]).map((s) => (
              <Button
                type="button"
                key={s}
                size="sm"
                variant={shot === s ? "secondary" : "ghost"}
                className="rounded-full"
                aria-pressed={shot === s}
                onClick={() => onShot(s)}
              >
                {s === "stock" ? t("Stock", "Normal") : shotNames[s][lang]}
              </Button>
            ))}
          </fieldset>
        )}
      </div>
      <div className="view-controls">
        {/* One shared panel for four views, so the tablist is explicit rather than Radix Tabs. */}
        <div
          role="tablist"
          aria-label={t("View", "Vista")}
          className="view-tabs inline-flex h-11 items-center justify-center rounded-full bg-muted p-1 text-muted-foreground"
        >
          {looks.map((l, i) => {
            const active = selected === l;
            return (
              <button
                role="tab"
                type="button"
                key={l}
                id={`view-tab-${l}`}
                aria-selected={active}
                aria-controls="viewer-stage"
                data-state={active ? "active" : "inactive"}
                tabIndex={active || (!selected && i === 0) ? 0 : -1}
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  e.preventDefault();
                  const next =
                    looks[(i + (e.key === "ArrowRight" ? 1 : 3)) % 4];
                  chooseLook(next);
                  document.getElementById(`view-tab-${next}`)?.focus();
                }}
                onClick={() => chooseLook(l)}
              >
                {lookNames[l][lang]}
              </button>
            );
          })}
        </div>
        {!selected && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="reset-view"
            onClick={() => chooseLook("front")}
          >
            {t("Reset view", "Restablecer vista")}
          </Button>
        )}
      </div>
      <div
        className="viewer-stage"
        id="viewer-stage"
        role="tabpanel"
        aria-labelledby={selected ? `view-tab-${selected}` : undefined}
        aria-label={selected ? undefined : t("Free view", "Vista libre")}
      >
        {!live && (
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
          style={{ visibility: live ? "visible" : "hidden" }}
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
                playing={state.playing}
                ready={ready}
                onOrbit={onOrbit}
                onReady={onReady}
                label={`${cue} ${t("Arrow keys orbit; plus and minus zoom.", "Las flechas giran; más y menos acercan o alejan.")}`}
                onFailure={onFailure}
                perf={debug ? perf : undefined}
              />
            </CanvasBoundary>
          )}
        </div>
        {debug && live && (
          <pre className="perf-readout" aria-hidden="true">
            {readout}
          </pre>
        )}
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
            <Toggle
              key={name}
              variant="outline"
              className="h-11 w-11 rounded-xl bg-background shadow-sm data-[state=on]:border-foreground data-[state=on]:bg-secondary"
              aria-label={label}
              title={label}
              pressed={overlays[name]}
              onPressedChange={(on) =>
                onPreferences({ overlays: { ...overlays, [name]: on } })
              }
            >
              <Icon className="!size-5" />
            </Toggle>
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
          <Button
            type="button"
            key={p}
            size="sm"
            variant={state.phase === p ? "default" : "ghost"}
            className={cn(
              "h-11 flex-1 rounded-full px-1 text-xs",
              state.phase === p &&
                "bg-[var(--signal)] hover:bg-[var(--signal)]",
            )}
            aria-pressed={state.phase === p}
            onClick={() => player.seek(p, reduced)}
          >
            {phaseNames[p][lang]}
          </Button>
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
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          aria-label={t("Previous phase", "Fase anterior")}
          disabled={state.phase === 0}
          onClick={() => player.step(-1, reduced)}
        >
          <SkipBack className="!size-5" />
        </Button>
        <Button
          type="button"
          size="icon"
          className="play-button h-16 w-16 rounded-full"
          aria-label={
            state.playing ? t("Pause", "Pausa") : t("Play", "Reproducir")
          }
          onClick={() => player.toggle()}
        >
          {state.playing ? (
            <Pause className="!size-6" />
          ) : (
            <Play className="!size-6 translate-x-0.5" />
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          aria-label={t("Next phase", "Siguiente fase")}
          disabled={state.phase === 4}
          onClick={() => player.step(1, reduced)}
        >
          <SkipForward className="!size-5" />
        </Button>
        <Toggle
          className="half-speed h-11 rounded-full px-3 text-sm text-muted-foreground data-[state=on]:text-foreground"
          aria-label={t("Half speed", "Media velocidad")}
          pressed={speed === 0.5}
          onPressedChange={(on) => onPreferences({ speed: on ? 0.5 : 1 })}
        >
          ½×
        </Toggle>
      </fieldset>
      <p className="swing-cue">{cue}</p>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {phaseNames[state.phase][lang]}. {cue}
      </span>
    </section>
  );
}
