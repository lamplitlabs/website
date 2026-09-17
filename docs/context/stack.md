# Technical Stack - Lamplit Labs Website

## Core Framework & Language

- **Node.js:** 20+ (see `.nvmrc` for exact version)
- **Runtime:** Next.js 15.5.25 with static export (`output: "export"` in `next.config.js`)
- **Language:** TypeScript 5.6.3 (strict mode)
- **Package Manager:** npm (lock file tracked)

## Frontend Stack

### UI Framework & Styling
- **React:** 19.2.8
- **Next.js:** 15.5.25 (App Router, React Server Components by default)
- **Tailwind CSS:** 3.4.17 + tailwindcss-animate
- **Component Library:** shadcn/ui patterns (using `@radix-ui/react-slot`, `clsx`, `class-variance-authority`, `tailwind-merge`)
- **Icons:** lucide-react 0.469.0

### Features & Utilities
- **Dark Mode:** next-themes 0.4.4
- **Styling Utilities:** `clsx` (class concatenation), `class-variance-authority` (component variants), `tailwind-merge` (Tailwind merging)

## Development Tools

### Type Checking
- **TypeScript:** 5.6.3
- **ESLint:** 8.57.0 with `eslint-config-next`
- **Command:** `npm run typecheck` for type checking without emit

### Build & Deployment
- **Build Tool:** Next.js built-in
- **Output:** Static HTML export to `./out/`
- **Deployment:** Vercel (via `.github/workflows/deploy-web-vercel.yml`)
- **CSS Processing:** PostCSS 8.5.x (pinned to patched 8.5.23+ range) + Autoprefixer 10.4.20

## Development Environment Setup

```bash
# Install dependencies
npm install

# Development server (live reload)
npm run dev

# Build static export
npm run build

# Lint checks
npm run lint

# Type checking (no emit)
npm run typecheck

# Clean artifacts
npm run clean
```

## Project Structure

```
app/              Next.js 15 app directory (pages, layout, global styles)
components/       Reusable UI components (Sections, Cards, Hero, etc.)
hooks/            Custom React hooks (useTheme, useScroll, etc.)
lib/              Utility functions and helpers
public/           Static assets (favicons, OG images, product covers)
.github/          CI/CD workflows and GitHub Actions
.eslintrc.json    ESLint configuration
next.config.js    Next.js configuration (static export, redirects, etc.)
postcss.config.js PostCSS configuration
tailwind.config.ts Tailwind CSS configuration (theme, plugins)
tsconfig.json     TypeScript configuration
package.json      Dependencies and scripts
```

## CI/CD Pipeline

### Triggers
1. **On PR:** Lint, typecheck, build
2. **On push to main:** Full test suite + deploy to Vercel
3. **Manual:** Workflow dispatch for deployments

### Verification Steps (Sequential)
1. **Lint** — ESLint checks with Next.js config
2. **Typecheck** — TypeScript strict mode check
3. **Build** — Next.js static export to `./out/`
4. **Deploy** — Vercel deployment with retry logic (3 attempts)

See `.github/workflows/ci.yml` and `.github/workflows/deploy-web-vercel.yml` for details.

## Deployment Target

- **Platform:** Vercel
- **Environment:** Production
- **Auto-deploy:** On push to `main` branch
- **CDN:** Vercel global edge network
- **Configuration:** Vercel project ID and org ID stored as GitHub secrets
- **Routing:** `vercel.json` rewrites `/` → `/index` because the Next.js builder serves `out/index.html` as `/index` and emits no explicit root route (see `docs/memory/2026-09-06-vercel-static-export-root-route.md`)

## Key Dependencies & Rationale

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| next | 15.5.25 | Web framework | Static export with App Router |
| react | 19.2.8 | UI library | Server & client components |
| typescript | 5.6.3 | Type safety | Strict mode |
| tailwindcss | 3.4.17 | Styling | Utility-first CSS |
| @radix-ui/react-slot | 1.1.1 | UI primitives | Composition pattern |
| class-variance-authority | 0.7.1 | Component variants | Type-safe CSS classes |
| next-themes | 0.4.4 | Dark mode | Light/dark theme toggle |
| lucide-react | 0.469.0 | Icon library | Consistent icon set |
| vercel (`tools/vercel-cli`) | 59.11.7 | Deploy CLI used by the deploy workflow | Exact pin; not a site dependency |

### Dependency Security

Both `package.json` and `tools/vercel-cli/package.json` carry an npm `overrides` block that patches transitive packages pinned by `next`/`vercel` (e.g. `postcss`, `undici`, `minimatch`). Keep them when bumping the parents, and re-run `npm audit` in both directories — see `docs/memory/2026-09-06-dependabot-transitive-overrides.md`.

## Known Limitations & Constraints

1. **No server-side rendering** — Static export only; dynamic routes use client-side data fetching
2. **No API routes** — This is a static site; external APIs only
3. **No database** — All content is static or fetched from external sources
4. **Node version lock** — `.nvmrc` specifies Node 20; CI uses this version

## Development Workflow

1. Clone repository
2. Run `npm install`
3. Run `npm run dev` to start local server
4. Make changes to `app/`, `components/`, etc.
5. Run `npm run lint && npm run typecheck` to verify
6. Commit and push to `main` (triggers auto-deploy)

## Open Questions

Tracked centrally in [`open-questions.md`](open-questions.md) (performance budgets: #2, image optimization: #4, analytics/monitoring integrations: #5).
