# Reference research for an existing product

Use references to answer a concrete redesign question. Do not begin with a
style hunt, and do not let precedent override the product's behavior, brand,
design system, accessibility requirements, or user-provided constraints.

## Choose evidence by question

- For a complete product flow or difficult UX decision, prefer shipped-screen
  evidence from [Mobbin MCP](https://mobbin.com/mcp). Search by task and state,
  such as KYC introduction, checkout recovery, permission request, bottom
  sheet, or empty transaction history. Compare several products and extract the
  recurring logic as well as meaningful differences.
- For current visual composition, use [Collect UI](https://collectui.com/) and
  [Recent](https://recent.design/). Treat them as visual references, not proof
  of usability or conversion.
- For a candidate design-system vocabulary, use [Refero Styles](https://styles.refero.design/)
  to study semantic color roles, typography, spacing, surfaces, and component
  character. Translate compatible principles into the existing tokens; never
  replace the product's brand with a borrowed DESIGN.md.
- For a specific interaction or state transition, use
  [Transitions](https://transitions.dev/) or, when already available,
  [60fps MCP](https://60fps.design/mcp). Inspect trigger, start, movement,
  settle, timing, and reduced-motion behavior. Do not add motion where static
  feedback is clearer.
- For a missing component behavior, inspect open-code examples from
  [Beautiful UI](https://www.beautifului.dev/), [beUI](https://beui.dev/),
  [Rare UI](https://www.rareui.com/), [Canvas UI](https://canvasui.dev/), or
  [shadcn/ui](https://ui.shadcn.com/). Prefer extending the project's existing
  primitive. Import code only after checking the stack, license, dependencies,
  accessibility, performance, and long-term ownership.

Connectors and paid services are optional evidence sources. If one is not
available, continue with accessible public material, supplied references, or
the existing product. Do not install, connect, authenticate, or add credentials
without the user's authorization.

## Produce a precedent matrix

For each reference, record:

- the product, surface, and state;
- the user problem it solves;
- the hierarchy and interaction pattern;
- the reason it appears to work;
- what conflicts with the current product;
- the narrow principle worth testing.

Use at least three distinct precedents for a consequential flow when the
sources are available. Do not copy one product end to end. Synthesize the
recurring pattern, then express it with the current information architecture,
copy voice, tokens, components, and data.

## Explore without patchwork

Update the constraint list from the audit and feedback. When a concern changes
a global constraint—such as navigation density, hierarchy, or mobile reach—fix
the system or shared primitive rather than adding a local exception. When it is
truly local, keep the change local.

For broad changes, compare three or four variants outside the production flow.
Vary hierarchy, density, layout, and interaction model, not only styling. Select
the variant that satisfies the constraint set with the least added complexity.
Then run a subtraction pass before implementation.
