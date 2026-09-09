import { describe, expect, test } from "bun:test";
import {
  availableFaults,
  clubs,
  defaults,
  flightName,
  fromMetres,
  getSetup,
  parsePreferences,
  toMetres,
} from "./golf";

describe("Range Notes domain contracts", () => {
  test("nine observed flights have correct names for both hands", () => {
    const rh = [
      ["Pull-hook", "Pull", "Pull-slice"],
      ["Straight-hook", "Straight", "Straight-slice"],
      ["Push-hook", "Push", "Push-slice"],
    ];
    const lh = [
      ["Push-slice", "Push", "Push-hook"],
      ["Straight-slice", "Straight", "Straight-hook"],
      ["Pull-slice", "Pull", "Pull-hook"],
    ];
    for (const [i, s] of ([-1, 0, 1] as const).entries())
      for (const [j, k] of ([-1, 0, 1] as const).entries()) {
        expect(flightName(s, k, "right")).toBe(rh[i][j]);
        expect(flightName(s, k, "left")).toBe(lh[i][j]);
      }
  });
  test("carry conversion is stable without mutating canonical precision", () => {
    const canonical = toMetres(154, "yd");
    for (let n = 0; n < 100; n++)
      expect(toMetres(fromMetres(canonical, "yd"), "yd")).toBeCloseTo(
        canonical,
        10,
      );
  });
  test("untrusted browser storage rejects corruption and out of range values", () => {
    expect(parsePreferences("{bad")).toEqual(defaults);
    expect(
      parsePreferences(
        JSON.stringify({
          version: 1,
          club: "missing",
          hand: "bad",
          unit: "bad",
          carries: {
            driver: -2,
            "7iron": 140,
            putter: 7,
            "3wood": "200",
            sw: 900,
          },
        }),
      ),
    ).toEqual({ ...defaults, carries: { "7iron": 140 } });
  });
  test("all 15 clubs have bilingual setup; faults respect club and shot", () => {
    expect(clubs).toHaveLength(15);
    for (const club of clubs) {
      const setup = getSetup(club);
      expect(setup.position.en.length).toBeGreaterThan(10);
      expect(setup.position.es.length).toBeGreaterThan(10);
    }
    const driver = clubs[0],
      putter = clubs[14],
      sw = clubs.find((c) => c.id === "sw");
    if (!sw) throw new Error("sand wedge missing");
    expect(availableFaults(driver, "stock").some((f) => f.id === "sky")).toBe(
      true,
    );
    expect(availableFaults(putter, "stock").map((f) => f.id)).toEqual([
      "short",
      "long",
    ]);
    expect(availableFaults(sw, "bunker").some((f) => f.id === "fat")).toBe(
      false,
    );
    expect(
      availableFaults(sw, "bunker").some((f) => f.id === "bunker-blade"),
    ).toBe(true);
  });
});
