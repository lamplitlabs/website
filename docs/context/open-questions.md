# Open Intake Questions (owner input needed)

Single list of the unanswered intake questions that were previously scattered
across `AGENTS.md`, `docs/context/product.md` and `docs/context/stack.md`.
Each one is an owner decision: agents must not answer it by guessing, write an
ADR that assumes an answer, or plan work that depends on it. When the owner
answers, record the answer in an ADR under `docs/decisions/` and tick the box
here with a link to that ADR.

| # | Question | Why it needs the owner | What it unblocks once answered |
|---|----------|------------------------|--------------------------------|
| 1 | [ ] What is the cadence for adding or updating products in the showcase? | Product roadmap / release policy | A plan for how product entries are added and reviewed; whether a changelog or roadmap page is worth building |
| 2 | [ ] Are there performance or SEO goals we should track (Lighthouse/Core Web Vitals budgets, target keywords, indexing)? | Business goals and measurement targets | Adding a performance budget or SEO check to CI; any ADR on image handling or metadata beyond the current static export |
| 3 | [ ] Should this repository maintain design-system documentation for shadcn/ui usage? | Documentation scope and maintenance cost for a small team | A `docs/features/` or `docs/architecture/` design-system page; conventions for new components |
| 4 | [ ] Should we implement image optimization despite the static export (e.g. a custom loader or build-time optimization)? | Trade-off between build complexity and page weight; may need a dependency (Tier 2) | An ADR on image handling; follow-up on question 2 |
| 5 | [ ] Are analytics, monitoring or error-tracking integrations planned, and are there conversion goals to instrument? | Privacy posture, third-party scripts and cost | Any analytics/monitoring ADR; consent handling if required |
| 6 | [ ] Should the website support multiple languages (i18n)? Some products target German-speaking users. | Product scope and content ownership | An i18n ADR and routing/content plan |
| 7 | [ ] Should product detail pages add a public roadmap or changelog beyond category-based discovery? | Product scope | A feature spec for product pages; depends on question 1 |

## How to use this file

- Reference a question by number in ADRs, plans and board posts (e.g. "blocked on open question 2").
- Do not duplicate these questions elsewhere; link here instead.
- Keep questions that agents can answer from the repository out of this list — they belong in
  `docs/memory/` as findings.
