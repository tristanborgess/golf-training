# Frontend preflight

Run this against the rendered result. Fix failures before delivery.

## Direction

- Does the result match the declared audience, tone, and design direction?
- Is one design system, palette strategy, radius rule, and motion language used
  coherently?
- Does every section have a clear purpose and a distinct but related
  composition?

## Content and hierarchy

- Is the primary action obvious and readable?
- Does the hero avoid overflow, excessive metadata, and competing messages?
- Is all visible copy grammatical, specific, and free of fabricated claims?
- Are long lists and comparisons presented in a genuinely scannable format?
- Are decorative labels, dots, version stamps, scroll cues, and fake technical
  metadata removed?

## Layout and responsive behavior

- Are desktop navigation and CTA labels unwrapped?
- Do grids have the exact cells needed, correct source order, and no accidental
  holes?
- Does every multi-column section have an intentional mobile collapse?
- Is there no unintended horizontal overflow, clipped text, or obscured focus?
- Do images reserve space and use suitable crops at each breakpoint?

## Accessibility and states

- Do text, controls, placeholders, focus rings, and text over images meet the
  project's contrast target?
- Can the page be navigated by keyboard and touch?
- Are loading, empty, error, disabled, hover, active, and focus states present
  where relevant?
- Does reduced motion expose the same content in a usable order?
- Are meaningful images and controls labeled accessibly?

## Motion and performance

- Does each animation communicate hierarchy, narrative, feedback, or state?
- Are transforms and opacity used for animated properties?
- Are listeners, timelines, and triggers cleaned up?
- Does animation remain correct after resize and back-navigation?
- Are large assets optimized and below-the-fold work deferred?

## Project integrity

- Do all imports and assets exist?
- Were existing tokens, primitives, and package-manager conventions respected?
- Do formatting, lint, type, and targeted tests pass?
- Is the diff focused and free of unrelated framework, route, analytics, or
  content changes?
