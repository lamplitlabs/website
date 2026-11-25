# Decision: Lamplit Light Name and Homepage AI Section

**Date:** 2026-09-10  
**Status:** Accepted (owner asked for a name and a decision in autopilot; revisable)  
**Authors:** Lamplit Labs  
**Affects:** Homepage, catalog (`lib/site-data.ts`), navigation, SEO

## Problem

Lamplit Labs needs to modernize the homepage, make the company's AI work visible, and give the internal `Project-light` / `copilot-distill` project a public product-line name. The decision must preserve continuity with existing project artifacts, avoid over-claiming a not-yet-live AI domain, and keep the corporate website's static export, catalog-driven product pages, accessibility repairs, and deployment behavior intact.

## Options Considered: Name

### Option 1: Lamplit Light (chosen)

**Pros:**
- Preserves continuity with the source project's enforced `light-<purpose>-<version>` model naming convention, such as `light-german-tutor-v14`.
- Aligns with the public German-tutor repository name `licht`, German for "light".
- Matches the AI site's existing brand line, "Lamplit Labs AI", and tagline, "AI that runs where you are."
- Makes the product line company-owned, similar to "Meta Llama", while distinguishing it from generic light/dark theme language.
- Keeps future rename cost low because the name is centralized in `lib/site-data.ts`.

**Cons:**
- "Light" can be read as a visual theme term unless the company prefix is kept.
- The name still needs owner confirmation before long-lived external marketing or source-repo renames.

### Option 2: Light alone

**Pros:**
- Short and directly aligned with the enforced model prefix.
- Easy to pair with purpose-specific model names.

**Cons:**
- Too generic for a public product line.
- Collides more directly with light/dark theme vocabulary.
- Does not identify the company behind the work.

### Option 3: Lumen, Candela, or Filament

**Pros:**
- Strong lamp and illumination metaphors.
- More distinctive than "Light" in isolation.

**Cons:**
- Breaks continuity with the existing `light-*` model names and the `licht` repository.
- Requires more explanation and likely follow-up renaming in source artifacts.

### Option 4: Lantern

**Pros:**
- The portable-light metaphor fits "AI that runs where you are."
- Suggests local ownership and mobility.

**Cons:**
- Collides with the well-known Lantern VPN brand.
- Breaks continuity with the existing `light-*` and `licht` artifacts.

### Option 5: Lamplit AI

**Pros:**
- Immediately communicates that this is Lamplit Labs' AI work.
- Fits the AI site's broad brand language.

**Cons:**
- Names a category or division, not a product line.
- Leaves individual compact-model offerings without a durable family name.

## Options Considered: Homepage Incorporation

### Option A: Dedicated homepage section + catalog entry + nav link (chosen)

**Pros:**
- Gives the AI lab enough space to explain the five-stage build pipeline, runtimes, privacy posture, and the model family (one job per model).
- Keeps Lamplit Light discoverable in the product catalog and product detail route.
- Adds a direct `#ai` navigation target without replacing the existing Products, About, Journey, or Contact flows.
- Lets the product grid use categories for broader portfolio discovery.

**Cons:**
- Adds a new homepage section and interaction surface that must be maintained with existing accessibility behavior.
- Creates dead-link risk until `ai.lamplitlabs.com` DNS is pointed at the AI site's Vercel project.

### Option B: Catalog entry only

**Pros:**
- Smallest visible change and lowest layout risk.
- Reuses product detail and JSON-LD plumbing.

**Cons:**
- Does not satisfy the owner request to incorporate the company's AI side into the homepage.
- Provides too little room to explain sovereign AI, on-device runtimes, or the measured-release story.

### Option C: Replace the hero with the AI story

**Pros:**
- Makes Lamplit Light immediately prominent.
- Simplifies the page by avoiding another section.

**Cons:**
- Over-rotates the corporate homepage around one product line.
- Risks hiding Amistio and the broader practical-products portfolio.
- Makes the unresolved AI domain feel more live than it is.

### Option D: Link out only

**Pros:**
- Avoids duplicating AI-site content.
- Lowest implementation cost.

**Cons:**
- The target host does not resolve until the owner completes DNS.
- Adds almost no explanation for visitors and no durable catalog/SEO presence.

## Decision

We have decided to **name the product line Lamplit Light and incorporate it through a dedicated homepage AI section, catalog entry, and AI navigation link** because:

