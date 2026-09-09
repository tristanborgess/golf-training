# Reference research for cinematic interfaces

Research three layers separately: art direction, interaction precedent, and
implementation material. Mixing them too early encourages imitation and makes
the resulting page feel like a component reel.

## Art direction

Use [Recent](https://recent.design/) for current editorial, typography, motion,
3D, illustration, and web references. Use [Collect UI](https://collectui.com/)
for interface compositions and [Refero Styles](https://styles.refero.design/)
for AI-readable breakdowns of palettes, type systems, spacing, surfaces, and
component character.

For each candidate, identify the compositional rule or material idea that makes
it work. Avoid copying branded motifs, proprietary assets, or an entire visual
system. Select an art direction because it supports the audience and story.

## Motion precedent

Use [60fps MCP](https://60fps.design/mcp) when it is already available and the
page needs motion beyond ordinary entrances. Search by intent, then inspect the
trigger, starting state, movement beats, settle, timing, filters, mood, and
rationale. If the connector is unavailable, use accessible site references or
supplied videos; do not install or configure a paid service without authority.

Use [Transitions](https://transitions.dev/) for smaller state changes such as
card resize, text or icon swap, menus, modals, loading-to-content, validation,
and success. Recreate the state logic and timing in the project's existing
motion stack rather than accumulating libraries.

## Component and effect material

- [Canvas UI](https://canvasui.dev/) provides open-code canvas and WebGL effects.
  Use one only when it carries the page concept. Confirm browser support,
  graceful HTML fallback, reduced motion, GPU cost, cleanup, and mobile input.
- [beUI](https://beui.dev/) and [Rare UI](https://www.rareui.com/) provide
  animated React component specimens. [Beautiful UI](https://www.beautifului.dev/)
  is useful for agent-oriented and data-rich primitives. Treat them as source
  material, not a second design system.
- [shadcn/ui](https://ui.shadcn.com/) is an open-code foundation to customize,
  not a finished art direction. Prefer the project's installed primitives when
  they already cover the behavior.

Before importing code, verify framework compatibility, license, dependencies,
accessibility, performance, and ownership cost. Installation or a new runtime
dependency requires the authority implied by the user's request and repository
rules.

## Build the motion brief

For each signature sequence, record:

1. the user or scroll trigger;
2. the readable opening state;
3. the property changes, direction, duration, easing, and stagger;
4. the settle state and what it communicates;
5. the reduced-motion equivalent;
6. the performance and responsive risks.

Compare at least two motion treatments when timing materially changes the
character. Choose one coherent material language—elastic, cinematic inertia,
mechanical precision, paper-like reveal, fluid distortion, or another named
behavior—and reuse it sparingly.
