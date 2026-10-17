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
# removed or changed advisory alerts again. The state lives outside the clone
# (clones are throwaway) under $XDG_STATE_HOME, overridable with
# AUDIT_WATCH_STATE=<file>; AUDIT_WATCH_FORCE=1 prints regardless of the hash.
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
    const hash = total === 0 ? "" : require("crypto").createHash("sha256").update([...ids].sort().join("\n")).digest("hex");
    console.log(`${total}|${breakdown}|${fix}|${hash}`);
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
hash="${rest#*|}"

if [ "${total:-0}" -gt 0 ]; then
  previous=""
  [ -r "$state_file" ] && previous="$(cat "$state_file")"
  if [ "${AUDIT_WATCH_FORCE:-0}" != "1" ] && [ -n "$hash" ] && [ "$hash" = "$previous" ]; then
    exit 0 # same advisory set as last run: already alerted, stay quiet
  fi
  mkdir -p "$(dirname "$state_file")" 2>/dev/null && printf '%s\n' "$hash" > "$state_file" 2>/dev/null || true
  echo "npm audit (--omit=dev): $total vulnerabilities reported ($breakdown); $fix — run \`npm audit --omit=dev\` for detail."
elif [ -f "$state_file" ]; then
  rm -f "$state_file" 2>/dev/null || true # clean again: next finding alerts
fi
