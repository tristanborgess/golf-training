# Aureo Micro App Boilerplate

Next.js App Router micro-app boilerplate with shadcn/ui, Tailwind v4, next-intl (English-as-source), next-themes, and fonts included.

**Purpose:** Build tiny, serverless-friendly micro apps without databases, users, or auth. Ship fast and drive traffic to Aureo Bitcoin.

## Features

- **App Router** • **shadcn/ui** • **Tailwind v4** • Dark/Light via `next-themes`
- **i18n**: English-as-source with key hashing; auto-sync script
- **HSL theme tokens** in `src/app/globals.css`
- **Fonts** (Switzer, Plantin MT Pro) prebundled via `localFont`
- **Husky pre-commit** (lint-staged), Biome, Bun test

## Quick Start

```bash
git clone git@github.com:SwapidoApp/micro-app-boilerplate.git your_new_app_name
cd your_new_app_name
bun install
bun run dx   # dev server + i18n watcher
```

Open http://localhost:3001 → default `/es`

Write translations:

```tsx
import { useTranslations } from "@/lib/use-translations";

const t = useTranslations();
<h1>{t("Welcome to our app")}</h1>;
```

## i18n Workflow

- Auto-sync on file save when running `bun run dx` (or `bun run i18n:sync` once)
- New `t("...")` calls are automatically added to `locales/*.json` on save
- Edit `locales/*.json` (keys are English phrases)
- **Cursor command:** "Translate Missing Entries" (Cmd+Shift+P) to translate all empty `""` values in `es.json`

## Theme & UI

- Contained in `src/app/globals.css`
- ShadCN components can be customized.
- Fonts already configured; to change, replace files in `public/fonts/` and update `layout.tsx` if needed

## Add shadcn Components

```bash
npx shadcn@latest add <component>
```

Components appear in `src/components/ui/*`

## Project Layout

```
src/
  app/[locale]/ (layout.tsx, page.tsx)
  components/ (navbar, theme-*)
  components/ui/*
  i18n/ (routing.ts, request.ts)
  lib/ (use-translations, i18n-utils, utils)
locales/ (en.json, es.json)
scripts/i18n-sync.cjs
```

## Dev Commands

```bash
bun run dx        # dev + i18n watcher
bun run i18n:sync # one-time sync
bun test          # tests
bun run lint      # Biome
```

## Testing

See `src/lib/utils.test.ts` for an example. Bun's test runner uses Jest-compatible API:

```ts
import { describe, expect, test } from "bun:test";

test("example", () => {
  expect(1 + 1).toBe(2);
});
```

## Conventions

- Keys = English phrases; falls back to English
- Prefer HSL tokens; avoid inline colors
- Pre-commit runs lint-staged, then full lint & typecheck
