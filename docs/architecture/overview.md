# Architecture Overview - Lamplit Labs Website

## System Purpose

A static, fast-loading corporate website showcasing Lamplit Labs and its product portfolio. The site serves as a central hub linking visitors to individual product applications.

## High-Level Design

```
┌──────────────────────────────────────────────────────────┐
│                    Browser / User                        │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTPS
                          ▼
        ┌─────────────────────────────────┐
        │   Vercel Global CDN             │
        │  (lamplitlabs.com)              │
        └────────┬────────────────────────┘
                 │ Static HTML/CSS/JS
                 ▼
    ┌────────────────────────────────────┐
    │   Next.js Static Export            │
    │   (./out directory)                │
    │                                    │
    │  • Layout & Theme                  │
    │  • Product grid & details          │
    │  • Hero, why, AI sections          │
    │  • About, journey, contact links   │
    └────────────────────────────────────┘
                 │
        ┌────────┴─────────┐
        ▼                  ▼
    TypeScript          Tailwind CSS
    Components          Utility Styles
```

## Key Layers

### 1. Pages & Routing (app/)

- **app/layout.tsx** — Root layout with theme provider, header, footer
- **app/page.tsx** — Home page with all sections (hero, why Lamplit, AI, products, about, journey, contact)
- **app/products/[slug]/page.tsx** — Statically generated product detail pages; `generateStaticParams` maps each product in [`lib/site-data.ts`](../../lib/site-data.ts) to its route.

Features:
- React Server Components by default (RSC)
- Client-side interactive features with `"use client"`
- Dynamic theme switching via `next-themes`

### 2. Components (components/)

Reusable UI building blocks organized by concern:

#### Layout Components
- **Header** — Navigation bar with theme toggle
- **Footer** — Social links and copyright
- **Layout** — Page structure and spacing

#### Section Components (home/)
- **HeroSection** — Main value proposition
- **WhyLamplitSection** — Key differentiators
- **AiSection** — Lamplit Light AI lab story (`components/home/ai-section.tsx`, `id="ai"`)
- **ProductsSection** — Grid of products with category filter chips and links
- **AboutSection** — Company story and mission
- **JourneySection** — Timeline or history
- **ContactSection** — Contact information and forms
- **EasterEggs** — Interactive elements

#### Common Patterns
- Sections use Tailwind utility classes and shadcn/ui component patterns
- Dark mode support via `next-themes`
- Responsive design (mobile, tablet, desktop)

### 3. Hooks (hooks/)

Custom React hooks for common patterns:
- State management for UI interactions
- Theme detection and persistence
- Scroll behavior and event handling

### 4. Utilities (lib/)

Pure utility functions:
- String formatting and manipulation
- Date/time utilities
- Type guards and validators
- External API helpers (if any)

### 5. Static Assets (public/)

- Favicons and app icons
- Product cover images (SVG)
- OG images for social sharing
- Logos and brand assets

## Data Flow

```
┌─ Product Data (hardcoded or fetched)
│  
├─ Home Page (app/page.tsx)
│  ├─ useTheme() for dark mode
│  ├─ useState for mobile menu, scroll state
│  ├─ useEffect for scroll events and section tracking
│  │
│  └─ Renders Sections:
│      ├─ HeroSection
│      ├─ WhyLamplitSection
│      ├─ AiSection (`id="ai"`)
│      ├─ ProductsSection (maps products array; filters by Product.category)
│      ├─ AboutSection
│      ├─ JourneySection
│      └─ ContactSection
│
└─ Static Output → ./out/ → Vercel CDN → Browser
```

**Key Points:**
- No server-side data fetching (static export)
- Product list likely in component state or config
- User interactions (theme toggle, navigation) are client-side only
- No backend API calls (external integrations only if needed)

## Component Hierarchy

```
Layout
├─ Header
│  ├─ Logo/Brand
│  ├─ Navigation Links
│  └─ Theme Toggle Button
├─ Main Content
│  ├─ HeroSection
│  ├─ WhyLamplitSection
│  ├─ AiSection
│  ├─ ProductsSection
│  │  └─ ProductCard (repeated)
│  ├─ AboutSection
│  ├─ JourneySection
│  ├─ ContactSection
│  └─ EasterEggs
└─ Footer
   ├─ Social Links
   ├─ Copyright
   └─ Additional Links
```

## Styling Architecture

**Tailwind CSS + shadcn/ui Pattern:**
- Base utilities from Tailwind (spacing, colors, typography)
- Component variants using `class-variance-authority`
- Animations via `tailwindcss-animate`
- Dark mode: class-based toggle (`dark:` prefixed utilities)
- Responsive breakpoints: mobile-first (sm, md, lg, xl, 2xl)

**Color Scheme:**
- Configured in `tailwind.config.ts`
- Light and dark themes managed by `next-themes`
- Uses CSS variables for semantic colors

## Build Pipeline

1. **Development** — Hot reload via `npm run dev`
2. **Lint** — ESLint with Next.js rules
3. **Typecheck** — TypeScript strict mode validation
4. **Build** — Next.js static export to `./out/`
5. **Deploy** — Vercel push with retry logic

All steps run in CI/CD on every push to `main`.

## Performance Considerations

- **Static export:** Pre-rendered HTML (no server runtime overhead)
- **Vercel CDN:** Global edge caching and fast delivery
- **Image optimization:** Tailwind utility classes (no heavy assets by default)
- **Code splitting:** Next.js automatic chunk splitting per route
- **Theme persistence:** Client-side (localStorage) to avoid flash

## Known Constraints & Limitations

1. **No server rendering** — All pages must be static or hydrate on client
2. **No API routes** — Lamplit Labs services used via external URLs only
3. **No form submission** — Contact forms redirect to external endpoint or use API
4. **Build time required** — Static export runs at deploy time (not incremental)

## Future Architectural Considerations

- [ ] Should we add internationalization (i18n) for multilingual content?
- [ ] Do we need client-side routing animations or transitions?
- [ ] Should dynamic product details load from a headless CMS?
- [ ] Performance monitoring or analytics integration?
- [ ] Automated screenshot/preview generation for product cards?

## Related Documents

- **Product Context:** [`docs/context/product.md`](../context/product.md)
- **Technical Stack:** [`docs/context/stack.md`](../context/stack.md)
- **Decisions:** [`docs/decisions/`](../decisions/)
- **Features:** [`docs/features/`](../features/)
