# Raw 3D source assets

Downloaded from Adobe Mixamo on 13 September 2026. Royalty-free for commercial use under the Mixamo licence (Adobe ID holder: Bon). These are inputs to the pipeline in `scripts/build-model.md`; nothing here ships to the browser. The app loads `public/models/golfer.glb`, which is built from these files.

## Character

- `mannequin-tpose.fbx` (35.8 MB): Mixamo mannequin, T-pose, FBX binary, **with skin**. This is the only file that contains a mesh. Its Mixamo textures are discarded in Blender; the app colours the body from the `--golfer` token.

## Animation clips

All clips: FBX binary, 30 fps, no keyframe reduction, **without skin** (0.5 to 1.2 MB each). Mixamo offers several clips under the same name; the browser numbered the duplicates, so `-1` … `-5` are distinct motions, not copies. The Blender step must open each one, note its duration and what the actor does, and rename the action to something descriptive (for example `drive-full-a`, `putt-short`). Record the final mapping to app clips (`full`, `putt`, `chip`, and the address hold) in `src/lib/swing-data.ts`.

| File | Mixamo name | Notes for triage |
| --- | --- | --- |
| `golf-drive.fbx`, `golf-drive-1.fbx` … `golf-drive-5.fbx` | Golf Drive (6 variants) | Candidates for the `full` clip used by driver, woods and irons. Pick the one with the cleanest tempo and a held finish. |
| `golf-drive-setup.fbx` | Golf Drive Setup | Address / pre-shot motion. Candidate for an idle hold at Address before play starts. |
| `golf-chip.fbx`, `golf-chip-1.fbx` … `golf-chip-4.fbx` | Golf Chip (5 variants) | Candidates for the `chip` clip used by wedge chip, pitch and bunker. |
| `golf-putt.fbx`, `golf-putt-1.fbx` … `golf-putt-3.fbx` | Golf Putt (4 variants) | Candidates for the `putt` clip. |

Unused variants stay in this folder for future shot types; they are not exported into the GLB.

## Conversion record — 13 September 2026

Triage is recorded in `triage.json` (17 FBX inputs) and `poses.json` (11 bone-position samples for each of the 16 animation inputs). The selected actions are `golf-drive-2.fbx` → `full` (3.4 s), `golf-chip-2.fbx` → `chip` (58/30 s), and `golf-putt-3.fbx` → `putt` (2.4 s). Address holds the first frame of each selected clip; the separate setup motion remains unused. Runtime markers live in `src/lib/swing-data.ts`.

`scripts/build-model.py` ran in Blender 5.2.1 and normalizes the mannequin's `mixamorig1:` bone and vertex-group prefixes. Its generated files here are `golfer-raw.glb`, `golfer.blend` and `model-report.json`. The raw export is 1,351,376 bytes and the mannequin has 28,880 triangles. The meshopt-compressed browser asset is 348,144 bytes, with one primitive, one matte material, no textures and three clips. Fifteen phase posters ship under `public/models/poster/`.

Follow [the pipeline instructions](../scripts/build-model.md) to regenerate and compress. Preserve all original FBX inputs. The generated working scene and any Blender backup remain local source assets; only the optimized GLB and posters belong in `public/models/`. The build script does not regenerate the triage inventory or sampled-pose records.
