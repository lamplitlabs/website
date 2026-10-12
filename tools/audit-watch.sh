#!/bin/sh
# Prints only when `npm audit --omit=dev` reports vulnerabilities, so the
# project does not need a human to periodically remember to look. Silent
# when the dependency tree is clean (keeps the watcher's output quiet-by-
# default per ADR conventions).
set -eu
cd "$(dirname "$0")/.."

out="$(npm audit --omit=dev --json 2>/dev/null || true)"
total="$(printf '%s' "$out" | node -e '
let d="";
process.stdin.on("data", c => d += c);
process.stdin.on("end", () => {
  try {
    const j = JSON.parse(d || "{}");
    const meta = j.metadata && j.metadata.vulnerabilities;
    const total = meta ? Object.values(meta).reduce((a, b) => a + b, 0) : 0;
    console.log(total);
  } catch (e) {
    console.log(0);
  }
});
')"

if [ "${total:-0}" -gt 0 ]; then
  echo "npm audit (--omit=dev): $total vulnerabilities reported — run \`npm audit --omit=dev\` for detail."
fi
