# Range Notes · 3D Swing Viewer plan

Handoff plan for the agent that will implement the next version of Range Notes. Read this whole file before touching code. It extends, and where stated overrides, `PRODUCT.md`. The repo's own skills live in `.agents/skills/`; the sections below say which to call and when.

## 1. Destination

Range Notes opens on a mobile-first screen with an interactive 3D golfer at its centre. The player picks a club, watches the swing for that club play or steps through it phase by phase, orbits the model freely or snaps to a preset view, and can switch on two overlays: a pressure heatmap that shows where weight sits on the body as the swing evolves, and a stick/skeleton mode that exposes the bends in spine, arms and legs. Everything else the app already does (setup checklist, drawings, shot diagnosis, bag editor, settings, sources) moves behind a menu sheet and detail modals. The app stays a static, bilingual, offline-capable PWA with no accounts and no backend.

The reference sketch (Bon's notebook drawing) shows, top to bottom: a menu button in the top-right corner, a club dropdown ("7 iron"), a row of view tabs ("Side · Front · Top · Back", Front selected), the golfer at address filling the middle, two small toggle squares on the right edge of the canvas (the two overlays), and a transport bar with previous-phase, play and next-phase buttons.

## 2. Decisions already taken (do not reopen)

- 3D source: Adobe Mixamo's mannequin character (X Bot or Y Bot, whichever Bon exported) rigged with Mixamo's golf animation clips, converted to glTF in Blender. Mixamo's licence allows royalty-free commercial use.
- The mannequin is rendered as one matte, near-black body. Its colour is not hard-coded: it comes from a CSS token (`--golfer`, dark ink on the light theme, a light warm grey on the dark theme) so the silhouette never disappears against the dark background. A subtle rim light keeps the edges readable in both themes. Strip or ignore Mixamo's own textures and seams; the joint segmentation of the mesh may stay visible as faint geometry.
- The viewer becomes the home screen. The current intro hero, the two entry-path buttons and the desktop club rail are removed.
- The seven SVG drawing families are kept behind detail modals in the sheet. The five-frame stick "Sequence" drawing is retired; the 3D model replaces it.
- The stack does not change: Next 16 App Router with `output: "export"`, React 19, Bun, Tailwind v4 tokens in `globals.css`, Radix primitives, Biome, Playwright with axe. `npm install` stays blocked.
- Existing behaviour to preserve: `/en/` and `/es/` routes, `?view=` deep links (extended, never broken), the `range-notes:v1` storage key and its validated schema (migrated to v2, never dropped), the `c("English", "Español")` copy convention, the offline precache flow, WCAG AA in both themes, reduced motion, 200% zoom, keyboard and touch parity.
- Pressure data is an authored coaching model, not a measurement. Copy must say so wherever it appears.

## 3. Baseline: what is there today

Read these before designing anything:

| Path | What it is | Fate |
| --- | --- | --- |
| `src/components/range-notes.tsx` (1455 lines) | The whole tool: header, intro, entry paths, club rail, setup panel, diagnosis, bag, settings, offline status | Split. Header and offline logic survive; layout is replaced by the viewer shell + sheet |
| `src/components/golf-diagrams.tsx` (1469 lines) | Seven SVG drawing families incl. `Sequence` with the 5 `Pose` keyframes and `phaseNames` | Keep all but `Sequence`; move `phaseNames` into the new swing module |
| `src/lib/golf.ts` (842 lines) | Clubs, `getSetup()` (includes `leadPressure` per club/shot), faults, flight logic, `Preferences` v1, `parsePreferences`, `track()` | Extend. `leadPressure` becomes the anchor for the heatmap's address frame |
| `src/app/globals.css` (1755 lines) | All tokens and component styles; light default, `.dark` overrides | Add viewer/sheet styles with the same tokens; delete rail/intro styles once unused |
| `src/app/[locale]/layout.tsx`, `page.tsx`, `sources/page.tsx` | Locale layout, home, methodology page | Home renders the viewer shell |
| `public/sw.js`, `scripts/prepare-offline.mjs` | Same-origin precache of everything under `out/` | Unchanged; GLB files placed in `public/models/` get precached automatically. Watch the size |
| `tests/range-notes.spec.ts` | 7 Playwright specs covering clubs, drawings, handedness, carries, storage, offline, axe | Rewrite the navigation parts; add viewer specs |
| `src/lib/golf.test.ts` | Bun unit tests for the model | Add `swing.test.ts` beside it |
| `docs/implementation-notes.md` | Implementation record | Append a section for this work |

Also present: `src/app/[locale]/page 2.tsx`, duplicated `docs/*2.md` and `public/images/* 2.jpg` files, `skills-lock 2.json`. These are Finder duplicates. Delete them in the first commit.

Color code already used by the drawings and to be carried into 3D: green for the player's body or reference (`--diagram-green`), orange for the ball or what was observed (`--signal`), blue for the target or club path (`--diagram-blue`).

## 4. Product specification

### 4.1 Home screen (the viewer)

Single column on phones, the canvas taking the space between controls. On ≥ 768px the same composition centred at a max width of about 520px; the sheet becomes a side panel. Never a two-column workbench.

Top to bottom:

1. **Header**: wordmark left, menu button right (`Menu` icon from lucide). The language link and settings icon move into the sheet. Offline and storage notices render as a slim strip under the header, same copy as today.
2. **Club selector**: a native `<select>` styled as the pill in the sketch (current `mobile-club` control, promoted). Options grouped with `<optgroup>` by club group. Changing the club swaps the clip, resets to address, keeps the current view and overlays. For wedges a second, smaller segmented control appears under it: Stock · Chip · Pitch · Bunker (existing `shotNames`).
3. **View tabs**: Side · Front · Top · Back, as a `role="tablist"` of four buttons. Selecting one animates the camera to the preset. A free orbit gesture clears the selection (no tab highlighted) and shows a small "Reset view" text button at the right end of the row. Definitions, for a right-hander with the target to the viewer's left in Front view:
   - Front = face-on: camera in front of the golfer's chest, horizontal.
   - Side = down the line: camera behind the golfer on the target line, looking toward the target.
   - Back = camera behind the golfer's back, opposite of Front.
   - Top = overhead, slightly tilted so the club is readable.
   Left-handers: the model is mirrored, so Side and the target direction mirror with it; tab names stay the same.
4. **Canvas**: the golfer on a quiet ground disc with a target line (blue) and ball (orange). Two icon toggles float on the right edge of the canvas, stacked, as in the sketch: **Pressure** (heatmap) and **Skeleton**. Both can be on at once. Each has an accessible name, a pressed state and a 44px target. A one-line legend appears under the canvas when Pressure is on (low → high ramp, "authored coaching model").
5. **Phase strip**: five chips, Address · Takeaway · Top · Impact · Finish (existing `phaseNames`), with the active phase filled. Tapping a chip scrubs to that phase marker. Between the chips and the transport sits a thin scrubber (`<input type="range">`, 0..1) for fine positioning; hidden at 200% zoom on very narrow widths if it does not fit, chips are the primary path.
6. **Transport**: previous phase · play/pause · next phase, three large buttons as sketched. Play runs the clip from the current time to the finish at 1× and stops there (a second press restarts from address). Long-press on play, or a "½×" text toggle beside it, plays at half speed. Previous/next step to the neighbouring phase marker with a short eased transition (instant under reduced motion). Arrow keys mirror previous/next when the transport has focus; space toggles play.
7. **Cue line**: one sentence under the transport for the current phase, taken from the existing `fullCues` / `puttCues` / `partialTopCue`, plus the pressure split in words when Pressure is on ("Pressure 70% trail"). This line is also the canvas's live description for screen readers.

### 4.2 Menu sheet

Opened by the header button. Radix Dialog (already a dependency) styled as a bottom sheet on phones (drag handle, 90% height, scrollable) and a right-side panel from 768px. Focus trapped, Escape closes, background inert. Contents in order:

1. **Club** section: the grouped club list (today's rail content) as a vertical list with the current club marked. Selecting closes the sheet and updates the viewer.
2. **This swing** section, for the selected club and shot: a set of rows that each open a modal:
   - Setup checklist (stance, ball position, posture, pressure, grip, tempo, intent, use) with the overhead, face-on and down-the-line drawings inside the modal, tabbed.
   - Grip, with the weak/neutral/strong control and the grip drawing.
   - Contact, with the low-point/clean-contact drawing.
   - Face and path, with the face/path drawing.
   - Carry: the editable personal carry and the qualified reference distances (existing `CarryField`, `CarryReference`).
3. **Fix a shot**: opens the diagnosis flow as a full-height modal. Content and logic unchanged (`Diagnosis` component). Faults that point at the `sequence` diagram now offer "Show in the swing" which closes the modal and scrubs the viewer to the relevant phase with Skeleton on.
4. **Your bag**: the existing bag editor as a modal.
5. **Settings**: handedness, units, language, theme, "Save for the range" with the truthful offline status, reset. Same copy as today.
6. **The approach**: link to `/[locale]/sources/`.

### 4.3 Deep links and state

Extend the existing `?view=` scheme rather than replacing it: `?view=viewer` (default, may be omitted), `?view=fix`, `?view=bag`, `?view=settings` open the matching modal over the viewer, so today's links keep working. Add `?club=<id>`, `?look=front|side|top|back`, `?phase=0..4` for sharing a specific pose. Use `history.replaceState` as today.

Persisted preferences move to `version: 2`: everything from v1 plus `overlays: { pressure: boolean; skeleton: boolean }`, `look: "front" | "side" | "top" | "back"`, `speed: 1 | 0.5`. `parsePreferences` must migrate v1 → v2 with defaults (`look: "front"`, both overlays off, speed 1) and still recover from corrupt input.

### 4.4 Handedness

Right-handed is the authored clip. Left-handed mirrors the golfer group with `scale.x = -1` (with `material.side` handled so faces render correctly) and mirrors the target line and ball. Pressure regions are named lead/trail, so they follow the mirror without extra logic. Text is never mirrored.

### 4.5 Clubs, shots and clips

| System / shot | Clip | Notes |
| --- | --- | --- |
| driver, wood, iron stock | full swing clip | One clip, the club mesh swapped or scaled by club (see 6.3) |
| wedge chip, pitch | full swing clip trimmed: play from address to a shorter "Top" marker and on to finish | Mark as an approximation in the cue line if no dedicated clip exists |
| wedge bunker | same as pitch with the open-stance cue | Same |
| putter | putt clip | Uses `puttCues` |

The clips are already downloaded: Golf Drive (six variants), Golf Drive Setup, Golf Chip (five variants) and Golf Putt (four variants), inventoried in `assets-src/README.md`. A dedicated chip clip exists, so chip, pitch and bunker use it; the `approximation` copy is only needed if pitch and bunker feel too far from the chosen chip motion. Phase 0 triages the variants and picks one per app clip. Golf Drive Setup is a candidate for an idle hold at Address.

### 4.6 Accessibility and fallbacks

- The canvas element carries `role="img"` and an `aria-label` that is the current cue line; updates are announced through a visually hidden `aria-live="polite"` region, throttled to phase changes (never per frame).
- Every control is reachable by keyboard with a visible focus ring using `--ring`.
- Reduced motion: no autoplay on load, camera transitions instant, play still available on explicit press but at half speed by default.
- WebGL unavailable or the model failing to load: show the poster fallback, five pre-rendered PNG frames of the model (one per phase, generated during the asset pipeline) driven by the same phase strip and transport. The fallback is the only content the test runner may see when the GPU is missing, so it must be complete.
- Contrast: overlays and the legend use tokens, checked with axe in both themes.
- Touch targets 44px or larger. The floating overlay toggles must not overlap the model's head in Front view on a 360px-wide screen.

## 5. Domain model: the `swing` module

Design this with the vocabulary in `.agents/skills/codebase-design/SKILL.md`. It is a deep module: the viewer, the cue line, the tests and the poster generator all cross one small interface.

`src/lib/swing.ts` exports:

```ts
export type Phase = 0 | 1 | 2 | 3 | 4; // Address, Takeaway, Top, Impact, Finish
export const phaseNames: Copy[]; // moved from golf-diagrams.tsx

export type Region =
  | "leadFoot" | "trailFoot" | "leadLeg" | "trailLeg"
  | "pelvis" | "torso" | "leadArm" | "trailArm" | "head";

export type Pressure = Record<Region, number>; // 0..1, authored

export type SwingSpec = {
  clip: "full" | "putt" | "chip"; // glTF animation name lives in swing-data
  markers: Record<Phase, number>; // normalised 0..1 along the clip
  cues: Copy[]; // five, one per phase
  pressure: Record<Phase, Pressure>; // keyframes at the markers
  approximation?: Copy; // shown when a clip stands in for another shot
};

export function swingFor(club: Club, shot: Shot): SwingSpec;
export function pressureAt(spec: SwingSpec, t: number): Pressure; // smooth interpolation between keyframes
export function phaseAt(spec: SwingSpec, t: number): Phase; // nearest marker at or before t
export function timeFor(spec: SwingSpec, phase: Phase): number;
export function leadTrailSplit(p: Pressure): { lead: number; trail: number }; // for the cue line, sums to 1
```

Rules:

- `pressure[0]` (Address) is derived from `getSetup(club, shot).leadPressure` so the checklist and the heatmap can never disagree.
- Authored keyframes for Takeaway, Top, Impact and Finish live in `src/lib/swing-data.ts` as data, with a short comment citing the coaching sources already listed in `golf.ts` `sources`. Typical shape: pressure moves toward the trail side through Takeaway and Top, shifts sharply to the lead side by Impact, and settles almost fully on the lead leg at Finish; putting stays centred throughout; chips and bunker shots start and stay lead-heavy.
- `swing-data.ts` also owns the rig mapping: `regionBones: Record<Region, string[]>` for the Mixamo bone names (`mixamorig:LeftFoot`, `mixamorig:LeftLeg`, `mixamorig:Spine1`, ...). "Lead" resolves to left-side bones for the authored right-handed clip; the mirror handles left-handers.
- Unit tests in `src/lib/swing.test.ts`: markers monotonic and inside [0,1] for every club and shot; `pressureAt` at a marker equals the keyframe; `leadTrailSplit` sums to 1; Address pressure matches `getSetup`; every phase has a cue in both languages; wedge shots return the approximation copy when they reuse the full clip.

## 6. 3D architecture

### 6.1 Dependencies

Add with Bun: `three`, `@types/three`, `@react-three/fiber@^9.7`, `@react-three/drei@^10.7`. Do not add zustand or any state library separately; R3F already depends on zustand internally but the viewer state below uses `useSyncExternalStore` on a tiny store.

Compatibility facts (verified September 2026):

- `@react-three/fiber` 9.7 declares `react >=19 <19.3`. The repo pins `react`/`react-dom` `19.2.0`; keep the `19.2.x` line until Fiber publishes a 19.3 range. Do not bump React as part of this work.
- Fiber's docs still suggest `transpilePackages: ["three"]` in `next.config.ts`. Add it only if the build complains; Turbopack has handled plain `three` imports in recent versions.
- The React Compiler (`babel-plugin-react-compiler` 1.0.0 is installed) flags mutation of memoised values. Keep every mutable three object in `useRef` and mutate only inside `useFrame`. Put `"use no memo"` at the top of scene components if the compiler produces wrong output.
- `next/dynamic(..., { ssr: false })` is only allowed inside a Client Component. The lazy import of the canvas therefore lives in a `"use client"` file, not in `page.tsx`.

### 6.2 File layout

```
src/components/swing-viewer/
  swing-viewer.tsx        client shell: header slot, selector, tabs, canvas or poster, strip, transport, cue
  swing-canvas.tsx        R3F <Canvas> (lazy, ssr:false), lights, ground, <Golfer>, <CameraRig>, perf helpers
  golfer.tsx              useGLTF + useAnimations, scrub from the player store, mirror, club swap
  heatmap-material.ts     material patch (onBeforeCompile) reading skin indices/weights + per-bone pressure uniform
  skeleton-overlay.tsx    bone-to-bone lines and joints from bone world positions, ghosted mesh
  camera-rig.tsx          drei <CameraControls>, presets, free-orbit detection
  poster-fallback.tsx     five PNG frames driven by the same store
  player-store.ts         time, phase, playing, speed; subscribe/getSnapshot; no React state for time
  use-swing-player.ts     React hook over the store for controls (phase, playing, speed, actions)
src/components/menu-sheet.tsx     Radix Dialog sheet with the six sections
src/components/detail-modals.tsx  setup, grip, contact, face/path, carry, bag, fix, settings modals (reuse existing pieces)
src/lib/swing.ts, swing-data.ts, swing.test.ts
public/models/golfer.glb          compressed rig + clips
public/models/poster/{0..4}.png   fallback frames
assets-src/                        raw Mixamo FBX exports (16 clips + mannequin, 46 MB, already present with README.md) and the Blender file once it exists
scripts/build-model.md             the asset pipeline, step by step
```

Keep `range-notes.tsx` as the top-level orchestrator (preferences, offline, install prompt) but reduce it to composition. The seam between orchestrator and viewer is: `club`, `shot`, `hand`, `lang`, `prefs.overlays`, `prefs.look`, `prefs.speed`, and callbacks. The viewer never reads storage itself.

### 6.3 Model and asset pipeline (`scripts/build-model.md`)

1. Bon has downloaded the mannequin in T-pose as FBX "with skin" and each golf clip as FBX, 30 fps, no keyframe reduction, into `assets-src/`. If a clip file also carries a skin (large file, includes a mesh), discard that mesh in Blender and keep only its action. Replace the mannequin's materials with one `MeshStandardMaterial` (roughness about 0.8, metalness 0, no texture) whose colour the app sets at runtime from the `--golfer` token. Without textures the GLB shrinks well under budget.
2. Blender 4.x is installed on Bon's Mac and has been opened once. Write the conversion as a script, `scripts/build-model.py`, and run it headless: `/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/build-model.py`, so the export is reproducible without clicking through the UI. If the agent runs somewhere without that Blender, `pip install bpy` gives the same Python API. In the script: import the character, import each clip, push clips onto the character as NLA actions named `full`, `putt`, `chip` (whichever exist). Delete Mixamo's extra armature copies. Add or import three simple club meshes (driver, iron, putter) parented to `mixamorig:RightHand` with a shared grip point; or one iron mesh scaled per club. Export glTF binary with animations, skinning, no cameras/lights, textures embedded.
3. Compress with `@gltf-transform/cli` (`bunx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp`), then register `MeshoptDecoder` in `useGLTF`. Budget: whole `golfer.glb` ≤ 3 MB, ≤ 30k triangles, one 1024px texture set, ≤ 8 draw calls. Record the achieved numbers in the doc.
4. Render five poster PNGs (one per phase, Front view, 720×960, transparent background) from Blender or from a Playwright script against the running app. Store in `public/models/poster/`.
5. Note the exact animation names and durations in `swing-data.ts`. A Playwright spec reads them from the loaded model and asserts they match.

The offline precache (`prepare-offline.mjs`) walks `out/`, so the GLB and posters are cached automatically. Extend the script to print total bytes and warn above 6 MB so the "Preparing offline…" step stays honest about what it downloads.

### 6.4 Playback

- `player-store.ts` holds `{ t: number (0..1), playing: boolean, speed: 1 | 0.5, spec: SwingSpec }` in a plain object with `subscribe`. Continuous time never enters React state.
- `golfer.tsx`: `const { actions, mixer } = useAnimations(animations, group)`. On spec change: stop all, `action.reset().play(); action.paused = true`. In `useFrame((_, delta))`: if playing, advance `t` by `delta * speed / clip.duration`, stop at 1; then `action.time = t * clip.duration`. drei's `useAnimations` already calls `mixer.update(delta)` every frame, so a paused action with an explicitly set `time` renders exactly that pose.
- `frameloop="demand"`. Call `invalidate()` whenever `t`, the camera or an overlay changes. Playing schedules invalidation each frame through `useFrame`.
- Phase chips and prev/next call `timeFor(spec, phase)` and tween `t` there over 240 ms (0 ms under reduced motion).

### 6.5 Camera

drei `<CameraControls makeDefault>` with `touches={{ one: ACTION.TOUCH_ROTATE, two: ACTION.TOUCH_DOLLY_TRUCK }}`, `minDistance`/`maxDistance` clamped around the model, `smoothTime` ≈ 0.25. Presets call `rotateTo(azimuth, polar, true)` then `fitToBox(golferBounds)` once on load. Suggested angles for the right-handed clip, assuming the golfer faces −Z and the target is +X: Front azimuth 0, polar 85°; Side azimuth −90° (mirror sign for left-handers), polar 85°; Back azimuth 180°; Top azimuth 0, polar 8°. Verify against the actual rig orientation in Phase 0 and record the final numbers. Listen to the controls' `controlstart` event from user input to clear the selected tab.

### 6.6 Pressure heatmap

Per vertex, in the vertex shader, weight = Σ skinWeight[i] × uPressure[skinIndex[i]] where `uPressure` is a `float[boneCount]` uniform filled each frame from `pressureAt(spec, t)` through `regionBones`. Bones outside any region get 0. Pass the weight to the fragment shader and mix the base colour with a three-stop ramp: the body colour at 0, a muted warm mid-tone around 0.5, `--signal` (orange) at 1, with `uHeatmapMix` 0 or 1 to toggle without swapping materials. On the dark body the ramp reads like a thermal image; on the dark theme the lighter body needs the mid-stop to stay distinct from the base, so check both with the legend. Implement as `onBeforeCompile` on the character's existing `MeshStandardMaterial` so lighting stays consistent; include the standard `<skinning_vertex>` chunks so the patch survives the skin transform. Read token colours from CSS variables at mount and on theme change (`MutationObserver` on `html.class` or `next-themes` `useTheme`), converting to linear space.

Feet get special treatment: the lead/trail foot regions also tint the ground disc under each foot with a soft radial spot, so the weight shift reads even from Top view.

### 6.7 Skeleton overlay

Compute joint world positions each frame from the bones listed in `swing-data.ts` (head, neck, spine chain, shoulders, elbows, wrists, hips, knees, ankles, toes, plus the club grip and head). Draw segments with drei `<Line>` (`lineWidth` in pixels, 3 on phones) in `--diagram-green`, joints as a small instanced sphere set, the club shaft in `--diagram-blue`. When Skeleton is on, set the character material opacity to 0.15 (`transparent`, `depthWrite=false`). Optional stretch: three small readouts under the canvas (shoulder turn, hip turn, spine tilt in degrees) computed from bone transforms, labelled as approximate.

### 6.8 Performance and battery

- `dpr={[1, 2]}` with drei `<AdaptiveDpr pixelated />` and `<PerformanceMonitor>` dropping to 1.25 on decline.
- `powerPreference: "high-performance"`, `antialias` on, no post-processing, no real-time shadows; a baked radial-gradient contact shadow plane instead.
- Lights: one hemisphere + one directional, colours from tokens per theme.
- The canvas chunk (three + fiber + drei subset, roughly 330 KB gzipped) loads only when the viewer mounts and after first paint of the controls; the poster shows until the model is ready. The rest of the app must not import three.
- Dispose the GLTF, materials and controls on unmount; iOS Safari leaks WebGL contexts otherwise.

## 7. Visual design notes

Use `.agents/skills/redesign-existing-projects/SKILL.md` for the sheet and modal work (this is a focused upgrade of an existing product surface, not a marketing page, so `design-taste-frontend` does not apply). Keep the existing typography (Switzer body, Plantin editorial), tokens and radii. The viewer is calm: paper background, no gradients behind the model, the orange reserved for the ball, the heatmap and the current phase chip. The canvas has no visible border; the ground disc and a faint horizon line give it depth. Run the product-copy pass from `references/product-ui-evaluation.md` on every new string, in both languages.

Before building the sheet and modal layouts for real, build the UI variant prototype described in `.agents/skills/prototype/UI.md`: three variations of the viewer chrome on one route (`/[locale]/prototype/`) switchable by search param, to settle the density of the transport, the placement of the overlay toggles and the sheet's section order. Delete the route once the decision is folded in.

## 8. Phased delivery

Each phase ends with typecheck, lint, the unit tests, and the Playwright suite green, then a commit. Use `.agents/skills/implement/SKILL.md` for each phase and `.agents/skills/code-review/SKILL.md` before merging, with the fixed point being the commit at the start of the phase and this document as the spec.

### Phase 0 · Spike (one session, throwaway branch `prototype/3d-golfer`)

Goal: remove the unknowns before any production code.

- Open every FBX in `assets-src/` in Blender, note each clip's duration and motion, pick one variant per app clip, then export the mannequin + chosen clips as GLB following 6.3. Record chosen variants, durations, triangle count and file size in `assets-src/README.md` and `swing-data.ts`.
- Load the GLB in a bare R3F canvas inside this Next app (static export must still build). Scrub with `action.paused = true; action.time = t`. Confirm the React Compiler and Turbopack do not break it.
- Measure on Bon's phone: frame time while playing, memory, load time over the precache. Try `dpr` 1.5 vs 2.
- Verify the rig's forward axis and record the preset azimuths for 6.5.
- Decide: does a dedicated chip clip exist? Does one club mesh scaled per club look acceptable, or are three meshes needed?

Exit criteria: a short `docs/spike-3d-golfer.md` with the numbers and decisions, linked from the implementation notes. Nothing from the spike is merged as-is.

### Phase 1 · Domain module and assets

- Add dependencies (6.1). Pin React to the 19.2 line explicitly.
- `swing.ts`, `swing-data.ts`, `swing.test.ts` (section 5). Move `phaseNames` and the cue arrays out of `golf-diagrams.tsx`.
- Commit `public/models/golfer.glb`, posters and `scripts/build-model.md`. Extend `prepare-offline.mjs` with the size report.
- Delete the Finder duplicate files listed in section 3.

Acceptance: `bun test src` green with the new tests; `bun run build` succeeds; `precache.json` lists the model and posters.

### Phase 2 · Viewer shell and new home

- Build `swing-viewer/*` without overlays: canvas, golfer, camera presets, phase strip, transport, cue line, poster fallback, player store.
- Replace the home layout: header with menu button, club selector, view tabs, viewer. Remove intro, entry paths and rail. Move handedness and units into settings.
- Build `menu-sheet.tsx` and `detail-modals.tsx`, reusing `Diagnosis`, the setup checklist rows, `CarryField`, `CarryReference`, `Glossary`, the bag editor and settings content from `range-notes.tsx`. Wire `?view=` compatibility and the new `?club=`, `?look=`, `?phase=` params.
- Preferences v2 with migration.
- Remove `Sequence` from `golf-diagrams.tsx` and its `frame-controls` UI. Faults with `diagram: "sequence"` get the "Show in the swing" action.

Acceptance: every club and shot plays; all four presets and free orbit work by touch, mouse and keyboard; every existing detail (checklist, six remaining drawings, grip control, carry editing, diagnosis, bag, settings, sources link, offline status, install prompt) is reachable from the sheet; deep links from the old scheme still open the right thing; reduced motion respected; poster fallback renders when WebGL is disabled.

### Phase 3 · Overlays

- Heatmap material and ground spots (6.6), legend and cue-line pressure split.
- Skeleton overlay (6.7) with ghosted mesh.
- Both overlays persist in preferences.

Acceptance: toggles are keyboard operable with pressed state; pressure at Address matches the checklist's pressure line for every club and shot (unit test) and the heatmap uniform matches `pressureAt` (Playwright, via exposed state); no frame-time regression beyond 20% on the spike's phone measurement with both overlays on.

### Phase 4 · Shots, handedness, polish

- Wedge chip/pitch/bunker and putter clip routing (4.5), approximation copy.
- Left-handed mirror, including target line, ball, camera Side preset and the ground spots.
- Half-speed play, scrubber, "Reset view".
- Run the subtraction pass from the redesign skill on the whole screen; run the product-copy pass on all new strings.

Acceptance: switching handedness never changes any text; the Side preset looks down the target line for both hands; the axe suite passes in both languages and themes at mobile and desktop widths.

### Phase 5 · Verification and documentation

- Playwright: launch Chromium with `--use-gl=angle --use-angle=swiftshader-webgl --enable-unsafe-swiftshader` in `playwright.config.ts` so WebGL exists headless. Expose a read-only `window.__rangeNotesViewer` (`{ t, phase, look, overlays, clipName, clipDuration, pressure }`) in non-production builds or behind a query flag, and assert against it rather than pixels. One `toHaveScreenshot` smoke per preset with a generous threshold is enough.
- Add specs: clip names and durations match `swing-data.ts`; phase chips and transport move `t` to the markers; presets set the camera azimuth/polar; overlays toggle and persist; preferences v1 → v2 migration; offline reload with the model cached; poster fallback when WebGL is blocked (`--disable-gpu` + no swiftshader flags in a second project).
- Update `README.md` (what it does, project layout, verifying a change), `PRODUCT.md` (section 9 below) and `docs/implementation-notes.md`.

## 9. Amendments to `PRODUCT.md`

Apply these edits in Phase 5 so the spec stays the single approved source:

- "Open directly into two equally prominent actions" becomes "Open directly into the 3D swing viewer for the selected club; Set up a club and Fix a shot live in the menu sheet."
- "Seven technical SVG families" becomes six; the five-stage sequence is replaced by "an interactive 3D swing with five named phases, free orbit and four preset views, an authored pressure heatmap and a skeleton overlay".
- "One consistent male editorial character" now refers to the illustrations only. The 3D golfer is a neutral matte mannequin coloured by a theme token; the approved illustrations in `public/images` stay as editorial art in the sheet and the sources page.
- Add to persistence: overlays, view preset and playback speed.
- Add to evidence: pressure keyframes are an authored coaching model derived from the cited sources, shown as such.
- Add the model asset budget and the poster fallback to the accessibility and offline requirements.

## 10. Risks and open items

- The Mixamo variants are numbered, not named, so telling them apart needs a look in Blender. Pick by tempo and a held finish, not by file size.
- `assets-src/` adds 46 MB of binaries to the repository. Commit them once (the plan needs a reproducible pipeline) or move the T-pose file to Git LFS if the repo host complains; never edit or re-export them in place.
- `@react-three/fiber` peer range excludes React 19.3. A future dependency bump could break the install; the pin is deliberate.
- Realism gap: a mocap clip will not match every coaching cue word for word (for example the clip's hip turn at Top may be larger than the cue implies). Cues describe intent; do not rewrite cues to match the actor, and do not edit the clip beyond trimming.
- iOS Safari memory: one GLB, one texture set, dispose on unmount. If the spike shows crashes on older phones, drop the texture to 512px before dropping polygons.
- Precache growth: the model adds a few megabytes to every version's offline download because the cache is versioned by content hash. Acceptable at ≤ 3 MB; revisit if the asset grows.
- The heatmap reads authored data. It must never be presented as a measurement of the player.

## 11. Suggested skills for the next agent

All in `.agents/skills/`; call them with the Skill tool by name.

- `prototype` for Phase 0 and the UI variants in section 7 (read `UI.md`).
- `codebase-design` when shaping `swing.ts` and the viewer seam (section 5, 6.2).
- `redesign-existing-projects` for the sheet, modals and the final subtraction pass; read `references/product-ui-evaluation.md`.
- `implement` for each phase; `code-review` at each phase end with this file as the spec.
- `research` to confirm Mixamo clip names and anything else this plan marks unverified; save findings under `docs/`.
- `grill-with-docs` only if a decision in section 2 turns out to be impossible; otherwise the decisions stand.

## 12. Reference facts gathered for this plan (September 2026)

- three 0.186, `@react-three/fiber` 9.7.0 (peer `react >=19 <19.3`), `@react-three/drei` 10.7.8, `camera-controls` 3.1.x, `@gltf-transform/cli` 4.5.
- drei `useAnimations` calls `mixer.update(delta)` in its own `useFrame`; a paused action with `time` set renders that exact pose.
- Chrome 141+ needs `--enable-unsafe-swiftshader` for software WebGL in headless runs.
- Mixamo: royalty-free for commercial projects, Adobe ID required. Ready Player Me shut down its avatar service in January 2026 and is not an option. CMU mocap subjects 63 and 64 hold free golf swing and putt captures if a second source is ever needed.
- Approximate added bundle: three core + GLTFLoader ≈ 154 KB gz; with fiber ≈ 250 KB; with the drei subset ≈ 335 KB gz, loaded only on the viewer.
