import { type Club, type Copy, c, getSetup, isWedge, type Shot } from "./golf";
import {
  clipData,
  fullCues,
  leadKeyframes,
  partialTopCue,
  puttCues,
} from "./swing-data";

export { phaseNames } from "./swing-data";
export type Phase = 0 | 1 | 2 | 3 | 4;
export type Region =
  | "leadFoot"
  | "trailFoot"
  | "leadLeg"
  | "trailLeg"
  | "pelvis"
  | "torso"
  | "leadArm"
  | "trailArm"
  | "head";
export type Pressure = Record<Region, number>;
export type SwingSpec = {
  clip: "full" | "putt" | "chip";
  markers: Record<Phase, number>;
  cues: Copy[];
  pressure: Record<Phase, Pressure>;
  approximation?: Copy;
};
export const phases: Phase[] = [0, 1, 2, 3, 4];
function pressure(lead: number): Pressure {
  return {
    leadFoot: lead,
    trailFoot: 1 - lead,
    leadLeg: lead * 0.9,
    trailLeg: (1 - lead) * 0.9,
    pelvis: 0.35,
    torso: 0.25,
    leadArm: 0.15,
    trailArm: 0.15,
    head: 0.05,
  };
}
export function swingFor(club: Club, shot: Shot): SwingSpec {
  const partial = isWedge(club) && shot !== "stock";
  const clip = club.system === "putter" ? "putt" : partial ? "chip" : "full";
  const cues = [...(clip === "putt" ? puttCues : fullCues)];
  if (partial) {
    cues[2] = partialTopCue;
    cues[1] = c(
      "A small turn, pressure staying forward.",
      "Un giro pequeño, manteniendo la presión adelante.",
    );
  }
  if (shot === "bunker" && partial)
    cues[0] = c(
      "Open your stance; keep pressure forward.",
      "Abre la postura; mantén la presión adelante.",
    );
  return {
    clip,
    markers: clipData[clip].markers,
    cues,
    pressure: Object.fromEntries(
      phases.map((p) => [
        p,
        pressure(
          p === 0
            ? getSetup(club, shot).leadPressure / 100
            : leadKeyframes[clip][p],
        ),
      ]),
    ) as Record<Phase, Pressure>,
    ...(partial && shot !== "chip"
      ? {
          approximation: c(
            "Chip motion shown as an approximation.",
            "Movimiento de chip como aproximación.",
          ),
        }
      : {}),
  };
}
const clamp = (t: number) =>
  Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0;
export function phaseAt(spec: SwingSpec, t: number): Phase {
  const time = clamp(t);
  return [...phases].reverse().find((p) => spec.markers[p] <= time) ?? 0;
}
export function timeFor(spec: SwingSpec, p: Phase): number {
  return spec.markers[p];
}
export function pressureAt(spec: SwingSpec, t: number): Pressure {
  const time = clamp(t),
    p = phaseAt(spec, time),
    next = Math.min(4, p + 1) as Phase;
  if (p === 4 || time === spec.markers[p]) return { ...spec.pressure[p] };
  const f = (time - spec.markers[p]) / (spec.markers[next] - spec.markers[p]),
    ease = f * f * (3 - 2 * f);
  return Object.fromEntries(
    Object.entries(spec.pressure[p]).map(([region, v]) => [
      region,
      v + (spec.pressure[next][region as Region] - v) * ease,
    ]),
  ) as Pressure;
}
export function leadTrailSplit(p: Pressure): { lead: number; trail: number } {
  const total = p.leadFoot + p.trailFoot;
  const lead = total > 0 ? p.leadFoot / total : 0.5;
  return { lead, trail: 1 - lead };
}
