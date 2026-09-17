# Feature: Product Card Action Accessibility

**Date:** 2026-09-08
**Status:** Merged (landed to main)
**Owner:** Lamplit Labs
**Tier:** 0 - accessible-name polish of existing product-discovery links
**Worker starting commit:** `78809858a29b743e2e6cbc435845df469285dd2e`
**Job:** `job-20260908T194946Z-950678` (iris)

## Baseline

Before editing product code, an in-memory render of the actual
[`ProductGrid`](../../components/product-grid.tsx) and
[`OutboundLink`](../../components/outbound-link.tsx), using the actual
[`catalog`](../../lib/site-data.ts) and a reveal-hook stub with `visible: false`
matching its initial render state, captured nine linked cards and all 18 footer anchors.
Their only two distinct names are `Visit site` and `Learn more`, each followed
by the existing arrow. None has a product-qualified accessible name: **0/18**.
This makes the actions ambiguous in a link list outside their visual cards.
Full baseline anchor and card markup was captured outside the repository in
worker-session evidence.

Each row has those same two visible footer actions, in outbound/details order:

| Product name | Existing outbound destination | Existing details destination |
| --- | --- | --- |
| Amistio | `https://www.amistio.com` | `/products/amistio` |
| Kenntnistrainer | `https://www.kenntnistrainer.de` | `/products/kenntnistrainer` |
| Fachsprachprufung | `https://www.fachsprachtrainer.de` | `/products/fachsprachprufung` |
| Leben in Deutschland | `https://www.lebenindeutschland.org` | `/products/leben-in-deutschland` |
| Developer Tools | `https://tools.lamplitlabs.com` | `/products/developer-tools` |
| Resume Builder | `https://resume.lamplitlabs.com` | `/products/resume-builder` |
| EDMX Tools | `https://edmx.lamplitlabs.com` | `/products/edmx-tools` |
| Azure Draw.io Assets | `https://azure-assets.lamplitlabs.com` | `/products/azure-drawio-assets` |
| Azure Compliance Matrix | `https://azure-compliance.lamplitlabs.com` | `/products/azure-compliance-matrix` |

The catalog currently exercises the normal action phrases, not the
`In development` or `comingSoon` branches. Those require in-memory fixtures,
not catalog edits.

## Single-Variable Scope

Add only an `aria-label` to the existing footer `OutboundLink` and adjacent
internal details anchor of each non-`comingSoon` card. The name is the exact
existing action phrase, followed by a colon, a space, and `product.name`:

| Status branch | Outbound accessible name | Details accessible name |
| --- | --- | --- |
| Normal | `Visit site: ${product.name}` | `Learn more: ${product.name}` |
| In development | `Follow development: ${product.name}` | `Explore product: ${product.name}` |

The visible words remain contained in each name. Visible copy and arrows,
destinations, `target`/`rel`, tracking props, callbacks, the primary card anchor,
classes, hover behavior, and all card content remain unchanged. `comingSoon`
cards still expose no card/action links, even when their status is
`In development`. `OutboundLink` already forwards native anchor attributes;
its implementation must not change.

Only `components/product-grid.tsx` and this new feature note may change. Do
not change the catalog, dependencies/lockfiles, configuration/deployment,
metadata, tracking/analytics/consent/privacy logic, decisions, `.github/`, or
protected evolution files. This is the lead-authorized Tier 0 polish under
the away-owner brief, not a new feature, interaction, ADR, or evolution
experiment. Nothing is published, pushed, or merged by this job.

## Acceptance Criteria

- [x] The actual homepage export has all 18 exact product-qualified footer
  names and 18 distinct names: **0/18 -> 18/18**.
- [x] Each name contains the matching visible action phrase; there is no
  competing naming attribute, replacement role, or hidden/inert ancestor.
- [x] All existing destinations, visible words/arrows, primary anchors,
  `target`/`rel`, classes, styles, and card content are preserved. Removing
  only the two kinds of added attributes restores each corresponding
  baseline footer anchor and complete card byte-for-byte.
- [x] The actual component renders an in-memory `In development` fixture
  with its two alternative phrases plus the product name. In-memory
  `comingSoon` fixtures still expose no card/action links and retain their
  baseline content. Fixtures never mutate the catalog.
- [x] `npm run lint && npm run typecheck && npm run build` succeeds using
  installed dependencies only.
- [x] Source comparison permits exactly two added `aria-label` attributes.
  `OutboundLink` and its original tracking inputs/callback wiring remain
  unchanged; only the two allowed files enter the commit.

## Verification Method

