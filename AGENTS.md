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
npm run test         # Build static export, then run all smoke tests (node --test, tests/**/*.test.mjs)
                     # incl. the out/ export tests in tests/routes.test.mjs (never skipped)
npm run test:unit    # Run smoke tests without building; the out/-dependent tests skip if ./out is absent
npm run test:e2e     # Alias of `npm run test` (kept for existing docs/scripts)
npm run clean        # Clean build artifacts
npm run check        # Full verification: lint → typecheck → test (test builds first, so the out/
                     # export tests in tests/routes.test.mjs are never skipped)
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
6. **Verify** — Run `npm run check`. It is the canonical, sufficient verify sequence: it runs
   lint → typecheck → test, and `npm test` itself builds the static export first, so `check`
   already covers `npm run build` and everything `npm run test:unit` covers (plus the out/-dependent
   export tests in `tests/routes.test.mjs`, which `test:unit` skips when `./out` is absent). Running
   only `npm run lint` and `npm run typecheck` is **not** enough — it skips those export tests. Run the
   individual commands only for a faster local loop, and finish with `npm run check` before committing.
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
- One status-fill job per data file at a time (e.g. `lib/site-data.ts`): parallel edits to the same
  object have shipped duplicate keys (TS1117). Before landing, rebase on fresh `main` and verify
  `npm run typecheck` passes on the rebased branch.

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
