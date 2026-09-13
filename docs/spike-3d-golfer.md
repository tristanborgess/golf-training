# 3D golfer spike

Recorded 13 September 2026. The viewer extends Range Notes' existing interface and instructional model. It uses a neutral matte mannequin with three shared motions; it does not represent a captured player or measured biomechanics.

## Asset evidence and selection

`assets-src/triage.json` inventories all 17 FBX inputs: one skinned mannequin, six drive variants, five chip variants, four putt variants and the separate drive setup. `assets-src/poses.json` records 11 bone-position samples for each of the 16 animation inputs. These records support motion inspection; they are not a coaching validation or a UI variant comparison.

| Runtime clip | Selected source | Source frames at 30 fps | Duration | Phase markers, normalized |
| --- | --- | --- | --- | --- |
| `full` | `golf-drive-2.fbx` | 1–103 | 3.4 s | 0, .12, .24, .33, 1 |
| `chip` | `golf-chip-2.fbx` | 1–59 | 58/30 s | 0, .12, .28, .4, 1 |
| `putt` | `golf-putt-3.fbx` | 1–73 | 2.4 s | 0, .12, .28, .4, 1 |

The markers correspond to Address, Takeaway, Top, Impact and Finish. `src/lib/swing-data.ts` is the runtime source of truth. The selected clips provide separate full, short and putting motions. Pitch and bunker use the chip motion with explicit approximation copy. Address holds the first frame of the selected motion; the separate setup clip is retained as an unused source.

The mannequin's `mixamorig1:` bone and vertex-group prefixes are normalized to `mixamorig:` during conversion. Runtime matching also tolerates punctuation changes in exported bone names. The model contains one mesh primitive, one matte material and no textures. Club geometry is attached at runtime from the wrist and middle-finger direction.

## Asset and rendering budgets

| Check | Recorded evidence | Status |
| --- | --- | --- |
| Compressed GLB ≤3 MB | `public/models/golfer.glb`: 348,144 bytes | Within budget |
| Mannequin ≤30,000 triangles | Blender report: 28,880 triangles | Within budget for the source mannequin |
| No model textures | GLB JSON: zero textures, one material | Verified |
| Required compression | `EXT_meshopt_compression`, `KHR_mesh_quantization` | Verified in GLB |
| Three named clips | GLB animation names: `full`, `chip`, `putt` | Verified |
| Five fallback frames per clip | 15 PNGs under `public/models/poster/` | Files present |
| Scene ≤8 draw calls | Model has one primitive; scene also draws club, ground, ball and overlays | Runtime total still requires measurement |
| Precache advisory ≤6 MiB | Latest recorded build: 8.89 MiB, largely existing editorial assets | Above advisory threshold |

The raw export is 1,351,376 bytes and stays in `assets-src/`. Raw FBX and Blender inputs do not ship to the browser. The pipeline and rebuild steps are in [build-model.md](../scripts/build-model.md).

The scene uses demand rendering, a player store that separates frame updates from React summaries, a DPR starting at 1.5 and a performance-monitor fallback to 1.25. Pressure colors are skin-weight blended in the body shader. The skeleton uses shared line geometry and instanced joints. These implementation choices do not establish a physical-device performance result.

## Interface and instructional decisions

Keep Switzer for interface copy, Plantin for editorial headings and the existing light/dark tokens in `src/app/globals.css`. The centered viewer is at most 520 px wide, inside the existing shell. Club and shot selection precede camera controls, the mannequin, phase controls, transport and one concise cue. Reference tools open in a bottom sheet on mobile and a 400 px right panel from 768 px upward. This is an extension of the incumbent identity; no alternative visual identity was introduced.

The pressure legend calls the overlay an authored coaching model. Its region values and lead/trail splits are instructional keyframes, not force-plate readings. Handedness mirrors geometry while the interface keeps readable labels. Front, side, top and back views supplement free orbit. A poster remains available while loading and after WebGL/model failure, preserving phase guidance and transport.

## Validation limits

Production export, TypeScript, Biome, 11 unit tests and all 12 Playwright tests passed. The browser suite includes software WebGL, both locales/themes, narrow zoom widths, storage migration, offline model reload and forced poster fallback.

The user's phone was unavailable. Phone frame time, memory use, cold/warm load time and the overlay frame-time increase below 20% remain unverified. Measure those on the target phone with both overlays off, each overlay on and both on, recording device, browser, clip, DPR and baseline conditions. Also record the runtime draw-call total for those states. Browser emulation is useful for layout checks but does not substitute for those measurements.

No actual UI variant prototype comparison had been completed at the time of this record. The asset triage and implemented viewer should not be described as such a comparison.
