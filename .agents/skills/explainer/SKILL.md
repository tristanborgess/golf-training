---
name: explainer
description: Create a visual HTML explainer / game-plan page and publish it to aureo-atlas.vercel.app. Use when asked to make an explainer, game plan, visual walkthrough, rollout plan, or shareable one-page doc for feature work — or to update an existing one.
---

Publish a self-contained `index.html` exhibit to the **aureo-atlas** repo.
Pushing `main` there IS the production deploy (Vercel git integration) — the
whole flow is one pass: write → commit → push → report URL. Do not pause for
preview or confirmation.

## Steps

1. **Sync the atlas repo** (separate repo, NOT this one):
   - If `~/Developer/aureo-atlas` is missing:
     `git clone git@github.com:SwapidoApp/aureo-atlas.git ~/Developer/aureo-atlas`
   - Else: `git -C ~/Developer/aureo-atlas pull --ff-only`
2. **Pick a slug**: kebab-case, prefixed with the Linear ticket when there is
   one (e.g. `pdev-992-limits-raise`). The exhibit lives at
   `~/Developer/aureo-atlas/<slug>/index.html` and serves at `/<slug>/`.
   If the folder already exists for the same topic, update it in place —
   pushing redeploys it.
3. **Author the page**. Design is entirely at your discretion — no template,
   no house style. Pick whatever layout, palette, typography, and visual
   language best serves THIS content; two exhibits never need to look alike.
   Only three hard requirements:
   - Fully self-contained: one `index.html`, inline CSS/JS, no CDNs, no
     external assets (there is no build step).
   - Real `<title>` — it becomes the entry title on the atlas directory page.
   - Include `<meta name="robots" content="noindex" />`.

   This is a VISUAL explainer, not prose: prefer diagrams, timelines,
   boxes-and-arrows (inline SVG or flex/grid), tables, and stat callouts
   over walls of text.

   Read [references/visual-communication.md](references/visual-communication.md)
   before choosing the visual structure. Use the smallest diagram that makes
   the relationship easier to understand, keep labels and arrows meaningful,
   and preserve a responsive reading order. If the user asks for a slide deck
   rather than a one-page explainer, route to the presentation workflow instead
   of forcing a fixed slide stage into this skill.

4. **Ship immediately** (commit in the atlas repo — never in swapido-app):
   ```sh
   git -C ~/Developer/aureo-atlas add <slug> \
     && git -C ~/Developer/aureo-atlas commit -m "Add <slug> exhibit" \
     && git -C ~/Developer/aureo-atlas push
   ```
5. **Return the URL immediately**. As soon as the push succeeds, the URL is
   known — do not poll or wait for the deploy. Report
   `https://aureo-atlas.vercel.app/<slug>/` as the final deliverable, ending
   your reply with the URL on its own line so it's copy/paste-able. Note that
   the deploy takes ~30–60s to go live (for a new slug, a 404 in the meantime
   is expected). Only if the push itself fails is there a problem to raise.

## Guardrails

- Never edit the atlas root `index.html` — it is generated at build time.
- Never commit atlas files into the swapido-app working tree or vice versa.
- The site is public by URL. If the content includes secrets, tokens,
  customer PII, or anything clearly not for public eyes, STOP and ask before
  pushing. Internal plans/architecture are fine — that's what this is for.
