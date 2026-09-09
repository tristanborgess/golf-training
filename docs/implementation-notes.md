# Implementation record

The approved scope is in ../PRODUCT.md. The prior interview settled product decisions; implementation began only on the explicit instruction “Start building Range Notes”.

## Plan evaluation

Keep the detailed Compass brief's full-bag model, progressive disclosure and local data. Retain the existing Next.js stack instead of migrating to Vite. Replace single-button left/right diagnosis with observed start plus curve. Keep generic yardages secondary; never mix carry with total distance. Distinguish full wedges from chips and bunkers. Use deterministic diagrams rather than baking labels into generated images. Treat face/path inference as approximate and dependent on centered contact, lie and wind.

The first report contains inconsistent push/path descriptions and contradictory slice-alignment cues. Neither report should be copied verbatim into the product. A clubface/path mechanism is a hypothesis, not a definitive cause inferred from a miss alone.

## Local implementation architecture

Static Next.js export with locale documents, all golf data bundled locally, an explicit same-origin precache manifest, and no backend. Local storage uses a versioned validated schema and metres as the canonical carry unit. Analytics has no network transport. Technical diagrams use literal target coordinates and live translated labels.
