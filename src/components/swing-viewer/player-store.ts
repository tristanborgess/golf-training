import { type Phase, phaseAt, type SwingSpec, timeFor } from "@/lib/swing";
export function createPlayer(spec: SwingSpec, speed: 1 | 0.5 = 1) {
  let state = { t: 0, phase: 0 as Phase, playing: false, speed, spec };
  let summary = { phase: state.phase, playing: state.playing, speed, spec };
  const listeners = new Set<() => void>(),
    frames = new Set<() => void>();
  const update = (patch: Partial<typeof state>) => {
    state = { ...state, ...patch };
    state.phase = phaseAt(state.spec, state.t);
    for (const f of frames) f();
    if (
      summary.phase !== state.phase ||
      summary.playing !== state.playing ||
      summary.speed !== state.speed ||
      summary.spec !== state.spec
    ) {
      summary = {
        phase: state.phase,
        playing: state.playing,
        speed: state.speed,
        spec: state.spec,
      };
      for (const f of listeners) f();
    }
  };
  let tween = 0;
  const scrub = (t: number) => {
    cancelAnimationFrame(tween);
    update({ t: Math.max(0, Math.min(1, t)), playing: false });
  };
  const seek = (phase: Phase, instant = false) => {
    cancelAnimationFrame(tween);
    const from = state.t,
      to = timeFor(state.spec, phase);
    update({ playing: false });
    if (instant) {
      scrub(to);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const f = Math.min(1, (now - start) / 240);
      update({ t: from + (to - from) * (1 - (1 - f) ** 3) });
      if (f < 1) tween = requestAnimationFrame(step);
    };
    tween = requestAnimationFrame(step);
  };
  return {
    getSnapshot: () => summary,
    getState: () => state,
    subscribe: (f: () => void) => {
      listeners.add(f);
      return () => {
        listeners.delete(f);
      };
    },
    onFrame: (f: () => void) => {
      frames.add(f);
      return () => {
        frames.delete(f);
      };
    },
    scrub,
    seek,
    step: (direction: number, instant = false) =>
      seek(Math.max(0, Math.min(4, state.phase + direction)) as Phase, instant),
    toggle: () => {
      cancelAnimationFrame(tween);
      update({ playing: !state.playing, t: state.t >= 1 ? 0 : state.t });
    },
    advance: (delta: number, duration: number) => {
      if (state.playing) {
        const t = Math.min(1, state.t + (delta * state.speed) / duration);
        update({ t, playing: t < 1 });
      }
    },
    configure: (next: SwingSpec) => {
      cancelAnimationFrame(tween);
      update({ spec: next, t: 0, playing: false });
    },
    setSpeed: (speed: 1 | 0.5) => update({ speed }),
    dispose: () => {
      cancelAnimationFrame(tween);
      frames.clear();
      listeners.clear();
    },
  };
}
export type Player = ReturnType<typeof createPlayer>;
