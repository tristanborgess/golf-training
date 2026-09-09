# Motion, accessibility, and performance

Read this when the page includes animation beyond basic hover feedback or uses
large visual assets.

## Choose the lightest suitable mechanism

- CSS transitions and keyframes: hover, active, and simple entrance effects.
- The project's declarative motion library: state transitions, shared layout,
  staggered reveals, and pointer physics.
- GSAP with ScrollTrigger: pinning, scrubbed timelines, card stacks, and
  horizontal scroll narratives.
- WebGL: only when the brief requires a true canvas or 3D experience and the
  budget supports its complexity.

Do not make multiple animation systems control the same element. Keep
imperative animation scoped to isolated client components with complete
cleanup.

## Runtime rules

- Animate transforms and opacity. Avoid scroll-driven width, height, top, or
  left changes.
- Never store continuous pointer or scroll values in React state. Use motion
  values, ScrollTrigger, IntersectionObserver, or CSS scroll timelines.
- Avoid global unthrottled scroll listeners and perpetual requestAnimationFrame
  loops that update component state.
- Use `will-change` only during or immediately around actual animation.
- Limit perpetual animation. Static information does not need to shimmer,
  float, pulse, and marquee simultaneously.

## Accessibility

- Honor `prefers-reduced-motion` for motion beyond basic state feedback.
- The reduced version must expose all content, not freeze elements at opacity
  zero or inside a pinned state.
- Preserve normal keyboard focus order and avoid scroll traps.
- Do not require fine pointer movement to reveal essential controls.
- Keep focus rings visible above transformed and clipped layers.

## Performance

- Reserve dimensions for media and prioritize the actual above-the-fold image.
- Lazy-load large below-the-fold media and optional animation bundles.
- Avoid blur, filters, and noise on large moving surfaces.
- Test after fonts and images load, because their geometry can change motion
  measurements and layout stability.
- Use the repository's performance tooling when available. Treat 2.5 seconds
  LCP, 200 milliseconds INP, and 0.1 CLS as useful targets rather than claims
  made without measurement.

Every animation should have a one-sentence purpose: hierarchy, storytelling,
feedback, or state transition. Remove animations that cannot meet that test.
