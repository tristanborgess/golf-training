# 3D golfer spike

Recorded 13 September 2026. The viewer extends Range Notes' existing interface and instructional model. It uses a neutral matte mannequin with three shared motions; it does not represent a captured player or measured biomechanics.

## Asset evidence and selection

`assets-src/triage.json` inventories all 17 FBX inputs: one skinned mannequin, six drive variants, five chip variants, four putt variants and the separate drive setup. `assets-src/poses.json` records 11 bone-position samples for each of the 16 animation inputs. These records support motion inspection; they are not a coaching validation or a UI variant comparison.

| Runtime clip | Selected source | Shown window of the capture | Duration | Phase markers, normalized to the window |
| --- | --- | --- | --- | --- |
| `full` | `golf-drive-2.fbx` | 3% – 62% | 2.0 s | 0, .153, .37, .525, 1 |
| `chip` | `golf-chip-2.fbx` | 0% – 70% | 1.35 s | 0, .143, .414, .571, 1 |
| `putt` | `golf-putt-3.fbx` | 0% – 66% | 1.58 s | 0, .152, .394, .606, 1 |

The markers correspond to Address, Takeaway, Top, Impact and Finish. They were measured from the clubhead path in the running viewer (Takeaway where the head first lifts, Top at its highest point, Impact where it meets the ball) rather than estimated by eye; the earlier estimates put Impact a third of a second early. Each capture holds a static finish for the last third of its length, which is cut by the trim window so playback never freezes. `src/lib/swing-data.ts` is the runtime source of truth. The selected clips provide separate full, short and putting motions. Pitch and bunker use the chip motion with explicit approximation copy. Address holds the first frame of the selected motion; the separate setup clip is retained as an unused source.

The mannequin's `mixamorig1:` bone and vertex-group prefixes are normalized to `mixamorig:` during conversion. Runtime matching also tolerates punctuation changes in exported bone names. The model contains one mesh primitive, one matte material and no textures. Club geometry is attached at runtime to the lead hand. Its transform is solved from the pose rather than read from finger bones: the ball position comes from `getSetup(club, shot).ball` along the line between the feet, the shaft must pass through the hands and rest its sole on the ground at that spot, and the toe points away from the golfer. Because the animation's wrists differ between address and impact, the club is calibrated at both frames and the hand-local offset (and a few centimetres of shaft length) is blended between them across the backswing. Measured result: the head sits 6 cm from the ball at address and at impact for the full swing, 6 cm for the chip and 7 cm for the putt. The reach of long clubs is capped at 0.72 m ahead of the stance because the single captured posture is an iron posture.

## Asset and rendering budgets

| Check | Recorded evidence | Status |
| --- | --- | --- |
| Compressed GLB ≤3 MB | `public/models/golfer.glb`: 348,144 bytes | Within budget |
| Mannequin ≤30,000 triangles | Blender report: 28,880 triangles | Within budget for the source mannequin |
| No model textures | GLB JSON: zero textures, one material | Verified |
| Required compression | `EXT_meshopt_compression`, `KHR_mesh_quantization` | Verified in GLB |
| Three named clips | GLB animation names: `full`, `chip`, `putt` | Verified |
| Five fallback frames per clip | 15 PNGs under `public/models/poster/`, photographed from the live scene by `scripts/build-posters.mjs` so they always match the viewer | Files present |
| Scene ≤8 draw calls | Measured in the Playwright suite through `?debug` (headless Chromium, software WebGL, 390×844): 8 draw calls and about 23,600 triangles with overlays off; 13 draw calls and about 48,400 triangles with pressure and skeleton both on (the clubhead is three meshes) | Within budget; the suite asserts ≤8 plain and ≤14 with both overlays |
| Precache advisory ≤6 MiB | Latest recorded build: 8.89 MiB, largely existing editorial assets | Above advisory threshold |

The raw export is 1,351,376 bytes and stays in `assets-src/`. Raw FBX and Blender inputs do not ship to the browser. The pipeline and rebuild steps are in [build-model.md](../scripts/build-model.md).

The scene uses demand rendering, a player store that separates frame updates from React summaries, a DPR starting at 1.5 and a performance-monitor fallback to 1.25. Pressure colors are skin-weight blended in the body shader. The skeleton uses shared line geometry and instanced joints. These implementation choices do not establish a physical-device performance result.

## Interface and instructional decisions

Keep Switzer for interface copy, Plantin for editorial headings and the existing light/dark tokens in `src/app/globals.css`. The centered viewer is at most 520 px wide, inside the existing shell. Club and shot selection precede camera controls, the mannequin, phase controls, transport and one concise cue. Reference tools open in a bottom sheet on mobile and a 400 px right panel from 768 px upward. This is an extension of the incumbent identity; no alternative visual identity was introduced.

The pressure legend calls the overlay an authored coaching model. Its region values and lead/trail splits are instructional keyframes, not force-plate readings. Handedness mirrors geometry while the interface keeps readable labels. Front, side, top and back views supplement free orbit. A poster remains available while loading and after WebGL/model failure, preserving phase guidance and transport.

## Validation limits

Production export, TypeScript, Biome, 11 unit tests and all 12 Playwright tests passed. The browser suite includes software WebGL, both locales/themes, narrow zoom widths, storage migration, offline model reload and forced poster fallback.

The user's phone was unavailable. Phone frame time, memory use, cold/warm load time and the overlay frame-time increase below 20% remain unverified. Draw calls and triangles are now measured (table above).

### Phone measurement procedure

The viewer carries its own instrument, so no desktop debugger is needed. Open the app on the phone with `?debug` appended (for example `http://<mac-ip>:3001/en/?debug` against `bun run start`, or the deployed URL). A small monospace box in the lower-left corner of the viewer shows the running frame rate and frame time (a smoothed average over rendered frames only; idle gaps are ignored because the canvas renders on demand), the draw-call and triangle counts, the effective device pixel ratio and, on Chromium browsers, the JavaScript heap in MB. The same numbers are available as `window.__rangeNotesViewer.perf`.

Record, for the 7-iron full swing at 1× speed, the frame rate and frame time after one complete play in each of four states: overlays off, pressure only, skeleton only, both on. Then repeat once with the putter. Note the phone model, browser, network condition (first load over Wi-Fi versus second load from the precache) and how long the poster stayed visible before the model appeared. The plan's acceptance bar is a frame-time increase of 20% or less with both overlays on, compared with overlays off, and no memory growth across five consecutive plays. If the frame time is poor, `PerformanceMonitor` should already have dropped the DPR to 1.25; the readout shows whether it did.

The chrome comparison was completed afterwards and archived on the `prototype/3d-golfer` branch (`docs/prototype-3d-golfer/README.md`); variant A, the supplied sketch, was retained.
