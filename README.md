# Aureo Micro App Boilerplate

A minimal Next.js 16 boilerplate for building tiny, serverless-friendly micro apps. Perfect for quick deployments that drive traffic to Aureo Bitcoin.

## Purpose

This boilerplate is designed for **micro apps**—small, focused applications that:

- Don't require databases
- Don't need user authentication
- Don't need complex backend logic
- Can be deployed serverlessly
- Drive traffic to Aureo Bitcoin

Use this starter to ship fast and deploy to Vercel.

## What's Included

### 🎨 **shadcn/ui + Tailwind CSS v4**

- Pre-configured shadcn/ui components
- Tailwind CSS v4 with custom theme
- Dark/light mode support via `next-themes`
- HSL-based color system (compatible across browsers)

### 🌍 **Internationalization (i18n)**

- `next-intl` with `{locale}` base parameter
- Default locale: `es` (Spanish)
- English-as-source translation system
- Write English directly in `t()` calls—no key management needed
- Translation keys are automatically hashed internally

**How it works:**

```tsx
import { useTranslations } from "@/lib/use-translations";

const t = useTranslations();
// Just write English—it's automatically translated!
t("Hello, world!"); // → "¡Hola, mundo!" (in Spanish)
```

**Auto-sync locales:**

The project includes an automatic locale synchronization system that keeps your translation files in sync with your code:

- **New `t("...")` calls** → Automatically added to `locales/en.json` (with English value) and other locale files (with empty string placeholder)
- **Removed `t("...")` calls** → Automatically removed from all locale files
- **Existing translations preserved** → Non-English translations are never overwritten

**Usage:**

```bash
# One-time sync (extract all t() calls and update locale files)
bun run i18n:sync

# Watch mode (auto-sync on file changes)
bun run i18n:watch

# Development mode (recommended - runs Next.js dev + i18n watcher together)
bun run dx
```

**Translation workflow:**

1. **Write code with English phrases:**

   ```tsx
   const t = useTranslations();
   <p>{t("Welcome to our app")}</p>;
   ```

2. **Run `bun run dx`** - This starts both the dev server and the i18n watcher:

   - The watcher automatically detects new `t("...")` calls
   - New phrases are added to `locales/en.json` (with English value)
   - New phrases are added to `locales/es.json` (with empty string `""` placeholder)

3. **Translate missing Spanish entries:**

   - Open `locales/es.json` and find entries with empty string values (`""`)
   - Translate the English key (the phrase) into Spanish
   - Replace the empty string with your translation
   - **Quick tip:** Use the Cursor command "Translate Missing Entries" (see below) for AI-assisted translation

4. **The watcher preserves your translations** - Existing Spanish translations are never overwritten, only new empty entries are added

**Limitations:**

- Only extracts string literals: `t("Hello")` ✅ and `` t(`Hello`) `` ✅
- Does not extract dynamic keys: `t(someVariable)` ❌ or `` t(`Hello ${name}`) `` ❌
- Watches `src/**/*.{ts,tsx,js,jsx}` files only

### 📐 **Next.js App Router**

- File-based routing with locale support
- Server Components by default
- Optimized for serverless deployment

### 🎭 **Theme System**

- Custom HSL color palette
- Dark/light mode toggle
- CSS variables for easy customization
- Theme tokens defined in `src/app/globals.css`

### 🔤 **Custom Fonts**

- **Switzer** (sans-serif) for UI
- **Plantin MT Pro** (serif) for headings
- See [FONTS.md](./FONTS.md) for setup instructions

## Getting Started

### Prerequisites

- Bun (recommended) or Node.js 18+
- Font files (see [FONTS.md](./FONTS.md))

### Installation

