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

Production export, TypeScript, Biome, 11 unit tests and all 14 Playwright tests passed (on macOS and on Linux with software WebGL; the camera smoke test keeps a baseline per platform). The browser suite includes axe in both languages/themes, narrow zoom widths, offline model reload, storage migration, the poster fallback, a visual smoke test of the four camera presets and a draw-call budget check. The 348,144-byte GLB meets its 3 MB budget. The latest recorded 8.89 MiB precache exceeds the 6 MiB advisory, largely due to existing editorial assets. The scene draws 7 calls plain and 10–11 with both overlays. `?debug` now shows a live frame-time, draw-call, DPR and heap readout on the device itself; the phone measurements described in the spike record remain to be taken by hand.

The three-variant chrome comparison from the plan's section 7 was completed after the production shell, archived on the `prototype/3d-golfer` branch under `docs/prototype-3d-golfer/`, and resolved in favour of variant A, the supplied sketch.

## Viewer revision — 13 September 2026, evening

Feedback from the first device run: playback looked like a slideshow, the club sat wrongly in the hands, the club selector duplicated the menu, and the chrome should use the shadcn primitives already in the repo.

- Playback now has one clock. The golfer advances the swing inside the render loop (`useFrame` delta) and the canvas switches to `frameloop="always"` while playing, so every drawn frame carries a fresh pose and no redundant renders queue up. The poster fallback keeps its own `requestAnimationFrame` clock only while the canvas is not live. A headless probe had already shown the mixer producing one pose per rendered frame; the remaining phone check is the `?debug` readout.
- The club is solved, not guessed. At address the shaft must pass through both hands, its sole must rest on the ground, and its head must lie on the forward line through the stance centre; that point is where the ball is placed and where the target line is drawn. The solved club is then parented to the lead hand, so it opens and closes with the wrists for the rest of the clip. Camera presets are computed from the same forward direction, so Front is face-on to this capture and Side looks down the target line for either handedness.
- The body has a fresnel rim (`--golfer-rim`) and a slightly lighter charcoal so the silhouette keeps its form on both themes.
- Club selection left the home screen; the club name and loft are a button that opens the menu sheet. Menu, details, toggles, tabs, transport and phase chips use shadcn primitives (`button`, `toggle`, `toggle-group`, `sheet`, `dialog`, plus a native range styled like the slider so the scrubber can be driven per frame without React state). Element resets in `globals.css` moved into `@layer base` so utility classes win. `tailwindcss-animate` is loaded with `@plugin`.
- The view tablist is explicit markup rather than Radix Tabs: four tabs control one panel, the viewer stage, which Radix cannot express without four panels.
- Tests: club selection goes through the menu; the camera smoke test masks the readout and tolerates adaptive-DPR drift; Linux baselines regenerated. 14 of 14 pass on macOS and Linux software WebGL. Draw calls: 7 plain, 10 with both overlays.
- New dependencies: `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`. Run `bun install` after pulling.

## Club, ball and phase corrections — 13 September 2026, night

- Ball position per club and shot now comes from `getSetup().ball`, the same value the checklist shows, measured along the line between the feet; the driver's ball sits on a tee. Clubheads are modelled (blade, face and hosel for irons; crown and face for woods; a blade putter) at real sizes.
- The club is calibrated at address and at impact and blended across the backswing, because the animation's wrists differ between the two frames. Both frames now put the head on the ball.
- Phase markers were measured from the clubhead path, and each clip is trimmed to the moving part of the capture (`clipData[].trim`), removing the frozen finish that made playback look stuck.
- Camera presets aim between the chest and the ball and step back so the club stays in frame; the target line extends mainly toward the target so it no longer reads as a shaft in the down-the-line view.
- Posters are photographed from the live scene with `scripts/build-posters.mjs` (Playwright, transparent background) instead of being rendered in Blender, so the fallback matches the viewer exactly. `?capture` strips the chrome for that script; `?shot=chip|pitch|bunker` selects a wedge shot from the URL.
- The debug snapshot exposes the scene anchors (feet, ball, forward, target, clubhead), which is how the markers were measured.
