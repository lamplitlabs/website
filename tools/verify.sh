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
  npm ci --no-audit --no-fund
fi
exec npm run check
