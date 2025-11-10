# Font Setup Instructions

This project uses custom fonts that need to be added manually to the `public/fonts/` directory.

## Required Fonts

### Switzer (Sans-serif)

Place these files in `public/fonts/`:

- `switzer-regular.woff2` (weight: 400)
- `switzer-medium.woff2` (weight: 500)
- `switzer-semibold.woff2` (weight: 600)
- `switzer-bold.woff2` (weight: 700)

### Plantin MT Pro (Serif)

Place these files in `public/fonts/`:

- `plantin-mt-pro-regular.woff2` (weight: 400)
- `plantin-mt-pro-bold.woff2` (weight: 700)

## Directory Structure

After adding fonts, your `public/` directory should look like:

```
public/
├── fonts/
│   ├── switzer-regular.woff2
│   ├── switzer-medium.woff2
│   ├── switzer-semibold.woff2
│   ├── switzer-bold.woff2
│   ├── plantin-mt-pro-regular.woff2
│   └── plantin-mt-pro-bold.woff2
└── logo/
    └── Sun.svg
```

## Font Configuration

The fonts are configured in `src/app/[locale]/layout.tsx` using Next.js's `localFont` API. Once you place the font files in `public/fonts/`, they will be automatically loaded and optimized by Next.js.

The fonts are registered as CSS variables:

- `--font-sans` → Switzer
- `--font-serif` → Plantin MT Pro

## Fallback Fonts

If the custom fonts are not available, the app will gracefully fall back to:

- **Switzer** → `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Plantin MT Pro** → `Georgia, serif`

## Font Sources

These fonts should be obtained from your design system or font provider. The CSS is already configured to use these fonts once they are placed in the correct directory.

## Usage in Code

Fonts are applied via CSS variables:

```css
font-family: var(--font-sans); /* Switzer */
font-family: var(--font-serif); /* Plantin MT Pro */
```

Or in Tailwind classes:

```tsx
<div className="font-sans">Switzer font</div>
<div className="font-serif">Plantin MT Pro font</div>
```
