#!/bin/sh
# Prints only when `npm audit --omit=dev` reports vulnerabilities, so the
# project does not need a human to periodically remember to look. Silent
# when the dependency tree is clean (keeps the watcher's output quiet-by-
# default per ADR conventions).
set -eu
cd "$(dirname "$0")/.."

out="$(npm audit --omit=dev --json 2>/dev/null || true)"
# One line: "<total>|<per-severity breakdown>|<fixAvailable summary>" so the
# watch job can tell Tier 1 (nothing to do) from Tier 2 (a lockfile change
# would fix it) without re-running the audit by hand.
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
    console.log(`${total}|${breakdown}|${fix}`);
  } catch (e) {
    console.log("0||");
  }
});
')"
total="${summary%%|*}"
rest="${summary#*|}"
breakdown="${rest%%|*}"
fix="${rest#*|}"

if [ "${total:-0}" -gt 0 ]; then
  echo "npm audit (--omit=dev): $total vulnerabilities reported ($breakdown); $fix — run \`npm audit --omit=dev\` for detail."
fi
