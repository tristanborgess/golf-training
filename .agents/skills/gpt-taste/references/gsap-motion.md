# GSAP motion patterns

Read this reference when the chosen art direction includes GSAP pinning,
scrubbing, stacking, or horizontal scroll.

## Integration contract

- Verify `gsap` and any framework integration already exist before importing
  them. Follow the repository's package-manager rule if installation is
  authorized.
- Register ScrollTrigger once in a client-safe location.
- Put DOM refs and imperative animation in a small client component. Keep
  static section content outside that boundary when the framework supports it.
- Build timelines inside `gsap.context(..., rootRef)` and return
  `context.revert()` from the effect.
- Prefer selectors scoped to the root ref or explicit refs. Do not animate a
  global class shared by unrelated sections.
- Use `invalidateOnRefresh: true` when end positions depend on dimensions.
- If fonts or images change geometry after load, refresh ScrollTrigger after
  those assets settle.

## Pinned split narrative

Use when a stable title or media frame gives context to several scrolling
items.

- Pin only the contextual column, not the entire page.
- Set the end from the scrolling column's real height.
- On narrow screens, disable pinning and restore normal source order.
- Keep headings and controls outside elements that become visually obscured.

## Sticky card stack

Use when each card advances one stage of a story.

- Trigger at `top top` when the card is intended to meet the viewport edge.
- Pin all but the final card and use `pinSpacing` deliberately.
- Drive the previous card's scale or opacity from the next card's arrival.
- Preserve enough contrast that stacked cards remain distinguishable.
- The reduced-motion version is a normal vertical list.

## Horizontal scroll narrative

Use only when horizontal progression matches the content, such as a visual
timeline or gallery. Do not use it for ordinary feature cards.

- Pin the wrapper and translate an inner track.
- Compute travel as `track.scrollWidth - wrapper.clientWidth`.
- Set the scroll end from that travel distance and invalidate on refresh.
- Do not trap wheel, touch, or keyboard input with custom listeners.
- At mobile widths or reduced motion, render a vertical or native horizontal
  scroll-snap layout.

## Scrubbed text and media

- Split text only when the reveal order adds meaning. Preserve accessible text
  as a coherent sentence instead of exposing each word as noisy semantics.
- Keep scrub ranges long enough to avoid flashes.
- For media scale and fade, cap transforms so images remain sharp and never
  hide essential information.
- Avoid combining pinning, parallax, word reveals, and continuous marquees in
  one viewport. Pick the dominant motion idea.

## Common failures

- Trigger starts before the section reaches its intended pinned position.
- Pinned content overlaps the next section because the end trigger is guessed.
- Measurements become stale after a font, image, or breakpoint change.
- Strict Mode creates duplicate triggers because cleanup is missing.
- `overflow: hidden` clips focus rings or sticky descendants.
- A transform on an ancestor changes the containing block for fixed or sticky
  elements.
- Reduced motion disables animation but leaves content hidden in its initial
  state.

Inspect ScrollTrigger markers during development when timing is uncertain, and
remove them before delivery.
