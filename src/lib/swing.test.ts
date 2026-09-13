import { expect, test } from "bun:test";
import { clubs, getSetup, parsePreferences } from "./golf";
import {
  leadTrailSplit,
  phaseAt,
  phases,
  pressureAt,
  swingFor,
  timeFor,
} from "./swing";

test("all clubs and shots share consistent markers, bilingual cues and pressure", () => {
  for (const club of clubs)
    for (const shot of ["stock", "chip", "pitch", "bunker"] as const) {
      const spec = swingFor(club, shot);
      let previous = -1;
      for (const phase of phases) {
        const t = timeFor(spec, phase);
        expect(t).toBeGreaterThan(previous);
        expect(t).toBeLessThanOrEqual(1);
        previous = t;
        expect(phaseAt(spec, t)).toBe(phase);
        expect(pressureAt(spec, t)).toEqual(spec.pressure[phase]);
        expect(spec.cues[phase].en.length).toBeGreaterThan(5);
        expect(spec.cues[phase].es.length).toBeGreaterThan(5);
      }
      expect(leadTrailSplit(pressureAt(spec, 0)).lead * 100).toBeCloseTo(
        getSetup(club, shot).leadPressure,
      );
      for (let i = 0; i <= 100; i++) {
        const p = pressureAt(spec, i / 100),
          split = leadTrailSplit(p);
        expect(split.lead + split.trail).toBe(1);
        for (const value of Object.values(p)) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
        }
      }
    }
});
test("v1 migrates without losing carries, v2 validates viewer preferences", () => {
  const old = parsePreferences(
    JSON.stringify({
      version: 1,
      club: "driver",
      hand: "left",
      unit: "m",
      carries: { driver: 200 },
    }),
  );
  expect(old.version).toBe(2);
  expect(old.carries.driver).toBe(200);
  expect(old.look).toBe("front");
  expect(old.overlays.pressure).toBe(false);
  const current = parsePreferences(
    JSON.stringify({
      ...old,
      look: "top",
      speed: 0.5,
      overlays: { pressure: true, skeleton: true },
    }),
  );
  expect(current.look).toBe("top");
  expect(current.speed).toBe(0.5);
  expect(current.overlays.skeleton).toBe(true);
  expect(
    parsePreferences(JSON.stringify({ ...old, look: "unknown", speed: 3 }))
      .look,
  ).toBe("front");
});
test("dedicated chip motion and qualified pitch/bunker approximation", () => {
  const wedge = clubs.find((c) => c.id === "sw");
  if (!wedge) throw new Error("Missing sand wedge");
  expect(swingFor(wedge, "chip").clip).toBe("chip");
  expect(swingFor(wedge, "chip").approximation).toBeUndefined();
  expect(swingFor(wedge, "pitch").approximation?.es).toBeTruthy();
  expect(swingFor(clubs[14], "stock").clip).toBe("putt");
});
