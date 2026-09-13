# Implementation record

The approved scope is in ../PRODUCT.md. The prior interview settled product decisions; implementation began only on the explicit instruction “Start building Range Notes”.

## Plan evaluation

Keep the detailed Compass brief's full-bag model, progressive disclosure and local data. Retain the existing Next.js stack instead of migrating to Vite. Replace single-button left/right diagnosis with observed start plus curve. Keep generic yardages secondary; never mix carry with total distance. Distinguish full wedges from chips and bunkers. Use deterministic diagrams rather than baking labels into generated images. Treat face/path inference as approximate and dependent on centered contact, lie and wind.

The first report contains inconsistent push/path descriptions and contradictory slice-alignment cues. Neither report should be copied verbatim into the product. A clubface/path mechanism is a hypothesis, not a definitive cause inferred from a miss alone.

## Local implementation architecture

Static Next.js export with locale documents, all golf data bundled locally, an explicit same-origin precache manifest, and no backend. Local storage uses a versioned validated schema and metres as the canonical carry unit. Analytics has no network transport. Technical diagrams use literal target coordinates and live translated labels.

## Swing viewer extension — 13 September 2026

The home surface now centers the selected club's swing. Existing setup, diagnosis, bag and settings tools remain accessible through the menu sheet. The visual extension keeps Switzer/Plantin and the incumbent theme tokens: a quiet viewer at most 520 px wide, a mobile bottom sheet and a 400 px desktop right panel from 768 px. No new visual identity or UI variant comparison is claimed.

`src/lib/swing.ts` exposes phase, cue and authored pressure data; `src/lib/swing-data.ts` owns clip metadata and bone-region mapping. Components in `src/components/swing-viewer/` separate the player store, lazy Three.js canvas, golfer, camera, overlays and poster fallback. The store supplies frame listeners for animation and smaller snapshots for React controls. Demand rendering and adaptive DPR support the performance intent, while physical-device results remain pending.

Three texture-free Mixamo motions ship in the compressed mannequin: full, chip and putt. Pitch and bunker use explicitly qualified chip approximations. Pressure is an authored coaching model, never a measurement. Fifteen PNG phase frames keep guidance available during loading or 3D failure. See [the spike evidence](spike-3d-golfer.md) and [build pipeline](../scripts/build-model.md) for source mapping and asset budgets.

Production export, TypeScript, Biome, 11 unit tests and all 12 Playwright tests passed. The browser suite includes axe in both languages/themes, narrow zoom widths, offline model reload, storage migration and the poster fallback. The 348,144-byte GLB meets its 3 MB budget. The latest recorded 8.89 MiB precache exceeds the 6 MiB advisory, largely due to existing editorial assets. No target-phone load, memory, frame-time or overlay-overhead result has been established, and the complete-scene draw-call count still needs runtime measurement.
