# Feature: Light-Theme Contrast and Product Nav at Phone Width

**Date:** 2026-11-08
**Status:** Implemented (awaiting review)
**Owner:** Lamplit Labs
**Tier:** 1 - existing-style repair (colour tokens and utility classes only)
**Task:** TASK-084 part 2 (UI polish audit)
**Job:** `job-20261108T021233Z-0937af`

## Overview

A polish audit of the home page and the product pages, at 1440x900 and
390x844 in light and dark, found three defects. Dark mode had none. The audit
measured WCAG 2.x contrast of every visible text node against its solid
backgrounds and checked horizontal overflow and wrapping:

1. **Light-theme tokens outside the home page.** The accessible light-theme
   amber (`--primary: 30 82% 35%`) and muted text (`--muted-foreground: 30 8% 42%`)
   were scoped to `.immersive-home`. Product, privacy and 404 pages fell back
   to `36 80% 50%` / `30 8% 46%`. Measured on `/products/edmx-tools`
   (light): the "Visit EDMX Tools" CTA (white on amber) 2.39:1, the
   "Status: Live" pill 2.20:1, "since 2026-03" 1.88:1, tags 4.42:1 (AA needs
   4.5:1).
2. **Faded small labels.** 11px uppercase mono labels were dimmed again with
   opacity modifiers (`text-muted-foreground/60`, `/70`, `text-primary/80`).
   Home (light): the hero trust line "built in Germany · used worldwide ·
   free where possible" 2.84:1, the contact note 2.84:1, the footer domain
   line 2.39:1, the footer "soon" badge 3.56:1, "bitesinbyte" 2.79:1.
3. **Product nav wraps at 390px.** On an in-development product page
   (`/products/light`) the "In development" note broke onto two lines, and
   the "Follow development" CTA wrapped and grew the nav button to 56px.

## User Story

**As a** visitor reading the site on a bright screen or a phone
**I want to** read every label and button without straining
**So that** the site reads as a professional company site and the product
calls to action are legible.

## Requirements

- The light-theme `--primary`, `--ring` and `--muted-foreground` values that
  the home page already uses become the `:root` defaults, so every page shares
  them. Dark-theme values do not change.
- Informational small labels use the full `text-muted-foreground` /
  `text-primary` colour, without an opacity modifier. Purely decorative
  separators (`·`, `/`) are `aria-hidden` and may stay dimmed.
- The product-page nav note and CTA do not wrap at 390px (`whitespace-nowrap`,
  tighter gap and padding below `sm`). The note stays visible at every
  viewport (see the guard in `tests/routes.test.mjs`).

## Acceptance Criteria

- [x] On `/` and `/products/*` in light and dark, no visible non-decorative
      text measures below 4.5:1 (or below 3:1 for large text) against its
      solid background.
- [x] At 390x844 the `/products/light` nav is a single 56px row and the CTA
      is one line.
- [x] `npm run check` passes, including a source test that pins the light
      tokens to `:root`.

## Rollback

Revert the commit: it touches only `app/globals.css`, class strings in
`components/home/*`, `app/products/[slug]/page.tsx`, one test and this doc.
