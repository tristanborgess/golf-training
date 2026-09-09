# Visual craft

Use these checks selectively. They are prompts for judgment, not a mandate to
apply every technique.

## Typography and copy

- Establish an intentional display, heading, body, label, and numeric scale.
- Keep paragraphs near a readable 45-75 character measure.
- Use balanced wrapping for display text and pretty wrapping for prose when
  browser support and project conventions allow it.
- Reserve all caps and wide tracking for rare, meaningful metadata.
- Keep a single voice across navigation, headings, CTA labels, body copy, and
  states. Prefer concrete language over startup clichés.
- Do not invent precise metrics, specifications, testimonials, customers, or
  product claims. Label sample data clearly.
- Check italic display text for clipped ascenders and descenders.

## Color, material, and shape

- Use semantic tokens and verify contrast in every supported theme.
- Keep neutral temperature, accent usage, and lighting direction coherent.
- Let borders, shadows, and elevation communicate hierarchy. A card does not
  need all three.
- Establish a radius rule, such as tight controls and softer containers, then
  apply it consistently.
- Use gradients, grain, blur, and glass only when they support the art
  direction. Apply expensive texture to fixed, pointer-free overlays rather
  than scrolling containers.
- For transparent surfaces, provide a legible solid fallback where reduced
  transparency is supported or blur is unavailable.

## Layout and rhythm

- Constrain the content width while allowing intentional full-bleed media.
- Give each section one dominant alignment and one primary message.
- Avoid accidental symmetry and accidental asymmetry alike.
- Align comparable titles, prices, lists, and actions across neighboring
  components when comparison is their purpose.
- Use grid for reliable multi-column structure; avoid brittle percentage math.
- Use dynamic viewport units for full-height mobile sections when supported.
- Verify bento spans and source order. Never add an empty tile to complete a
  shape.
- Break long content into meaningful groups, tabs, disclosures, scroll-snap
  sets, or highlighted subsets rather than a decorative list of every item.

## Hero and navigation

- Keep desktop navigation within a compact height and a single line. Move
  secondary actions into an overflow or mobile menu when needed.
- Make the headline, supporting copy, media, and actions fit the initial
  viewport at the target sizes when that is part of the brief.
- Use at most one small supporting element before or after the main hero copy.
- Put logo walls, pricing teasers, and feature lists in their own sections.
- Do not add scroll cues, decorative version stamps, fake location readouts,
  or section numbering.

## Interaction and states

- Provide visible focus, hover, active, disabled, loading, empty, and error
  behavior where the component can enter those states.
- Keep CTA labels concise enough to remain on one line at desktop widths.
- Ensure ghost or transparent controls remain legible over media.
- Use labels above form controls and connect helper and error text
  semantically. Never rely on placeholder text as the label.
- Hover-dependent reveals need an equivalent for keyboard and touch users.

## Imagery and iconography

- Match image content, crop, and color treatment to the section's purpose.
- Reserve image space to prevent layout shift and write useful alt text for
  meaningful images.
- Use one icon family already present in the project. Do not hand-draw icons
  that a maintained library already provides.
- Social-proof marks should be authentic and accessible. Do not present plain
  text names as if they were verified logos.
- Skip decorative photo credits, image badges, and metadata overlays unless
  they convey real information.
