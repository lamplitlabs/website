# Queue Rules (planning-time filters for suggestion cards)

Standing rules the planner and voters apply to queue/ballot cards before a job
is created from them. They exist so a hard stop is discovered once, at
planning time, instead of by every worker that picks up a card pointing at it.

## Rule 1: repeated `blocked:` on a guard + no-ADR gate marks the gate `needs-owner-ADR`

Some tests are deliberate guards for a product-surface decision the owner has
not made yet. They fail (or make a worker stop) until an ADR exists in
`docs/decisions/`, which agents may not write. Examples at HEAD:

| Gate                                        | Guard                                                                                         | ADR the guard expects                                                             | Typical `result` string         |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------- |
| Rendering `trackingDoc` in any UI file      | `tests/site-data.test.mjs` ("no UI file ... renders trackingDoc unless an ADR ... covers it") | `docs/decisions/render-tracking-doc-in-ui.md` (or any ADR mentioning trackingDoc) | `blocked: ... trackingDoc ...`  |
| Changing `package-lock.json` / dependencies | AGENTS.md Tier 2 rule ("never change a lockfile")                                             | a dependency ADR                                                                  | `blocked: ... package-lock ...` |

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

## Rule 2: a card is closed once the commit that satisfies it is on the default branch

An improve job that finds its variable already moved ends with a `result`
starting `no change` / `already landed` / `already done`, names the commit,
and lands nothing. Seven such jobs in one week
(`job-20261004T054244Z-a5bd2f` -> d7cc91b, `job-20261008T062018Z-343f02` ->
056011b, `job-20261005T150917Z-df4ec2` -> 0d2cd4b,
`job-20261006T084816Z-51d2e1` -> 0818fce, `job-20261006T154556Z-9f2d96` ->
8860c24, `job-20261009T105226Z-2c5e52` -> 7090692,
`job-20261005T174648Z-b9b203` -> 37c18bd) each cost a worker slot and
contributed to the landings-per-worker-hour fall (4.97 -> 1.90 in the evolve
report). The card stayed open because voting outran landing: the suggestion
was raised, a parallel job landed it, and the ballot still planned it.

**Rule.** A queue or ballot card is **satisfied-by-landing** and is closed,
not planned, as soon as any of these holds on the default branch:

1. A commit message, or a `result` string of a finished job, names the card's
   post id (`Implement suggestion <id>` / `closes <id>`).
2. The card's `File:` at HEAD already contains the `Variable:` it asks for
   (the planner greps the named file for the variable's identifier - a
   function, prop, test name or config key - before spawning the job).
3. The card's `Signal:` is a `check:NAME` that already passes at HEAD.

**Who does what.**

- _Planner (before spawning):_ run the three checks above; on a hit, resolve
  the card's thread with `pulse thread resolve --summary "already landed via
<sha>"` and skip it. No job is created.
- _Worker who lands a change:_ name the card id in the commit subject or
  body (`Implement suggestion <id>: ...`), so check 1 fires for every other
  card pointing at the same File+Variable.
- _Worker who still receives a satisfied card:_ stop at the "look at the
  default branch first" step with `SUMMARY: already landed via <sha>`; run no
  checks, post no handoff, and vote `down` on sibling cards with the reason
  `already landed via <sha>` so quorum closes them.
- _Voter:_ before voting `up`, `git log --oneline -20 -- <File>` and vote
  `down` with `already landed via <sha>` when the variable is there.

**Measure.** Count of `result` strings in `pulse jobs --all --json` matching
`^(no change|already (landed|done))` per week should fall from 7+ toward 0,
and `pulse evolve` landings-per-worker-hour should stop falling.