1. **Clone this repository:**

   ```bash
   git clone <repository-url>
   cd inflacionmexico
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Add fonts** (see [FONTS.md](./FONTS.md) for details):

   - Place font files in `public/fonts/`
   - Required: Switzer (regular, medium, semibold, bold) and Plantin MT Pro (regular, bold)

4. **Run the development server:**

   ```bash
   bun run dx
   ```

   This starts both the Next.js dev server and the i18n translation watcher. As you write code with `t("...")` calls, translations are automatically synced.

5. **Open your browser:**
   - http://localhost:3001
   - The app redirects `/` to `/es` (default locale)
   - Switch to `/en` for English

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Localized routes (es/en)
│   │   ├── layout.tsx      # Root layout (i18n + theme + fonts)
│   │   └── page.tsx        # Homepage
│   ├── globals.css         # Theme + fonts + Tailwind
│   └── proxy.ts            # next-intl middleware (Next.js proxy convention)
├── components/
│   ├── navbar.tsx          # Navigation bar with logo, lang switcher, theme toggle
│   ├── theme-provider.tsx  # Theme context provider
│   ├── theme-toggle.tsx    # Dark/light mode toggle
│   └── ui/                 # shadcn/ui components
├── i18n/
│   ├── request.ts          # next-intl message loader
│   └── routing.ts          # Locale configuration (es/en, default: es)
├── lib/
│   ├── i18n-utils.ts      # Translation key hashing (djb2)
│   └── use-translations.ts # Custom hook for English-as-source translations
├── locales/                # Translation files
│   ├── en.json             # English translations (keys are English phrases)
│   └── es.json             # Spanish translations
└── scripts/
    └── i18n-sync.cjs       # Auto-sync script for translation extraction
```

## Using This Boilerplate

### 1. Clone and Customize

```bash
# Clone the repo
git clone <repository-url>
cd your-new-app

# Install dependencies
bun install

# Add your fonts (see FONTS.md)
# Update translations in locales/
# Customize theme in src/app/globals.css
# Build your app!
```

### 2. Deploy to Vercel

You can deploy using either the Vercel CLI or GitHub integration. Both workflows are supported.

#### Option A: Vercel CLI (Recommended for quick deployments)

1. **Install Vercel CLI:**
   ```bash
   bunx vercel
   ```

2. **Create and link project:**
   ```bash
   vercel
   ```
   - Follow the prompts to create a new project
   - Link it to your repository

3. **Deploy to production:**
   ```bash
   vercel --prod
   ```
   This deploys directly to the `main` branch and creates a production deployment.

