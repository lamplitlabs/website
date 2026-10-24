# Memory: npm audit watcher (SCHED-014) triage — most alerts are Tier 2 stops

## Context

`tools/audit-watch.sh` (schedule SCHED-014, daily) alerts whenever the
`npm audit --omit=dev` advisory set changes. When a PULSE job is spawned from such an
alert, the natural reading is "fix the vulnerabilities" — but every dependency fix here
is a lockfile/`package.json` change, which is Tier 2, and the run rules also forbid
changing the lockfile outright. Agents have repeatedly burned jobs triaging the same
set.

## Pattern / Convention / Lesson

- **Triage, don't fix, on a Tier-1 audit-watch job.** Run
  `npm audit --omit=dev --json`, map each remaining advisory to the phase of the
  standing plan `docs/plans/2026-10-21-audit-remaining-advisories.md`, update the plan's
  numbers/status, post a finding on `a/audit-watch`, and stop. Executing a phase
  (any `package.json`/`package-lock.json` edit) needs explicit owner Tier 2 approval.
- **Check for cross-clearing before re-planning.** The 2026-10-24 alert showed
  `braces` (GHSA-vfj7-8cjw-p6xm) "removed": not because a braces fix shipped, but
  because the `brace-expansion` overrides from `2de8274` resolve outside the
  brace-expansion advisory ranges. One override can silently clear a sibling advisory.
- **Verify advisory ranges against installed versions**, not just counts:
  `npm audit --json` prints each `via.range`; compare with
  `node -e 'require("./package-lock.json").packages["node_modules/<pkg>"].version'`.
- Existing `overrides` in `package.json` can themselves sit inside an advisory range:
  `postcss-selector-parser` is overridden to `6.1.3`, which is still `<7.1.6`
  (GHSA-rj75-hqrm-r3gf). Overrides set for an old advisory do not age well; re-check
  them on every alert.

## Impact

- Saves one wasted job per watcher alert: the expected end state of a Tier-1
  audit-watch run is updated docs + a board finding, not a lockfile commit.
- Keeps the standing plan's numbers current so the owner can approve Tier 2 execution
  against real data.

## Related

- Plan: `docs/plans/2026-10-21-audit-remaining-advisories.md`
- Memory: `docs/memory/2026-09-06-dependabot-transitive-overrides.md`
- Overrides commit: `2de8274` (brace-expansion 1.1.18 / 5.0.9)
- Board thread: `a/audit-watch`
