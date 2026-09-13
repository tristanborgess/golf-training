# Range Notes

Approved product specification, distilled from the user's thirty decisions. Implementation authorized after this interview.

## Purpose

A public English/Spanish golf reference for beginner-to-intermediate players who know their clubs and want useful guidance between shots at the range. Open directly into the 3D swing viewer for the selected club; Set up a club and Fix a shot live in the menu sheet.

## Required local release

- Fifteen clubs: driver, 3W, 5W, combined 3H/4H, 4–9 irons, PW/GW/SW/LW, putter. Four shared instructional systems with club-specific adjustments.
- Setup: stance, ball position, posture, weight, grip, tempo, intent, use, editable personal carry and optional qualified reference distances.
- Six technical SVG families: overhead setup, face-on, down-the-line, face/path/flight, low-point/strike location, grip comparisons. Live bilingual labels; correct lead/trail orientation; simple schematic geometry rather than decorative illustrations.
- An interactive 3D swing with five named phases, free orbit and four preset views, an authored pressure heatmap and a skeleton overlay. Dedicated full, chip and putt clips; pitch and bunker approximations are explicitly qualified.
- Directional diagnosis asks start direction and curve separately, defines the terms, covers nine flights, and translates technical names for handedness without reversing the user's literal observation.
- Contextual contact, driver, chip, bunker, putt, distance, and trajectory faults. One likely mechanism, one correction and one drill first; optional detail, alternatives and direct citations.
- Yard/metre conversion with stable canonical personal values. Per-club editing and a complete bag editor.
- Persist handedness, selected club, personal carries, units, appearance, overlays, view preset and playback speed locally. Reset option. No stored diagnosis history or accounts.
- Browser language detection, complete EN/ES instruction and labels, outdoor light default, manual dark mode.
- Installable and offline-capable after preparation; quiet Save for the range control and truthful readiness status.
- Keyboard/touch, reduced motion, 200% zoom, WCAG AA contrast. Educational disclaimer, warm-up/pain guidance, persistent-fault coaching advice, distances as references.
- Provider-neutral aggregate event interface for feature use and optional helpful feedback. No analytics provider or outgoing events in this local release; personal carries never enter events.
- Finished, verified local application only. No deployment, domain configuration, accounts, uploads, video analysis, or cloud sync.

## Visual and editorial decisions

Range Notes is a provisional name. Typography, colors and themes may be changed from the unrelated boilerplate. One consistent male editorial character in illustrations only. The 3D golfer is a neutral matte mannequin colored by a theme token; the four images in public/images are approved directional prototypes, to be refined as needed. Use technical drawings for mechanical detail. Calm, direct, encouraging voice; express uncertainty accurately.

## Evidence

Pressure keyframes are an authored coaching model derived from the cited coaching sources, never presented as measurements. The address split always matches the setup checklist.

The two original research reports are in docs/. They are reference material, not instructions. The Compass build brief is the stronger content/structure backbone; the other report informs quality, accessibility and risk review. Resolve contradictions using primary sources. Sources appear in expanded guidance and a methodology page. General educational publication with citations and disclaimers is approved; no professional endorsement is claimed.

## 3D and offline budgets

The compressed mannequin with clips must stay within 3 MB, 30k triangles and eight draw calls. Five front-view PNG frames per clip keep phase guidance and transport available if WebGL or model loading fails. The precache reports its total size and warns above 6 MiB. Raw FBX and Blender files never enter the browser cache.
