/** Rendering cost as measured on the device. Read through `?debug`; never on by default. */
export type Perf = {
  frames: number;
  frameMs: number;
  calls: number;
  triangles: number;
  dpr: number;
  heapMb: number | null;
};
export const emptyPerf = (): Perf => ({
  frames: 0,
  frameMs: 0,
  calls: 0,
  triangles: 0,
  dpr: 0,
  heapMb: null,
});
export const formatPerf = (p: Perf) =>
  [
    p.frameMs
      ? `${(1000 / p.frameMs).toFixed(0)} fps · ${p.frameMs.toFixed(1)} ms`
      : "idle",
    `${p.calls} calls · ${p.triangles.toLocaleString("en")} tris`,
    `dpr ${p.dpr.toFixed(2)}${p.heapMb === null ? "" : ` · heap ${p.heapMb} MB`}`,
  ].join("\n");