1. The name preserves the existing `light-*`, `licht`, and Lamplit Labs AI artifacts while making the family name clearly company-owned.
2. A dedicated section can explain the lab's compact-model workflow and sovereign runtime promise without replacing the broader Lamplit Labs homepage.
3. A catalog entry keeps product detail pages, JSON-LD, sitemap generation, and future renaming centralized in the existing site-data model.

Lamplit Light is documented as the AI lab of Lamplit Labs. It builds small, specialized models for defined jobs; grounds them in verified knowledge; measures them against deterministic offline release gates and an independent multi-model judge panel; and ships compact ONNX q8/q4 exports that run with transformers.js in the browser, on a laptop, on-prem, in a private cloud, inside an app, or on edge/IoT hardware. It is a family, not a single model: every release targets one clearly defined job and is named `light-<purpose>-<version>`, and the AI site lists each model's purpose, base model, size, licence, gate result and judge-panel verdict. The German tutor (`light-german-tutor-*`) is the first member of that family, so the homepage stays generic and leaves individual models to the AI site's catalog.

Public copy describes outcomes, not the training method. How the models are produced (the `copilot-distill` teacher/student pipeline) is an implementation detail of the source repository and is not a selling point for buyers, so the product entry, cover art, AI section, journey copy, metadata and JSON-LD do not mention distillation or teacher/student models. The homepage's "how a model is built" pipeline therefore has five stages: define the job, gather verified knowledge, train a specialist, measure, compress and ship.

## Consequences

**Positive:**
- The homepage now presents Lamplit Labs as both a practical-products company and an AI lab.
- The AI work gets a durable product-line name that follows existing artifacts instead of inventing a disconnected brand.
- Product discovery improves through category filtering without moving product data out of the catalog.
- The main site can link to the AI site and `/products/light` while preserving static export and catalog-derived metadata patterns.

**Negative:**
- Until the owner completes DNS, homepage outbound CTAs to `https://ai.lamplitlabs.com` and its subroutes can lead to an unresolved host.
- The new AI section, category filter, and visual refresh expand the homepage maintenance surface.
- The public name may still be revised by the owner; downstream source-repo renaming is intentionally left as a separate human step.

**Neutral:**
- The main site must follow the AI site's measurement discipline by not copying benchmark numbers; numbers belong on the AI site where they are generated from measurements.
- `Product.category` becomes required catalog data for every product.
- The new same-document `#ai` target participates in current-section tracking and navigation highlighting.

## Implementation Notes

- Add Lamplit Light once in `lib/site-data.ts`; the product detail page, JSON-LD, and catalog rendering derive from that entry.
- Keep Lamplit Light status as `In development` until the AI site is public, then change the status and schema publication state together.
- Add `AiSection` between `WhyLamplitSection` and `ProductsSection`.
- Link the Lamplit Labs Hugging Face organisation (`https://huggingface.co/lamplitlabs`) once in `socialLinks`; the shared social rows, the Organization JSON-LD `sameAs`, and the AI-section CTA read it from there. The org has no public models yet, so copy names it as the organisation's presence rather than a model catalog.
- Add category filter chips as native buttons with `aria-pressed`; JavaScript-disabled rendering should still show all products.
- Preserve existing accessibility repairs for product actions, hero scroll link, mobile menu state, mobile scroll lock, and `aria-current`.
- Add no dependencies and make no deployment, analytics, or consent changes.

## Follow-up

- [ ] Owner: point `ai.lamplitlabs.com` at the Vercel project for the AI site; until then, outbound CTAs on the homepage lead to an unresolved host.
- [ ] Owner: flip Lamplit Light `status` to `"Live"` and `schema.creativeWorkStatus` to `"Published"` once the site is public.
- [ ] Owner: confirm or change the name "Lamplit Light"; the product name lives in `lib/site-data.ts` for a one-line rename.
- [ ] Optional: rename the `Project-light` folder and `copilot-distill` package in the source repo to match the public product line.

## Inverse Edit / Rollback

Revert the change-set commit or commits with `git revert`; do not reset the branch or revert unrelated concurrent work. If only the Lamplit Light listing must be withdrawn, remove the `light` catalog object, its sitemap URL, and `public/covers/light.svg`; the product page and JSON-LD disappear with the catalog entry. If the AI section itself is withdrawn, also remove the `#ai` nav link, the `AiSection` render, and `ai` from current-section tracking.

## Related Documents

- [Feature: Lamplit Light AI Section](../features/lamplit-light-ai-section.md)
- [Product Context](../context/product.md)
- [Architecture Overview](../architecture/overview.md)

## References

- Public AI home planned at `https://ai.lamplitlabs.com`
- Project-light source facts supplied by the owner for this change set
