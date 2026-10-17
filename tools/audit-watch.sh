#!/bin/sh
# Prints only when `npm audit --omit=dev` reports vulnerabilities, so the
# project does not need a human to periodically remember to look. Silent
# when the dependency tree is clean (keeps the watcher's output quiet-by-
# default per ADR conventions).
#
# Re-alert suppression: the set of advisory IDs (GHSA/CVE URLs) is hashed and
# stored in a machine-local state file. When the set is unchanged from the
# last run the script stays silent, so a known Tier 2 blocker (lockfile change
# needed) does not spawn a no-op Tier 1 job on every schedule tick. A new,
# removed or changed advisory alerts again, and the alert names which advisory
# ids were added/removed since the last run (so the Tier 2 plan update does not
# need a manual `npm audit` re-run). The state lives outside the clone (clones
# are throwaway) under $XDG_STATE_HOME, overridable with
# AUDIT_WATCH_STATE=<file>; AUDIT_WATCH_FORCE=1 prints regardless of the hash.
# State file format: line 1 = hash, following lines = sorted "pkg:advisory" ids.
set -eu
cd "$(dirname "$0")/.."

state_file="${AUDIT_WATCH_STATE:-${XDG_STATE_HOME:-$HOME/.local/state}/lamplitlabs/audit-watch.hash}"

out="$(npm audit --omit=dev --json 2>/dev/null || true)"
# One line: "<total>|<per-severity breakdown>|<fixAvailable summary>|<advisory hash>"
# so the watch job can tell Tier 1 (nothing to do) from Tier 2 (a lockfile
# change would fix it) without re-running the audit by hand.
summary="$(printf '%s' "$out" | node -e '
let d="";
process.stdin.on("data", c => d += c);
process.stdin.on("end", () => {
  try {
    const j = JSON.parse(d || "{}");
    const meta = (j.metadata && j.metadata.vulnerabilities) || {};
    const order = ["critical", "high", "moderate", "low", "info"];
    const total = order.reduce((a, k) => a + (meta[k] || 0), 0);
    const breakdown = order.filter(k => meta[k] > 0).map(k => `${meta[k]} ${k}`).join(", ");
    const vulns = Object.values(j.vulnerabilities || {});
    const fixable = vulns.filter(v => v.fixAvailable).length;
    const major = vulns.filter(v => v.fixAvailable && v.fixAvailable.isSemVerMajor).length;
    let fix;
    if (vulns.length === 0) fix = "fixAvailable: unknown";
    else if (fixable === 0) fix = "fixAvailable: none (no lockfile change helps; Tier 1 = nothing to do)";
    else fix = `fixAvailable: ${fixable}/${vulns.length} packages` + (major ? ` (${major} need a semver-major bump)` : "") + " (lockfile change = Tier 2)";
    // Advisory identity: the set of advisory URLs (GHSA ids) plus the
    // affected package name, sorted so ordering changes do not re-alert.
    const ids = new Set();
    for (const v of vulns) {
      for (const via of v.via || []) {
        if (via && typeof via === "object") ids.add(`${v.name}:${via.url || via.source || via.title}`);
      }
    }
    const sorted = [...ids].sort();
    const hash = total === 0 ? "" : require("crypto").createHash("sha256").update(sorted.join("\n")).digest("hex");
    // ids are space-separated (no spaces occur in pkg names or advisory URLs).
    console.log(`${total}|${breakdown}|${fix}|${hash}|${sorted.join(" ")}`);
  } catch (e) {
    console.log("0|||");
  }
});
')"
total="${summary%%|*}"
rest="${summary#*|}"
breakdown="${rest%%|*}"
rest="${rest#*|}"
fix="${rest%%|*}"
rest="${rest#*|}"
hash="${rest%%|*}"
ids="${rest#*|}"

if [ "${total:-0}" -gt 0 ]; then
  previous=""
  previous_ids=""
  if [ -r "$state_file" ]; then
    previous="$(head -n 1 "$state_file")"
    previous_ids="$(tail -n +2 "$state_file")"
  fi
  if [ "${AUDIT_WATCH_FORCE:-0}" != "1" ] && [ -n "$hash" ] && [ "$hash" = "$previous" ]; then
    exit 0 # same advisory set as last run: already alerted, stay quiet
  fi
  # Diff of advisory ids against the last alert, so the output names exactly
  # which GHSA triggered it. No prior state => every id is "added".
  current_ids="$(printf '%s' "$ids" | tr ' ' '\n' | sed '/^$/d')"
  tmpdir="$(mktemp -d 2>/dev/null || echo "${TMPDIR:-/tmp}/audit-watch.$$")"
  mkdir -p "$tmpdir"
  printf '%s\n' "$current_ids" > "$tmpdir/cur"
  printf '%s\n' "$previous_ids" | sed '/^$/d' > "$tmpdir/prev"
  added="$(grep -vxF -f "$tmpdir/prev" "$tmpdir/cur" | tr '\n' ' ' | sed 's/ $//')"
  removed="$(grep -vxF -f "$tmpdir/cur" "$tmpdir/prev" | tr '\n' ' ' | sed 's/ $//')"
  rm -rf "$tmpdir"
  mkdir -p "$(dirname "$state_file")" 2>/dev/null \
    && { printf '%s\n' "$hash"; printf '%s\n' "$current_ids"; } > "$state_file" 2>/dev/null || true
  diff=""
  [ -n "$added" ] && diff="$diff; added: $added"
  [ -n "$removed" ] && diff="$diff; removed: $removed"
  [ -z "$diff" ] && diff="; advisory set unchanged (forced)"
  echo "npm audit (--omit=dev): $total vulnerabilities reported ($breakdown); $fix$diff — run \`npm audit --omit=dev\` for detail."
elif [ -f "$state_file" ]; then
  rm -f "$state_file" 2>/dev/null || true # clean again: next finding alerts
fi
