# DESIGN.md schema

Use YAML frontmatter for compact machine-readable tokens when the project or
chosen tooling supports it. Keep the Markdown body as the human-readable source
of rationale and application rules. Do not duplicate the same table in both
forms unless the consumer requires it.

## Recommended sections

1. **Identity and atmosphere** — audience, trust register, density, visual
   character, and the decisions the system should make easy.
2. **Color roles** — raw palette where useful, semantic light/dark mappings,
   contrast expectations, and accent distribution.
3. **Typography** — families, roles, sizes, weights, line heights, tracking,
   numeric behavior, and language coverage.
4. **Spacing and geometry** — base unit, spacing scale, container widths,
   grids, radii, border weights, and icon sizes.
5. **Surfaces and elevation** — background layers, card hierarchy, overlays,
   shadows, dividers, and material rules.
6. **Components and states** — buttons, fields, navigation, cards, tables,
   charts, dialogs, loading, empty, error, disabled, hover, active, and focus.
7. **Layout and responsive behavior** — breakpoints, collapse rules, source
   order, safe areas, overflow, and content-density changes.
8. **Motion and feedback** — durations, easing, state transitions,
   reduced-motion behavior, and performance limits.
9. **Voice and content** — language convention, terminology, numeric formats,
   CTA style, error tone, and claims discipline.
10. **Do / don't** — concise guardrails tied to the product and its known
    failure modes.

## Token guidance

Prefer semantic names over component-specific values. A component consumes
`border` or `primary`; it should not define `dashboard-card-gray`. If a value is
truly local, document it as a component exception with a reason.

For multi-theme systems, keep role names stable and change only their resolved
values. Record any role whose meaning changes by theme as a design defect to
resolve rather than normal behavior.

## Evidence annotations

For uncertain or proposed entries, label the source and status:

- **observed** — verified in code, variables, or rendered product;
- **approved** — explicitly chosen by the user or design owner;
- **proposed** — recommended but not yet implemented;
- **legacy** — present in old surfaces and not authoritative for new work.

This prevents a descriptive audit from accidentally becoming a normative
redesign.
