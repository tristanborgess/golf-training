# Reference research for greenfield design

Use precedent to enlarge the solution library, not to outsource judgment. A
reference is evidence for a pattern, visual language, or implementation
technique; it is not permission to reproduce a product or graft an unrelated
style onto the brief.

## Start with the constraint sheet

Record the audience, page goal, required content and actions, brand constraints,
technical stack, supported breakpoints and themes, accessibility needs, motion
budget, and any supplied references. Research for those constraints rather than
browsing until something looks exciting.

## Route to the right source

- [Collect UI](https://collectui.com/) — browse for current interface and
  website compositions. Treat it as visual inspiration, not proof that a flow
  converts or is accessible.
- [Recent](https://recent.design/) — use for current web, product, typography,
  motion, editorial, illustration, and branding references. It is especially
  useful when the brief needs a contemporary visual vocabulary beyond product
  screenshots.
- [Mobbin MCP](https://mobbin.com/mcp) — prefer for real shipped product screens
  and complete flows, especially onboarding, paywalls, permissions, checkout,
  and mobile interaction patterns. If the connector is unavailable, use the
  public site, supplied screenshots, or another accessible source; do not stop
  the task or install a connector without authorization.
- [Refero Styles](https://styles.refero.design/) — use its AI-readable design
  systems and DESIGN.md examples to study color roles, typography, spacing,
  surfaces, and component character. Extract a vocabulary; never paste another
  company's system over the user's brand.
- [Beautiful UI](https://www.beautifului.dev/), [beUI](https://beui.dev/),
  [Rare UI](https://www.rareui.com/), and [shadcn/ui](https://ui.shadcn.com/) —
  use as component specimens or open-code foundations when their interaction
  matches the task and the project stack. Check the repository's primitives,
  dependency policy, license, accessibility, and bundle cost before integrating
  code. Adapt one shared primitive instead of accumulating unrelated component
  dialects.
- [Transitions](https://transitions.dev/) — use for focused state-transition
  references such as resize, swap, reveal, loading, error, and success. Choose a
  transition by trigger and state change, not because its demo looks novel.
- [Canvas UI](https://canvasui.dev/) — reserve its canvas and WebGL effects for
  expressive surfaces where the effect carries the concept. Verify browser
  support, graceful HTML fallback, reduced motion, GPU cost, and framework fit.
- [60fps MCP](https://60fps.design/mcp) — when available, search by interaction
  intent and inspect the trigger, opening state, movement, settle, timing, and
  rationale. Use it to replace guessed motion with a studied motion recipe; do
  not connect or configure a paid service without user authorization.

## Synthesize instead of copying

Collect three to six references with distinct jobs. A useful board might take:

- the information architecture or flow pattern from a shipped product;
- the typographic and compositional character from an editorial reference;
- the component behavior from an open-code specimen;
- the motion timing from a dedicated interaction reference.

For each reference, write one sentence each for what works, why it works, and
what must not be copied. Then produce three or four materially different
directions that all satisfy the same constraints. Vary hierarchy, composition,
density, and interaction model—not merely color or radius.

Choose the direction by constraint fit. Combine only compatible ideas and make
the result legible as the user's product. Keep source links in working notes
when attribution, licensing, or later review may matter.
