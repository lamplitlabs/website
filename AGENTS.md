# PULSE - Agent Operating Guide

This repository adopts **PULSE** - **Planning & Unified Lifecycle for Software Engineering** - from [manishtiwari25/pulse](https://github.com/manishtiwari25/pulse).

See [`docs/README.md`](docs/README.md) for the control-plane structure and [`AGENTS.md` in the PULSE source](https://github.com/manishtiwari25/pulse/blob/main/AGENTS.md) for the complete framework guide.

## Repository Map

```text
AGENTS.md                         This file — PULSE agent entry point
.github/copilot-instructions.md   GitHub Copilot entry point
docs/                             Canonical control plane
  architecture/                   System design and component layout
  context/                        Product, stack, and implementation facts
  decisions/                       Architecture decision records (ADRs)
  features/                        Feature and behavior specifications
  memory/                          Patterns, conventions, and lessons
  plans/                           Verifiable work plans
  prompts/shared/                  Reusable execution prompts
  workflows/                       Repeatable engineering procedures
```

## Quick Reference

**Development:**
```bash
npm run dev          # Start local dev server at http://localhost:3000
npm run build        # Build static export to ./out
npm run lint         # Lint with ESLint
npm run typecheck    # Run TypeScript type checker
npm run test         # Run smoke tests (node --test, tests/**/*.test.mjs)
npm run test:e2e     # Build static export, then run all smoke tests incl. out/ check (never skipped)
npm run clean        # Clean build artifacts
npm run check        # Full verification: lint → typecheck → test → build (one command; if the script is
                     # not yet in package.json on your branch, run those four commands in that order)
```

**Verification:**
- CI pipeline: lint → typecheck → build (see `.github/workflows/ci.yml`)
- Deployment: auto to Vercel on main branch (see `.github/workflows/deploy-web-vercel.yml`)

## PULSE Lifecycle for This Repository

1. **Understand** — Read `docs/context/` (product, stack, structure).
2. **Decide** — Record choices in `docs/decisions/`.
3. **Plan** — Create plans in `docs/plans/` for non-trivial work.
4. **Specify** — Describe features in `docs/features/`.
5. **Build** — Implement product code only after decisions and plans are clear.
6. **Verify** — Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.
7. **Learn** — Record patterns and lessons in `docs/memory/`.

## Critical Rules

- The `docs/` control plane is canonical. All engineering context, decisions, and plans live here.
- Do not create parallel root-level control-plane folders.
- Product code lives in `app/`, `components/`, `hooks/`, `lib/`, and `public/`.
- Do not add hidden tool-specific control folders (`.claude/`, `.cursor/`, etc.).
- Preserve the existing Next.js setup, TypeScript configuration, and Vercel deployment.
- Do not modify product code before the feature or ADR is documented.
- Keep prompts and plans model-agnostic.
- When changes touch files, dependencies, or deployment, define a rollback plan first.

## Open Intake Questions

Unanswered questions that need owner input (release cadence, performance/SEO goals,
design-system docs, i18n, analytics, image optimization) live in one place:
[`docs/context/open-questions.md`](docs/context/open-questions.md). Do not write an ADR
or plan that assumes an answer to one of them; reference the question by number and
stop for owner input instead.

## Next Steps

1. Review [`docs/context/product.md`](docs/context/product.md) for current understanding.
2. Review [`docs/context/stack.md`](docs/context/stack.md) for technical details.
3. When starting work, check [`docs/memory/`](docs/memory/) for existing patterns and conventions.
