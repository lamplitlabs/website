# Memory: Naming follows existing artefacts

**Date:** 2026-09-10  
**Type:** Lesson  
**Scope:** Product naming / Catalog / AI product line

## Summary

When naming an internal project, look first for names the owner already enforces in code, public repositories, and site copy, then stay in that family unless there is a clear conflict.

## Context

The internal `Project-light` / `copilot-distill` work needed a public name for the Lamplit Labs homepage. The source project already used the `light-<purpose>-<version>` model naming convention, had a public German-tutor repository named `licht`, and branded the sibling AI site as "Lamplit Labs AI" with the tagline "AI that runs where you are." Choosing "Lamplit Light" preserved those artifacts while making the name company-owned and less likely to be confused with a light/dark theme.

## Details

### For Lessons & Anti-patterns:

- Treat enforced identifiers, repository names, product URLs, model naming schemes, and live taglines as naming evidence.
- Prefer names that reduce source-repo and marketing churn over names that only fit the metaphor.
- Record rejected alternatives and the reason for rejection so a later rename does not restart the full discussion.
- Keep the first public name centralized in catalog data when possible; here, `lib/site-data.ts` makes a later product-line rename a one-line product-name edit.
- Avoid names that are only category labels. "Lamplit AI" describes a division or subject area, while "Lamplit Light" names a product family.

## Examples

```text
Good: Lamplit Light
- Keeps the enforced light-* model family.
- Echoes the existing licht repository.
- Adds the company prefix for public distinctiveness.

Avoid: Lumen, Candela, Filament
- Nice lamp metaphors, but disconnected from existing artifacts.

Avoid: Lantern
- Good portability metaphor, but collides with the Lantern VPN brand.
```

## Related Patterns

- [Decision: Lamplit Light Name and Homepage AI Section](../decisions/2026-09-10-lamplit-light-name-and-homepage-ai-section.md)
- [Feature: Lamplit Light AI Section](../features/lamplit-light-ai-section.md)

## Impact

- Developers naming new product lines should search the source repository and public artifacts before proposing fresh metaphors.
- Code review for naming changes should ask whether the chosen name preserves or intentionally retires existing enforced identifiers.
