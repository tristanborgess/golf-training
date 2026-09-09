# Design direction

Read the brief before selecting a style. Useful signals include page kind,
audience, brand maturity, named references, existing assets, accessibility
needs, and whether the decision is trust-led or expression-led.

## Direction dials

Use three 1-10 values as a communication aid, not as an algorithm.

- **Layout variance:** 1 is highly symmetric; 10 is strongly asymmetric.
- **Motion intensity:** 1 is static except for feedback; 10 is cinematic
  scroll choreography.
- **Content density:** 1 is gallery-like; 10 is compact and information-heavy.

Typical starting regions:

| Brief                       | Variance | Motion | Density |
| --------------------------- | -------: | -----: | ------: |
| Mainstream SaaS landing     |      6-7 |    4-6 |       4 |
| Creative studio or campaign |      8-9 |    6-8 |       3 |
| Premium consumer            |      6-8 |    4-6 |       3 |
| Developer portfolio         |      6-7 |    4-6 |       4 |
| Editorial or publication    |      5-7 |    3-5 |     3-5 |
| Public-sector or regulated  |      3-4 |    1-3 |     4-6 |

Adjust from the user's references. High variance still needs a predictable
mobile reading order. High motion still needs a complete reduced-motion path.

## Foundation selection

Preserve an existing design system whenever one exists. For a genuinely
greenfield project, select an official system when the brief clearly belongs
to its ecosystem, such as an enterprise platform, government service, or
commerce admin. Use the official package and tokens; do not reproduce its look
with unrelated primitives.

An aesthetic is not a design system. Editorial, brutalist, glass, bento,
kinetic type, and mesh-gradient directions can be implemented with the
project's existing CSS and primitives. Describe them as inspiration, not as an
official package.

Use only one component system. A utility framework may style an official
system when its documentation supports that integration, but do not mix two
unrelated component libraries in the same surface.

## Art-direction decisions

Choose and record:

- one type strategy and a reason it fits the brand;
- one neutral family and one controlled accent strategy;
- one radius rule for containers and controls;
- two to four layout families for the whole page;
- one primary motion language;
- the image roles and crops needed.

Avoid selecting fonts or palettes by rote. Inter, serif display type, purple,
warm craft palettes, glass, centered heroes, and bento grids are all valid
when the brief supports them. None should be the automatic answer.

If the project supports multiple themes, keep semantic roles consistent in
each theme. A single-theme marketing page may intentionally choose light or
dark when the user and project allow it; do not invent a toggle solely to
satisfy a generic rule.