4. **Get a custom domain:**
   - Go to your project dashboard on [vercel.com](https://vercel.com)
   - Navigate to Settings → Domains
   - Add your domain (e.g., `your-app.com`)
   - Connect it to your production deployment

#### Option B: GitHub Integration (Recommended for team workflows)

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and configure build settings

3. **Configure (if needed):**
   - Build Command: `bun run build` (or `npm run build`)
   - Output Directory: `.next` (default)
   - Install Command: `bun install` (or `npm install`)

4. **Deploy:**
   - Click "Deploy"
   - Every push to `main` will automatically deploy to production
   - Your app will be live at `your-app.vercel.app`

5. **Add custom domain:**
   - In project Settings → Domains, add your domain
   - Connect it to the production deployment

**Note:** Both workflows work great. Use CLI for quick one-off deployments, or GitHub integration for automatic deployments on every push (like we do for our marketing site and main app).

### 3. Customize Translations

**Recommended workflow:**

1. **Start development with auto-sync:**

   ```bash
   bun run dx
   ```

   This runs both the Next.js dev server and the i18n watcher. As you write code with `t("...")` calls, the watcher automatically:

   - Adds new phrases to `locales/en.json` (with English value)
   - Adds new phrases to other locale files (with empty string `""` placeholder)
   - Removes unused phrases
   - Preserves existing translations

2. **Translate missing Spanish entries:**

   **Option A: Use Cursor AI command (fastest)**

   - Open the Cursor command palette (Cmd+Shift+P / Ctrl+Shift+P)
   - Run: **"Translate Missing Entries"**
   - This command will automatically translate all empty Spanish entries in `locales/es.json`

   **Option B: Manual translation**

   - Open `locales/es.json`
   - Find entries with empty string values (`""`)
   - Translate the English key (the phrase) into Spanish
   - Replace the empty string with your translation

**Translation file format:**

Keys are English phrases. Here's how the files look:

`locales/en.json`:

```json
{
  "Hello, world!": "Hello, world!",
  "Welcome to my app": "Welcome to my app"
}
```

`locales/es.json`:

```json
{
  "Hello, world!": "¡Hola, mundo!",
  "Welcome to my app": "Bienvenido a mi aplicación"
}
```

In your code:

```tsx
import { useTranslations } from "@/lib/use-translations";

const t = useTranslations();
<p>{t("Hello, world!")}</p>;
```

**Adding new locales:**

1. Create `locales/{locale}.json` (e.g., `locales/fr.json`)
2. Run `bun run i18n:sync` to populate it with all current keys (empty values)
3. Fill in translations manually or use the Cursor command

### 4. Customize Theme

Edit `src/app/globals.css` to adjust colors:

```css
:root {
  --background: hsl(40 100% 98%);
  --foreground: hsl(215 10% 20%);
  /* ... */
}

.dark {
  --background: hsl(36 100% 0.98%);
  --foreground: hsl(210 20% 96%);
  /* ... */
}
```

### 5. Add shadcn/ui Components

This boilerplate uses shadcn/ui with the CLI. To add new components:

1. **Browse available components:**

   - Visit [ui.shadcn.com](https://ui.shadcn.com/docs/components)
   - Find the component you need (e.g., `alert`, `badge`, `dialog`, `sheet`)

2. **Add the component:**

   ```bash
   npx shadcn@latest add <component-name>
   ```

   Example:

   ```bash
   npx shadcn@latest add alert
   npx shadcn@latest add badge
   npx shadcn@latest add dialog
   ```

3. **Use the component:**
   Components are added to `src/components/ui/` and can be imported directly:
   ```tsx
   import { Alert, AlertDescription } from "@/components/ui/alert";
   import { Badge } from "@/components/ui/badge";
   ```

**Note:** The project is configured with:

- TypeScript (`tsx: true`)
- React Server Components (`rsc: true`)
- CSS variables for theming (`cssVariables: true`)
- Components directory: `src/components/ui/`

All components will automatically use your theme colors defined in `globals.css`.

### 6. Add Pages

Create new pages under `src/app/[locale]/`:

```
src/app/[locale]/
├── layout.tsx
├── page.tsx          # Homepage
├── about/
│   └── page.tsx      # /es/about or /en/about
└── contact/
    └── page.tsx      # /es/contact or /en/contact
```

## Development

```bash
# Run dev server + i18n watcher (recommended)
bun run dx
# or separately:
bun run dev              # Next.js dev server
bun run i18n:watch       # Auto-sync locales

# One-time locale sync
bun run i18n:sync

# Run tests
bun test

# Build for production
bun run build

# Start production server
bun start

# Lint
bun run lint

# Format code
bun run format
```

## Cursor AI Commands

This project includes Cursor commands to streamline development:

### Translate Missing Entries

Quickly translate all missing Spanish entries using AI:

1. Open Cursor command palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: **"Translate Missing Entries"**
3. The command will:
   - Find all empty string values (`""`) in `locales/es.json`
   - Translate the English keys into Spanish
   - Replace empty strings with translations

This is especially useful after running `bun run dx` and adding new `t("...")` calls to your code.

## Key Features Explained

### English-as-Source Translation

Instead of managing translation keys, you write English directly:

```tsx
// ❌ Old way (key management)
t("homepage.title");
t("homepage.description");

// ✅ This boilerplate (English-as-source)
t("Welcome to our app");
t("Build amazing things");
```

The system automatically:

1. Hashes the English phrase to create a safe key
2. Looks up the translation in your locale files
3. Falls back to English if translation is missing

### Theme System

- Uses HSL color values (browser-compatible)
- Dark mode via `next-themes`
- CSS variables for easy customization
- shadcn/ui components automatically use theme colors

### Fonts

Custom fonts are loaded via Next.js `localFont` API in `layout.tsx`. If fonts aren't available, the app falls back to system fonts. See [FONTS.md](./FONTS.md) for setup.

### Testing

- Bun's built-in test runner (Jest-compatible API)
- Path aliases (`@/`) work automatically via `tsconfig.json`
- Test files should use `.test.ts` or `.spec.ts` extensions
- Run tests with `bun test` or `bun run test`

## License

MIT
