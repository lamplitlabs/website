#!/bin/sh
# Daily verification for lamplitlabs: lint, typecheck, build + smoke tests.
# Exit 0 = green. Run from the repository root by the pulse schedule daemon.
set -eu
cd "$(dirname "$0")/.."
# Honour the pinned toolchain (ADR-026) when mise is available and not already active.
if [ -z "${MISE_SHELL:-}" ] && command -v mise >/dev/null 2>&1 && [ -z "${VERIFY_IN_MISE:-}" ]; then
  VERIFY_IN_MISE=1 exec mise exec node@20.20.2 npm@10.9.9 -- sh "$0" "$@"
fi
# A bare or partial node_modules (no next binary) means deps are not installed.
if [ ! -x node_modules/.bin/next ]; then
  echo "verify: node_modules/.bin/next missing; running npm ci" >&2
  if ! npm ci --no-audit --no-fund; then
    echo "verify: npm ci failed (node $(node -v 2>/dev/null || echo unknown), npm $(npm -v 2>/dev/null || echo unknown)); cannot run checks" >&2
    exit 1
  fi
  # Re-check: a partial install (e.g. interrupted extraction, optional-dep
  # failure, or a node_modules without .bin links) would otherwise surface
  # later as a bare "sh: next: command not found" from npm run lint.
  if [ ! -x node_modules/.bin/next ]; then
    echo "verify: npm ci did not install the next binary (node_modules/.bin/next still missing after npm ci; node $(node -v 2>/dev/null || echo unknown), npm $(npm -v 2>/dev/null || echo unknown), lockfile $(ls package-lock.json 2>/dev/null || echo absent)); remove node_modules and retry" >&2
    exit 1
  fi
fi
exec npm run check
