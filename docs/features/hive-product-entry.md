# Feature: Hive Product Entry and Cover

**ID:** FEAT-006
**Date:** 2026-11-27
**Status:** Proposed (branch for review)
**Owner:** Lamplit Labs
**Tier:** 1 - catalog data, one static cover, the site-wide product list
**Request:** owner, hub session `chat-20261127T041609-47f141`: "Hivefleet.dev needs to be added in
the lamplitlabs as a project", then "the name is Hive but the website is hivefleet".
**Starting commit:** `603a679`

## Who It Serves

Developers who visit lamplitlabs.com and want coding agents to work on their own repositories.
They find Hive, Lamplit Labs' open-source agent harness, among the developer tools, read what it
does, and leave for its own site to install it.

## Naming

The product is **Hive**. Its website is <https://hivefleet.dev>. "Hivefleet" is the domain only
and is never used as the product's name: the slug is `hive`, the page is `/products/hive`, and
every piece of copy says "Hive". The domain is named once in the long description, so a visitor
who types "hivefleet" into the product search still finds Hive.

## Scope

1. **Catalog entry** in [`lib/site-data.ts`](../../lib/site-data.ts): a `products` entry with slug
   `hive`, placed directly after `developer-tools` (its category, ahead of the entries that are
   not featured). Status `"Live"` since `2026-11`, category `Developer Tools`, `featured: true`,
   `url: "https://hivefleet.dev"`, `operatingSystem: "macOS, Linux"`.
2. **Cover** at [`public/covers/hive.svg`](../../public/covers/hive.svg): 800×400 like the other
   covers, in Hive's own colours (navy `#0c1530` to `#060a14`, the mint-cyan-violet mark from
   `hivefleet.dev/icon.svg`), with the name and the domain. The mark and the caption sit between
   rows 104 and 290, the band every card size still shows after it crops the cover.
3. **Site-wide product list** in [`app/layout.tsx`](../../app/layout.tsx): the description that
   names every product, the keywords, and the Open Graph and Twitter descriptions name Hive, as
   they name Eszett. The Organization and WebSite JSON-LD descriptions stay as they are.
4. **Docs that mirror the catalog:** a row in [`README.md`](../../README.md) (required by the
   README/site-data drift test) and in [`docs/context/product.md`](../context/product.md).
5. **Tests** for the entry, its search words and its exported page.

## Choices and the Evidence for Them

Checked on 2026-11-27.

| Choice | Value | Why |
|--------|-------|-----|
| Status | `Live`, since `2026-11` | `hivefleet.dev` answers 200 with an install command, `hivefleet.dev/install.sh` answers 200, and `github.com/lamplitlabs/hive` is public (MIT, created 2026-11-23, release `v0.1.10` on 2026-11-26). |
| Category | `Developer Tools` | It is a tool developers install and run. No new category: `AI` is the Lamplit Light lab. The tag `AI Agents` keeps it findable by "ai". |
| Featured | yes | It is a main product, not a small utility. It is the seventh featured card, so in the full grid at desktop width it shares a row with the plain EDMX Tools card, which is stretched to the same height (an empty band of 121px above its footer; the Developer Tools filter already shows such a row today, with 96px). Removing `featured: true` gives four plain cards in two even rows instead. |
| Platform | `operatingSystem: "macOS, Linux"` | Hive is a binary, not a web app, so the JSON-LD default `"Web"` would be wrong (same rule as Eszett, see [its spec](eszett-product-entry.md)). Windows runs it inside WSL, which is Linux. |
| Copy | adapted from `hivefleet.dev` | The product site's own wording, so the two never disagree. It follows [outcomes, not method](../memory/2026-09-11-public-copy-describes-outcomes-not-method.md). |

Two words stay out of the searchable copy (name, title, description, tags, long description,
highlights): "queue" and "true". `tests/product-search.test.mjs` requires that searching them finds
nothing in the catalogue.

## Out of Scope

- No `schema` block (structured-data features are an SEO choice, open question 2 in
  [`open-questions.md`](../context/open-questions.md)).
- No "Our Journey" milestone and no change to the hero or about copy: the owner asked for the
  product entry.
- No change to `app/not-found.tsx`. With a four-letter slug the existing near-miss rule offers
  Hive for a mistyped `/hire`, `/hide`, `/hike` or `/have` (checked with the page's own matcher;
  `/home`, `/help`, `/here`, `/live` and `/five` get no suggestion). It is only a "did you mean"
  line on a page that is already a 404.
- No change to `lib/product-search.ts`. One slip of "agents", the typo "agets", lists Lamplit
  Light and not Hive, because the search also matches copy with its spaces removed and
  "langu**age t**utor" holds "aget". The other five one-letter slips of Hive's tag words find it.
  Filed as `TASK-159` together with the fixture scales (see the memory note below).

## Verification (2026-11-27)

- `npm run check`: lint and typecheck clean, 18 pages exported, 159 of 159 tests pass as of
  2026-11-27 (3 of them new: one each in `tests/site-data.test.mjs`,
  `tests/product-search.test.mjs` and `tests/routes.test.mjs`).
- The three new tests were run against six deliberate mistakes in a throwaway copy (name changed
  to Hivefleet, long description says Hivefleet, `url` changed, `operatingSystem` removed, the word
  "queue" added, the domain removed from the copy). Each mistake failed at least one of them.
- The 13 behaviour scorers, main `603a679` against this tree: none fell. Six rose above their
  registered scale because they count over the catalogue (`TASK-159`).
- Before and after pictures at 1440×900 and 390×844, dark and light, are in the session's report.
  They were checked by measuring boxes and contrast, not by eye.
- No dependency, deployment, analytics or consent change.

## Acceptance Criteria

- [ ] The homepage product grid lists Hive under All and Developer Tools, marked Featured and
      Live, with its cover; "Visit site" opens `https://hivefleet.dev` in a new tab.
- [ ] `/products/hive` is exported with the Hive cover, the long description and four key
      features; "Get started" and "Visit Hive" open `https://hivefleet.dev`.
- [ ] The exported page's JSON-LD for Hive says `"operatingSystem":"macOS, Linux"` and
      `"url":"https://hivefleet.dev"`.
- [ ] Searching "hive", "hivefleet", "agent harness", "coding agents" or "open source" in the
      product search lists Hive; "true" and "queue" still find nothing.
- [ ] No copy calls the product "Hivefleet".
- [ ] `npm run check` passes.

## Rollback Plan

Revert the change-set commit with `git revert`. The catalog entry and `public/covers/hive.svg`
go together, and the card, `/products/hive`, its sitemap entry and its JSON-LD disappear with the
entry. The `app/layout.tsx`, `README.md` and `docs/context/product.md` lines are part of the same
commit. Nothing else depends on the entry. Do not reset the branch or revert unrelated work.

## Related

- [Eszett product entry](eszett-product-entry.md): the previous product addition.
- [Adding a product touches more than the catalog](../memory/2026-11-27-product-addition-checklist.md)
