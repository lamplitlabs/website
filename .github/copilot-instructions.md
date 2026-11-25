# GitHub Copilot Instructions

This repository uses **PULSE** - **Planning & Unified Lifecycle for Software Engineering** - to organize context, decisions, and plans.

## Quick Start for Copilot

1. **Read context first:** Check [`docs/context/product.md`](docs/context/product.md) and [`docs/context/stack.md`](docs/context/stack.md) before starting work.
2. **Check decisions:** Review [`docs/decisions/`](docs/decisions/) for architectural choices.
3. **Plan non-trivial work:** Use [`docs/plans/`](docs/plans/) for verifiable work steps.
4. **Implement:** Modify only product code in `app/`, `components/`, `hooks/`, `lib/` after context and plans are clear.
5. **Verify:** Run `npm run lint`, `npm run typecheck`, `npm run build` before completing work.

## Build & Test Commands

```bash
# Development
npm run dev          # Start at http://localhost:3000

# Verification (used in CI)
npm run lint         # ESLint check
npm run typecheck    # TypeScript type check
npm run build        # Build static export

# Cleanup
npm run clean        # Remove .next and out directories
```

## Project Facts

- **Project:** Lamplit Labs corporate website
- **Tech Stack:** Next.js 15 (static export), TypeScript, Tailwind CSS, shadcn/ui
- **Deployment:** Vercel (auto-deploy on main branch push)
- **Product Code:** `app/`, `components/`, `hooks/`, `lib/`, `public/`
- **Configuration:** `next.config.js`, `tailwind.config.ts`, `tsconfig.json`
- **CI/CD:** GitHub Actions (`.github/workflows/`)

## Key Conventions

- **Page structure:** Use Next.js 15 app directory with React Server Components by default.
- **UI components:** Extend shadcn/ui patterns; check existing components before creating new ones.
- **Styling:** Tailwind CSS utility classes with `class-variance-authority` for component variants.
- **Dark mode:** Supported via `next-themes`; preserve theme switching.
- **Types:** Strict TypeScript; run `npm run typecheck` before committing.
- **Static export:** Output goes to `./out`; no server-side rendering.

## Control Plane

- **Architecture:** [`docs/architecture/`](docs/architecture/) — system design and layout
- **Context:** [`docs/context/`](docs/context/) — product, stack, and facts
- **Decisions:** [`docs/decisions/`](docs/decisions/) — ADRs and technical choices
- **Features:** [`docs/features/`](docs/features/) — user-facing behavior specs
- **Memory:** [`docs/memory/`](docs/memory/) — patterns, conventions, lessons
- **Plans:** [`docs/plans/`](docs/plans/) — verifiable work for non-trivial tasks
- **Workflows:** [`docs/workflows/`](docs/workflows/) — repeatable procedures

For the complete PULSE guide, see [`AGENTS.md`](AGENTS.md).
