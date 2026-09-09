# Product UI evaluation

Review the rendered state in impact order. A later category must not compensate
for a failure in an earlier one.

## 1. Accessibility and input

- Verify contrast in every supported theme, visible keyboard focus, sensible
  DOM order, accessible names for icon-only controls, and non-color status
  signals.
- Use at least a 44 by 44 pixel touch target where the platform and density
  allow it; preserve enough separation to avoid accidental activation.
- Do not hide essential interaction behind hover. Keyboard and touch users need
  an equivalent path.

## 2. State, hierarchy, and operability

- Identify the user's current state and the one action that advances it. A
  dashboard for an unverified account should not let a market chart outrank
  verification merely because the chart is visually interesting.
- Standard controls must look operable. Restraint is not permission for
  link-like tabs, invisible buttons, or ambiguous rows.
- Loading, empty, error, disabled, pending, success, and permission states need
  a coherent place in the hierarchy.

## 3. Performance and stability

- Reserve media and chart space, avoid layout thrashing, and keep continuous
  input or animation off React state.
- Prefer transforms and opacity for motion, lazy-load secondary assets, and
  verify that fonts and realistic data do not shift the interface.

## 4. Responsive layout and navigation

- Test the actual narrowest and widest supported widths. Check long names,
  large numbers, translated labels, safe areas, and keyboard overlays.
- Preserve predictable back behavior and deep links. A collapsed navigation
  model must keep the current location and primary task understandable.

## 5. Typography, color, and surfaces

- Use the project's semantic tokens and type roles. Financial and tabular data
  need stable alignment and readable numerals.
- Borders, fills, radii, and shadows should communicate one hierarchy decision;
  avoid triple-signaling every surface.
- Accent color belongs to primary actions, selection, and meaningful state.
  Inactive elements should not compete with it.

## 6. Forms and feedback

- Keep labels visible, errors adjacent to the relevant field, and helper text
  actionable. Use progressive disclosure when the full form would overwhelm
  the current step.
- Feedback must explain what happened and what the user can do next. Do not use
  a toast to replace persistent status that matters after it disappears.

## 7. Charts and dense data

- Choose a chart for the comparison or trend the user needs, not for visual
  variety. Include units, timeframe, accessible color, and a textual or tabular
  path to important values.
- Test six-figure amounts, negative values, long legal entities, pending rows,
  missing data, and empty history. Do not rely on color alone for status.

## Product-copy pass

Preserve every factual claim and required legal meaning while removing writing
patterns that make the interface sound generated:

- vague uplift language, exaggerated importance, and unsupported superlatives;
- repeated summaries that restate the heading;
- assistant-like preambles, conclusions, and unnecessary reassurance;
- overused all-caps labels, parenthetical asides, and decorative metadata;
- generic verbs such as “unlock,” “elevate,” or “revolutionize” when a concrete
  action is available.

Match the established product voice. Never invent a number, requirement,
customer, quote, deadline, or outcome to make the copy feel more specific.

## Verification pass

Use realistic fixtures and inspect the rendered interface. Record failures by
severity and evidence. After fixes, run a subtraction pass: remove every added
label, icon, surface, divider, or animation that does not support a task, state,
hierarchy decision, accessibility need, or trust signal.

This rubric synthesizes the impact ordering in UI/UX Pro Max, production craft
checks from Impeccable, and the claim-preserving copy discipline in Humanizer.
