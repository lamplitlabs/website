# Queue Rules (planning-time filters for suggestion cards)

Standing rules the planner and voters apply to queue/ballot cards before a job
is created from them. They exist so a hard stop is discovered once, at
planning time, instead of by every worker that picks up a card pointing at it.

## Rule 1: repeated `blocked:` on a guard + no-ADR gate marks the gate `needs-owner-ADR`

Some tests are deliberate guards for a product-surface decision the owner has
not made yet. They fail (or make a worker stop) until an ADR exists in
`docs/decisions/`, which agents may not write. Examples at HEAD:

| Gate | Guard | ADR the guard expects | Typical `result` string |
|------|-------|-----------------------|-------------------------|
| Rendering `trackingDoc` in any UI file | `tests/site-data.test.mjs` ("no UI file ... renders trackingDoc unless an ADR ... covers it") | `docs/decisions/render-tracking-doc-in-ui.md` (or any ADR mentioning trackingDoc) | `blocked: ... trackingDoc ...` |
| Changing `package-lock.json` / dependencies | AGENTS.md Tier 2 rule ("never change a lockfile") | a dependency ADR | `blocked: ... package-lock ...` |

**Rule.** Once **two distinct jobs** record a `result` of `blocked:` naming the
same guard + no-ADR gate (same test or rule, same missing ADR), that gate is
**`needs-owner-ADR`**:

1. Add (or update) its row in the table above and add an entry to
   `docs/context/open-questions.md` if none covers the decision yet.
2. Any queue or ballot card whose File/Variable would trip that gate is
   **suppressed from planning** until the ADR lands on the default branch. The
   planner checks "does the expected ADR file exist on main?"; voters vote such
   cards down with the reason `needs-owner-ADR: <gate>` instead of up.
3. A worker who still receives such a card stops immediately with
   `SUMMARY: blocked: needs-owner-ADR <gate>` and a `QUESTION:` line for the
   owner; it does not re-investigate the guard, write a workaround, or weaken
   the test.
4. When the ADR lands, delete the row and the suppression ends; the cards may
   be re-proposed.

**Why two, not three.** The signal jobs (`job-20261005T044632Z-ca4263`,
`job-20261005T044632Z-51136d`, `job-20261002T155654Z-9a6c24`) show the second
repeat already carried no new information; a third run only costs a worker slot.

**Measure.** The share of `result` strings in `pulse jobs --all --json`
matching `blocked:.*trackingDoc` or `blocked:.*package-lock` should fall week
over week once this rule is applied.
