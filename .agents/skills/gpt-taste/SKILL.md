---
name: gpt-taste
description: Design and implement intentionally cinematic, art-directed marketing or portfolio interfaces with advanced GSAP scroll motion. Use when the user explicitly wants Awwwards-style, motion-led, cinematic, experimental, or GSAP-heavy work; do not use for ordinary product UI or restrained redesigns.
---

# Cinematic frontend direction

Create a distinctive, production-ready interface whose composition, imagery,
type, and motion support one coherent story. This skill is for intentionally
expressive work. Do not inject cinematic motion into a task that asks for a
quiet, conventional, accessibility-first, or application-like experience.

Project instructions and the existing design system take precedence. Reuse
installed primitives, semantic tokens, fonts, and icon families. Never replace
the stack, add a dependency, or bypass a component library merely to match a
preferred aesthetic.

## Start with an art direction

Before editing code, state a short design read covering:

- audience and page goal;
- visual language and typography character;
- hero composition and section rhythm;
- the two or three motion ideas that carry the story;
- the real or generated assets required.

Choose from the brief rather than randomizing. Variation should come from the
content and brand, not a mock RNG ritual. Reuse no section layout merely to
fill space, and avoid stacking unrelated visual tricks.

Write the non-negotiable constraints before selecting the art direction. When
the brief is visually open, compare three or four genuinely different
storyboards or hero systems in a design surface before implementation. Do not
let the first code prototype become the direction merely because it is already
built.

Read [references/reference-research.md](references/reference-research.md) when
the work needs external visual, component, or motion references. The research
pass should explain why a reference works and which constraint it satisfies;
it should not produce a collage of borrowed effects.

## Compose the page as chapters

Use a clear conversion narrative, such as attention, interest, desire, and
action, without forcing those labels or a fixed number of sections into the
markup.

- Keep navigation legible, compact, and on one line at desktop sizes.
- Give the hero one dominant idea. Aim for a two-line desktop headline when
  the copy permits, keep the primary action visible, and use a wide enough
  text measure to avoid a tall wall of display type.
- Favor a small number of deliberate compositions: asymmetric splits,
  editorial media, dense bento groupings, horizontal accordions, or
  typographic image treatments.
- For bento layouts, make the number of cells match the content and verify that
  spans leave no accidental holes. Use dense grid flow only when it preserves
  reading order.
- Separate major ideas with enough space to feel intentional, then tune mobile
  spacing independently instead of copying desktop values.
- Make the CTA and footer conclude the story rather than adding a generic link
  farm.

Avoid decorative metadata that carries no meaning: section numbers, fake
version labels, repeated eyebrows, stock status dots, scroll instructions, and
pretend technical readouts. Write specific copy and use real data only when it
is sourced or clearly labeled as sample content.

## Motion direction

Motion must communicate hierarchy, narrative sequence, interaction feedback,
or a state transition. If its only justification is visual spectacle, remove
it.

- Use GSAP with ScrollTrigger for pinning, scrubbing, stacking, and horizontal
  scroll narratives. Prefer CSS or the project's existing motion library for
  ordinary hover and entrance effects.
- Isolate imperative animation in client-side leaf components. Scope GSAP with
  `gsap.context()` and revert it during cleanup.
- Animate `transform` and `opacity`; avoid layout properties on scroll.
- Recalculate measurements on refresh and responsive changes when dimensions
  drive the animation.
- Honor `prefers-reduced-motion`. Pinned or scrubbed stories need a readable,
  static fallback with the same content order.
- Keep keyboard focus, touch interaction, and normal document scrolling usable.
- Do not add smooth-scroll interception unless the brief calls for it and the
  accessibility and input consequences are handled.

For implementation patterns and failure modes, read
[references/gsap-motion.md](references/gsap-motion.md).

Before delivery, run a subtraction pass across the motion system. Remove
secondary reveals, hover effects, and decorative layers that compete with the
one or two signature sequences. A cinematic page feels authored when its
effects share timing, material, and narrative logic—not when everything moves.

## Visual assets and interaction

Use supplied brand assets first. When the page needs original imagery and an
image-generation tool is available, generate assets for the actual crop and
role. Otherwise use reliable, licensed sources or explicit placeholders. Do
not fabricate product screenshots with decorative rectangles.

Interactive media may scale or reveal on hover, but hover must not be the only
way to access information. Ensure button text, focus states, captions, and text
over photography meet contrast requirements.

## Verification

Before delivery:

1. Inspect the rendered page at representative desktop and mobile widths.
2. Test the full scroll sequence in both directions and after resize.
3. Test reduced motion and keyboard navigation.
4. Confirm no horizontal overflow, clipped pinned content, or obscured focus.
5. Check that every import exists and that the relevant lint, type, and test
   commands pass.
6. Remove animation or decoration that does not strengthen the page's story.
