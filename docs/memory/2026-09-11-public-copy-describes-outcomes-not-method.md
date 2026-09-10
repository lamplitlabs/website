# Memory: Public product copy describes outcomes, not method

**Date:** 2026-09-11  
**Type:** Convention  
**Scope:** Catalog copy / Homepage sections / Cover art / Metadata

## Summary

Public-facing copy for a Lamplit Labs product describes what the product is and does for the buyer. How it is built internally (training method, pipeline internals, tooling names) stays in the source repository and the PULSE docs unless it is itself the selling point.

## Context

The first Lamplit Light copy explained the training method: large teacher models distilled into small student models. The owner did not consider that a good view for buyers. The method is an implementation detail of the source project (`copilot-distill`); the buyer-relevant facts are that each model is small, does one job, is grounded in verified knowledge, is measured against release gates and a judge panel before release, and runs on hardware they control.

## Details

### For Conventions:

- Lead with outcomes and guarantees (small, one job per model, verified knowledge, measured before release, your data never leaves).
- Keep method words (distil, teacher/student, the internal package name) out of the product entry, cover art, JSON-LD `featureList`, journey copy, metadata and homepage sections. The build story on the homepage names stages ("define, verify, train, measure, ship"), not techniques.
- Repeat the rule wherever copy lives so it survives refactors: `lib/site-data.ts`, `public/covers/*.svg`, `components/home/*`, and the feature spec.
- Homepage sections that explain a product should look like the product's own surface (here: a lab-console panel with mono labels, a rail and hairline columns), not like a generic marketing timeline of boxes.
- Guard the rule with an export check (no method words in the AI section, product page and cover) so a later copy edit cannot reintroduce them silently.

## Examples

```text
Good: "Small, specialised AI models you host yourself. One job per model."
Good: "Train a specialist - a small model is trained for exactly this job and nothing else."

Avoid: "Large teacher models are distilled into small student models."
Avoid: "Distil from a teacher" as a public pipeline stage.
```

## Related Patterns

- `docs/memory/2026-09-10-naming-follows-existing-artefacts.md` - naming the product line.
- `docs/features/lamplit-light-ai-section.md` - constraints and acceptance criteria that carry this rule.
- `docs/decisions/2026-09-10-lamplit-light-name-and-homepage-ai-section.md` - the decision that public copy describes outcomes.
