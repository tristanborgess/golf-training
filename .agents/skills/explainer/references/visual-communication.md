# Visual communication for explainers

Choose a visual only when it makes a relationship materially easier to
understand than concise prose.

## Match the visual to the question

- sequence or state change: flow, timeline, or state diagram;
- ownership or nesting: tree or containment map;
- repeated mappings: table or matrix;
- one source affecting several consumers: dependency flow;
- quantities over time: chart with units and an explicit comparison;
- spatial interface explanation: annotated wireframe;
- tradeoffs between alternatives: comparison table or two-axis map.

Use the smallest useful form. A three-step linear process does not need an
architecture poster, and a single fact does not need a diagram.

## Diagram craft

- Give the diagram one question and one reading direction.
- Use real text labels, not unlabeled colored boxes. Keep terminology identical
  to the source product or specification.
- Arrows must encode a named relationship or direction. Remove decorative
  connectors and avoid crossings where a change in layout can eliminate them.
- Use color for category or state, with shape, label, icon, or pattern as a
  second signal when meaning matters.
- Keep node geometry, line weights, arrowheads, corner rules, and spacing
  consistent. Align to a grid and leave enough whitespace around clusters.
- Place detail near the element it explains. Legends should be necessary, not
  a repair for ambiguous encoding.

## Narrative and responsive behavior

Lead with the conclusion or decision the exhibit supports, then reveal the
evidence in a natural reading order. On narrow screens, preserve that order by
stacking clusters, allowing a deliberately labeled horizontal scroll region,
or switching to a compact table. Do not shrink an entire complex diagram until
its labels are unreadable.

Animation may reveal sequence or state, but the static first frame and reduced-
motion version must remain complete. Keep transitions short and use them to
explain causality, not decorate the canvas.

The explainer is responsive HTML. A fixed 16:9 stage is appropriate only for a
true presentation deck; route those requests to the presentation workflow.

This reference adapts the semantic-diagram approach from Diagram Design and the
show-don't-tell, progressive-disclosure principles from Frontend Slides.
