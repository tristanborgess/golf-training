# Range Notes

A bilingual (English / Spanish) golf reference for beginner-to-intermediate players who know their clubs and want useful guidance between shots at the range. It opens into two actions: **Set up a club** and **Fix a shot**.

Range Notes is a static, offline-capable web app. There are no accounts, no database and no analytics provider. Everything you enter (handedness, selected club, personal carry distances, units, appearance) stays in your browser.

The approved product specification is in [PRODUCT.md](PRODUCT.md). The implementation record is in [docs/implementation-notes.md](docs/implementation-notes.md). The two research reports in `docs/` are reference material, not instructions.

## What it does

- **Fifteen clubs**: driver, 3W, 5W, combined 3H/4H, 4–9 irons, PW/GW/SW/LW, putter. Four shared instructional systems with club-specific adjustments. Wedges also get chip, pitch and bunker variants.
- **Setup guidance** per club: stance, ball position, posture, pressure, grip, tempo, intent and use, plus an editable personal carry and optional qualified reference distances.
- **Seven technical drawings**, rendered as live SVG with translated labels and correct lead/trail orientation for right- and left-handers: stance & ball (top view), face-on, down the line, five-frame swing sequence, face & path, clean contact (low point), and grip.
- **Shot diagnosis** that asks start direction and curve separately, defines the terms, covers nine flights, and never reverses what the player literally saw. Contact, driver, chip, bunker, putt, distance and trajectory faults appear only when they apply to the selected club and shot.
- **One mechanism, one correction, one drill first**; detail, alternatives and direct citations behind disclosures. A methodology page lists every source.
- **Yards or metres** with metres as the stable canonical unit for saved carries. Per-club editing and a complete bag editor.
- **Installable and offline** after a one-time preparation, with a truthful readiness status. Light theme by default for outdoor use; manual dark mode.
- **Accessibility**: keyboard and touch, reduced motion, 200% zoom, WCAG AA contrast, checked with axe in both languages and both themes.

## Quick start

```bash
bun install
```

```bash
bun run dev
```

Open http://localhost:3001. The root page redirects to `/en/` or `/es/` from the browser language.

## Commands

| Command | What it does |
| --- | --- |
| `bun run dev` | Next dev server on port 3001 |
| `bun run build` | Static export to `out/`, then writes the offline precache manifest |
| `bun run start` | Serves `out/` on port 3001 (what the e2e tests target) |
| `bun run lint` | Biome check |
| `bun run typecheck` | TypeScript |
| `bun test src` | Unit tests for the golf model and utilities |
| `bunx playwright test` | End-to-end and accessibility tests against a fresh build |
| `bun run dx` | Dev server plus the i18n watcher from the boilerplate |

The pre-commit hook runs lint-staged (Biome format and check), then the full lint and typecheck. `npm install` is blocked on purpose; this is a Bun repository and `bun.lock` is the source of truth.

## Verifying a change

1. `bun run build` so `out/` reflects the change.
2. `bun run start` in one terminal (or leave it running).
3. `bunx playwright test` in another. The suite covers every club and drawing, handedness, contextual faults, carry persistence across units, language and reload, corrupt storage recovery, offline reload of unvisited pages after preparation, and axe checks.

`next build` clears `.next`, which stops any running `next dev`. Restart the dev server after a build.

## Project layout

```
PRODUCT.md                     approved product spec
docs/                          research reports and implementation notes
src/
  app/page.tsx                 language redirect for /
  app/[locale]/                layout, home page, sources (methodology) page
  app/globals.css              design tokens and all component styles
  components/range-notes.tsx   the tool: setup, diagnosis, bag, settings
  components/golf-diagrams.tsx the seven SVG drawing families
  lib/golf.ts                  clubs, setups, faults, flight logic, preferences schema
  lib/golf.test.ts             unit tests for the model
scripts/
  prepare-offline.mjs          builds out/precache.json after export
  serve-static.ts              Bun static server for out/
public/
  sw.js                        service worker with an explicit same-origin precache
  manifest.webmanifest, icons  installable app metadata
  images/                      approved editorial illustrations
  fonts/                       Switzer and Plantin MT Pro (see FONTS.md)
tests/                         Playwright specs and helpers
locales/                       next-intl messages retained from the boilerplate
```

## Conventions

- Instruction copy lives next to the code as `c("English", "Español")` pairs in `src/lib/golf.ts` and the components, so both languages are always complete.
- Drawings state their viewpoint inside the SVG, attach every label to the feature it names, and use one color code: green for the player's body or reference, orange for the ball or what was observed, blue for the target or club path. Text is never mirrored for left-handers; geometry is.
- Carry distances are stored in metres and converted for display. Never mix carry with total distance.
- A clubface/path mechanism is a hypothesis inferred from a miss, not a definitive cause. Copy should express that uncertainty.
- Distances from the research are references, not targets, and personal carries never enter the event interface.

## Provenance

Built on the [Vibe Code Boilerplate](https://github.com/SwapidoApp/vibe-code-boilerplate) (Next.js App Router, Tailwind v4, next-intl, next-themes, Biome, Bun). Range Notes is a provisional name.
