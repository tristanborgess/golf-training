---
name: design-system-capture
description: Extract, create, or update a repository DESIGN.md from an existing interface, Figma file, screenshot set, or token source. Use when the user asks to document visual identity, capture design tokens and component rules, lint or reconcile a DESIGN.md, or make a design system portable; do not trigger for ordinary page implementation or generic visual polish.
---

# Capture a design system

Produce a durable `DESIGN.md` that tells design and coding agents what the
product should look and feel like without replacing the implementation's actual
tokens or component library.

## Establish authority

Inspect the strongest available sources in this order:

1. the user's explicit brief and approved references;
2. existing semantic tokens, theme files, type assets, and primitives;
3. representative rendered screens in every supported theme and breakpoint;
4. Figma variables, styles, components, and approved source frames;
5. historical or external references, used only to explain intent.

When sources disagree, record the discrepancy. Do not silently make a mockup,
an old screenshot, or a public brand reference more authoritative than shipped
product truth.

Read [references/design-md-schema.md](references/design-md-schema.md) before
authoring or substantially restructuring the file. Read
[references/reference-use.md](references/reference-use.md) only when external
DESIGN.md examples would materially improve the result.

## Working rules

- Tokens are normative values; prose explains why and how to apply them.
- Use semantic roles such as background, foreground, card, border, primary,
  success, warning, and destructive. Preserve raw palette values only when they
  help implement or audit those roles.
- Document light and dark intent together. Do not create per-screen theme hacks.
- Describe component behavior and states, not only static appearance.
- Separate product UI rules from marketing or campaign exceptions.
- Record responsive transformations and content-density expectations.
- Include explicit do/don't guardrails derived from observed failures or brand
  constraints, not generic taste slogans.
- Never copy another company's complete system into the project or imply brand
  affiliation. External systems are precedent, not identity.

## Update behavior

If `DESIGN.md` already exists, read it fully and preserve supported structure,
decisions, and annotations. Change only what the evidence or user request
requires. Flag stale or conflicting guidance rather than rewriting the whole
file for stylistic consistency.

If the user asked only for an audit or proposed schema, report findings without
writing. Creating or replacing `DESIGN.md` requires an explicit request for the
artifact or an implementation request that clearly includes it.

## Verification

Compare the finished file against representative components and screens. Check
that every named token exists or is clearly proposed, color pairs meet the
project's contrast target, responsive rules cover the supported widths, and
component states map to real primitives. Do not claim automated validation or
visual fidelity unless it was actually run.
