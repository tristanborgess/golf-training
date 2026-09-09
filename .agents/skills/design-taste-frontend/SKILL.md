---
name: design-taste-frontend
description: Shape and implement distinctive greenfield landing pages, portfolios, campaign pages, and editorial marketing surfaces by inferring an appropriate visual direction and avoiding templated frontend patterns. Do not use for dashboards, dense product UI, multi-step workflows, or focused redesigns of existing projects.
---

# Taste-led frontend design

Build a coherent marketing or portfolio surface from the brief instead of
defaulting to a familiar template. This skill governs visual direction,
composition, copy density, assets, interaction, and final visual QA. It does
not replace repository instructions, an established brand system, or the
user's technology choices.

For an existing interface that should be improved in place, use the focused
redesign workflow instead. For an explicitly cinematic GSAP experience, use a
motion-led workflow rather than applying heavy scroll effects by default.

## Declare the design read

Before code, write one concise line that identifies:

- page kind and audience;
- desired mood and trust level;
- the visual foundation: existing design system or an honestly named aesthetic;
- intended layout variance, motion intensity, and content density on a 1-10
  scale.

Infer these values from the brief, references, brand assets, and audience. Ask
one clarifying question only when plausible directions would lead to materially
different results.

Before committing to a composition, write down the constraints that the design
must satisfy: content, audience, brand, technology, accessibility, responsive
behavior, business goal, and any immovable interaction requirements. When new
feedback arrives, decide whether it changes a constraint before patching the
current layout. This prevents a succession of locally reasonable fixes from
turning the page into a disjointed whole.

Read [references/design-direction.md](references/design-direction.md) when the
brief is ambiguous, a new visual foundation must be chosen, or the page needs
a deliberate composition strategy.

Read [references/structure-and-originality.md](references/structure-and-originality.md)
when several pages are converging on the same hero, card grid, or section
rhythm; when the user wants something distinctive; or when a reference should
inform the composition without becoming a pixel clone. Choose the
macrostructure before applying a theme. If the project has a `DESIGN.md`, its
shared system overrides the desire to diversify every page.

For open-ended visual work, unfamiliar categories, or a page at risk of looking
generic, read [references/reference-research.md](references/reference-research.md)
before choosing the direction. Use it to gather precedents, extract principles,
and compare three or four materially different compositions in a design surface
or isolated showcase before production code creates prototype gravity.

## Work with the actual stack

- Inspect the project before choosing components, fonts, icons, or animation
  libraries.
- Reuse the existing design system and semantic tokens. Do not introduce a
  second system or recreate an official system by imitation.
- Verify dependencies before importing them. Installation or framework changes
  require the authority implied by the user's request and local project rules.
- Keep interactive animation in small client-side boundaries when the framework
  supports server rendering.
- Prefer the project's package manager, component primitives, icon family, and
  formatting conventions over this skill's examples.

## Design the page from content

Give every section one job and vary layout only when the content calls for it.

- Keep the hero focused on one value proposition and one primary action. Avoid
  filling it with trust strips, feature bullets, version labels, or fake status
  metadata.
- Use real hierarchy: display type for the primary idea, readable body measure,
  and restrained supporting labels.
- Match grid cells to the number and relative importance of content items.
- Avoid repeating one layout family across consecutive sections. Vary the
  composition without disrupting reading order.
- Keep long lists, specifications, and comparisons scannable by grouping or
  progressive disclosure instead of decorative row dividers.
- Make mobile collapse explicit for every asymmetric or multi-column section.

Do not ban a visual convention merely because it is common. Use it when it is
the best fit, customize it to the brand, and remove it when it is filler.

After the first coherent pass, perform a subtraction review. For every label,
line, icon, badge, surface, and paragraph, ask what user decision or narrative
beat it supports. Remove or merge elements that only decorate the existence of
content. Agents tend to add their way out of uncertainty; taste often comes
from resolving the uncertainty and deleting the residue.

For detailed craft guidance, read
[references/visual-craft.md](references/visual-craft.md).

## Use assets as content

Use supplied logos, photography, illustration, and screenshots first. When
original imagery would materially improve the page and generation tooling is
available, create assets for their actual aspect ratios and placements. Use
licensed real imagery or clearly marked placeholders otherwise.

Do not build fake screenshots from ornamental rectangles. If a product preview
is needed, use a real screenshot, a generated mockup clearly presented as such,
or a functioning miniature of the real component.

## Add motion deliberately

Animation should explain hierarchy, sequence, feedback, or state change.
Choose CSS or the existing motion library for simple interaction and reserve
GSAP for genuine pinning or scrubbed scroll narratives. Motion must preserve
reading order, keyboard use, touch behavior, and a complete reduced-motion
experience.

Read [references/motion-and-performance.md](references/motion-and-performance.md)
when motion intensity exceeds 3 or the page includes large media.

## Finish with rendered QA

Use [references/preflight.md](references/preflight.md) before delivery. Inspect
the page in a browser at representative desktop and mobile widths, in all
supported themes and relevant UI states. Fix what is visible; do not rely on a
source-only checklist as proof of design quality.

When a preview deployment or realistic fixture data is available, use it for
the final evaluation. Static mock data can hide density, wrapping, empty-state,
and hierarchy problems that appear immediately with real content.
