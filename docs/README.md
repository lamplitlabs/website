# PULSE Documentation - Lamplit Labs Website

This folder is the canonical control plane for the Lamplit Labs corporate website using **PULSE** — **Planning & Unified Lifecycle for Software Engineering** — from [manishtiwari25/pulse](https://github.com/manishtiwari25/pulse).

## Folder Structure

```text
architecture/    System design, component hierarchy, data flow
context/         Product facts, stack details, repository structure
decisions/       Architecture Decision Records (ADRs)
features/        Feature specifications and behavior requirements
memory/          Patterns, conventions, lessons, and common mistakes
plans/           Verifiable work plans for non-trivial tasks
prompts/shared/  Reusable implementation prompts (model-agnostic)
workflows/       Repeatable engineering procedures
```

## Quick Navigation

- **New to the project?** Start with [`context/product.md`](context/product.md) and [`context/stack.md`](context/stack.md).
- **Making architectural decisions?** Read existing [`decisions/`](decisions/) and create a new ADR.
- **Planning work?** Use [`plans/_template.md`](plans/_template.md) for verification-first planning.
- **Implementing a feature?** Check [`features/`](features/) for spec and existing [`memory/`](memory/) for conventions.
- **Need to understand system design?** See [`architecture/`](architecture/).

## PULSE Lifecycle

1. **Understand** — Review context and architecture
2. **Decide** — Record choices as ADRs
3. **Plan** — Create verifiable work plans
4. **Specify** — Define feature behavior
5. **Build & verify** — Implement and validate
6. **Learn** — Document patterns and conventions

## Repository Context

- **Purpose:** Lamplit Labs corporate website (static export)
- **Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Vercel
- **Product Code:** `app/`, `components/`, `hooks/`, `lib/`, `public/`
- **Real Commands:**
  - `npm run dev` — local development
  - `npm run build` — static export
  - `npm run lint` — ESLint check
  - `npm run typecheck` — TypeScript check
  - `npm run clean` — clean artifacts

## Why PULSE

This repository uses PULSE to keep the reasoning, decisions, and plans alongside the code. When building features, you have:

```
Context → Decide → Plan → Specify → Build → Verify → Learn
```

This means:
- Future developers (and agents) can understand **why** something was built.
- Reviewers can audit the full decision path.
- New team members trace features back to their reasons.
- Agents continue work without rebuilding context from memory.

## Critical Rules

- The `docs/` folder is canonical. Do not create parallel root-level control-plane folders.
- Product code modifications go in `app/`, `components/`, etc. — not in `docs/`.
- Do not add hidden tool-specific folders (`.claude/`, `.cursor/`, etc.).
- Preserve the existing Next.js, TypeScript, Tailwind, and Vercel setup.
- When changes touch deployment, config, or dependencies, plan rollback first.

## Files Changed by PULSE Bootstrap

This bootstrap created:
- `AGENTS.md` — Agent operating guide
- `.github/copilot-instructions.md` — GitHub Copilot entry point
- `docs/` — Control plane (this folder and all subfolders)

**Preserved:** Product code, existing configs, CI/CD workflows, uncommitted work.