Use installed TypeScript to transpile the actual TSX modules in memory and
installed React server rendering with Node assertions. Stub only `useReveal`
to avoid a browser observer; use the actual `OutboundLink` implementation and
catalog. Capture baseline footer anchors and complete cards before editing.
After the existing checks, parse the actual `out/index.html` using Python's
standard-library HTML parser and apply Node assertions to the resulting cards.
Compare every action name, distinct-name count, visible phrase/arrow,
destination, and naming attributes, then strip only the added labels and
compare each anchor and entire card with the captured baseline.

Render synthetic development and coming-soon inputs only in memory against
both the starting-revision and changed components. Compare actual outbound
element props, including `trackingTarget`, `trackingContext`, `trackingUrl`,
and callback presence. Use the TypeScript AST to remove precisely the two
added attributes and require the remaining source to equal the starting
revision. No testing dependencies or repository test fixtures are added.

Component/server-render and static-export evidence must be reported
separately from browser evidence. These markup assertions alone do not claim
a browser accessibility-tree, screen-reader, hover, or deployed result.

## Worker Evidence (2026-09-08)

The baseline, Tier 0 scope, acceptance criteria, and scoped rollback above
were documented before editing the component.

**Component evidence:** Node assertions on the actual TypeScript/React
modules confirmed nine linked cards, **18/18 exact product-qualified footer
names**, and **18 distinct names**, up from 0/18 and two distinct names.
Every original phrase and arrow remains unchanged. Removing only the added
labels restored all 18 footer anchors and all nine complete cards
byte-for-byte to the captured starting-revision render, including the
unchanged primary card anchors.

The in-memory `In development` fixture used the name
`Fixture & "Development"` and produced exactly
`Follow development: Fixture & "Development"` and
`Explore product: Fixture & "Development"`. Parsing confirmed the name
survives HTML escaping. Two in-memory `comingSoon` fixtures, one with no
status and one also marked `In development`, each exposed **zero links**.
Their complete card markup was identical to their starting-revision renders.
No synthetic product was written to the catalog or exported homepage.

**Static-export evidence:** Parsing the actual `out/index.html` confirmed
all nine catalog cards, 18 footer actions with their exact expected names,
and 18 distinct names. Each retained its corresponding visible phrase/arrow
and the destinations in the baseline table. No competing `aria-labelledby`
or `title`, replacement role, hidden/inert ancestor, or `aria-hidden="true"`
was present. The outbound links retained `target="_blank"` and
`rel="noopener noreferrer"`; internal links retained their original native
attributes. After removing only the added labels, all 18 anchors and all
nine complete exported cards matched the captured baseline render
byte-for-byte. The exported cards also exactly matched the changed component
render.

**Source and existing checks:** The TypeScript AST identified exactly two
new `aria-label` attributes, on `OutboundLink` and the adjacent details
anchor. Removing just those source attributes restored the exact starting
component. `OutboundLink` and the catalog were byte-for-byte unchanged, and
the only changed repository files were the component and this note. Actual
outbound element props retained `trackingTarget=product.slug`,
`trackingContext="product_grid_visit"`, `trackingUrl=product.url`, and the
original callback presence. The real `OutboundLink` still forwarded the
native label and retained its click-handler wiring; no click or analytics
event was invoked by these assertions.

`npm run lint && npm run typecheck && npm run build` passed with installed
dependencies: no ESLint warnings/errors, no TypeScript errors, and all 13
static pages generated. The worker used Node 22.18.0, npm 11.5.2,
TypeScript 5.9.3, React/React DOM 19.2.8, and Python 3.14.6's standard-library
HTML parser. No packages were installed and no lockfile changed.

**Browser evidence:** Not exercised. These are component/server-render and
actual static-export results, not browser accessibility-tree, screen-reader,
hover, or deployment evidence.

**Review and learning:** No meaningful correctness or scope finding remained.
Catalog-only renders cannot cover the development and coming-soon branches;
retain in-memory branch fixtures when revisiting these labels. Future action
copy changes must keep the corresponding accessible-name phrase in sync.
This job remains ordinary Tier 0 work with no evolution experiment.

## Scoped Rollback

Trigger rollback for incorrect names, changed destinations/content/tracking,
a `comingSoon` regression, or a failing existing check. Revert only this
job's commit with `git revert <job-commit>` and use the worker starting commit
above as the reference. Never reset the branch or revert unrelated work.

Repeat `npm run lint && npm run typecheck && npm run build`, the baseline
anchor/card comparison, and the development/coming-soon fixture assertions.
After rollback, require the original generic names and unchanged original
markup, destinations, tracking inputs, and no-link coming-soon behavior.
Restoring the documented 0/18 defect is rollback evidence, not a successful
accessibility repair.
