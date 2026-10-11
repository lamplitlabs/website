#!/bin/sh
# Project verify script for pulse schedule checks (ADR-026 recipe check).
# Delegates to the project's own `npm run check` (lint + typecheck + npm test,
# the latter running `next build && node --test` across tests/*.test.mjs,
# 118+ assertions including the ai.lamplitlabs.com routing guards).
set -e
npm run check
