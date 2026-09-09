---
name: redesign-existing-projects
description: Audit and upgrade an existing website or application interface while preserving its behavior, brand, information architecture, and technology choices. Use for focused visual redesigns and UX polish in an established codebase; do not use for greenfield pages or authorized full rewrites.
---

# Redesign an existing project

Improve what is already there. The current interface, codebase, and user flows
are evidence, not disposable scaffolding. Work within project instructions and
the existing design system; do not migrate frameworks, replace styling tools,
or introduce a competing component library.

## Determine the requested mode

- **Audit:** inspect and report findings. Do not modify files unless the user
  also asks for implementation.
- **Focused upgrade:** diagnose, implement the highest-value improvements, and
  verify them.
- **Overhaul:** only treat the visuals as greenfield when the user explicitly
  authorizes a broad redesign. Preserve content, behavior, routes, analytics,
  and accessibility unless separately authorized.

If the scope is ambiguous but the code and request indicate a reasonable
focused upgrade, proceed with that narrower interpretation.

## Establish the baseline

Inspect the relevant source and, when possible, the rendered interface before
editing. Record only findings that affect the task:

- framework, styling method, theme tokens, primitives, fonts, icon family;
- page hierarchy, navigation, conversion path, and responsive behavior;
- brand assets and recognizable patterns worth preserving;
- loading, empty, error, disabled, hover, active, and focus states;
- performance or accessibility issues visible in the current implementation;
- route names, DOM identifiers, analytics hooks, form field names, and other
  integration surfaces that must remain stable.

Use screenshots or browser inspection when visual comparison matters. Do not
infer a defect from source code alone if the rendered result can be checked.

Capture the constraints that explain the current design: supported workflows,
business rules, content density, brand rules, technology, responsive behavior,
and integration surfaces. When feedback arrives, first decide whether it
reveals a missing or changed constraint. Avoid fixing each complaint locally
until the screen becomes a patchwork of unrelated prominence and affordances.

Read [references/reference-research.md](references/reference-research.md) when
the redesign would benefit from shipped product precedents, current visual
references, or reusable interaction examples. External references broaden the
solution set; the existing product remains the source of truth.

## Diagnose before changing

Prioritize concrete problems over taste declarations.

For a consequential product surface, data-heavy dashboard, mobile flow, or
full audit, read
[references/product-ui-evaluation.md](references/product-ui-evaluation.md).
It provides an impact-ordered review sequence so visual polish does not outrank
accessibility, operability, performance, or the state the user is actually in.

### Hierarchy and typography

- unclear primary action or weak heading hierarchy;
- unreadable line length, cramped line height, clipped display text, or
  inconsistent type scale;
- missing tabular numerals in data-heavy areas;
- repeated all-caps micro-labels or decorative metadata that adds noise.

Do not swap a brand or project font merely because another font is fashionable.
First improve weight, size, measure, tracking, and hierarchy with the existing
family.

### Color and surfaces

- insufficient contrast, disconnected accent colors, or inconsistent neutral
  temperature;
- surfaces whose borders, shadows, and radii do not communicate hierarchy;
- light and dark themes that do not share semantic intent;
- visual texture that competes with content or degrades performance.

Use semantic tokens. Extend the shared token or primitive once when the system
needs a reusable variant; do not paste one-off literal colors into screens.

### Layout and responsive behavior

- missing container constraints, broken reading order, or accidental overflow;
- repetitive equal-card grids where the content has unequal importance;
- inconsistent alignment between comparable controls or cards;
- desktop composition that collapses poorly on small screens;
- `100vh` mobile jumps where a dynamic viewport unit is appropriate.

Preserve information architecture unless changing it is in scope. Visual
recomposition does not authorize route, navigation-label, or content changes.

### Interaction and states

- weak or absent hover, active, focus-visible, disabled, loading, empty, and
  error states;
- motion that animates layout properties or ignores reduced motion;
- dead controls, placeholder links, or modal use where inline interaction is
  already established;
- form errors that are unclear, inaccessible, or disconnected from fields.

### Content and trust

- placeholder names, lorem ipsum, fabricated metrics, generic AI copy, or
  inconsistent voice;
- missing alt text, page metadata, legal links, back navigation, or skip links
  when those belong to the surface;
- stock imagery or duplicated avatars that undermine the product's context.

Do not rewrite working copy, legal text, consent language, or analytics labels
without authorization. Flag them separately when they need attention.

## Implement focused improvements

Apply the smallest coherent set of changes that solves the diagnosed problems.
A useful default order is:

1. accessibility and broken-state fixes;
2. hierarchy, type scale, and spacing;
3. semantic color and surface cleanup;
4. responsive layout and alignment;
5. interaction feedback and motivated motion;
6. reusable primitive or token extensions;
7. content polish that is explicitly in scope.

Reuse existing primitives and variants. Verify every import and dependency.
When a new library would materially expand scope, stop and obtain approval
instead of installing it as part of visual polish.

For a broad visual change or a problem with several plausible solutions,
explore three or four materially different variants in Figma, an isolated
showcase, or another design surface before wiring one into production. Keep
views separate from business logic so variants can be compared without
duplicating behavior. This counters prototype gravity and makes subtraction
cheaper.

After the coherent pass, inspect every added label, icon, divider, badge,
surface, and explanatory sentence. Remove anything that does not support a
task, state, hierarchy decision, or trust requirement. Prefer one stronger
signal over several compensating signals.

## Verification

- Compare the result against the baseline at representative desktop and mobile
  widths.
- Exercise the main user flow and all states touched by the redesign.
- Test keyboard navigation, focus visibility, contrast, and reduced motion.
- Check both supported themes when the project is dual-themed.
- Run targeted tests plus the repository's formatting, lint, and type checks in
  proportion to the change.
- Review the diff for unrelated rewrites, changed integration hooks, and
  duplicated design-system styles.
- When feasible, evaluate a preview with realistic data; density, truncation,
  empty states, and hierarchy are easier to judge in the real flow than in an
  idealized mockup.

Report what improved, what was intentionally preserved, and any issue that was
found but left out of scope.
