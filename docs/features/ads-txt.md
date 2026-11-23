# Feature: AdSense Authorized Seller Declaration

**ID:** FEAT-001
**Date:** 2026-08-27
**Status:** Shipped
**Owner:** Lamplit Labs

## Overview

Publish the Google AdSense authorized seller declaration at `/ads.txt` for the website deployment. Both `bitesinbyte.com` and `lamplitlabs.com` resolve through the same canonical deployment, so they must return the same declaration.

## Requirements

### Functional Requirements

- Serve `/ads.txt` as a static text file.
- Include the Google publisher account `pub-2889277787752693` as a direct seller.
- Make the declaration reachable through both the Bites in Byte and Lamplit Labs domains.

### Non-Functional Requirements

- Preserve the existing static-export deployment.
- End the file with a newline and use the standard four-field ads.txt record format.

## Acceptance Criteria

- [x] The static export contains `ads.txt` at its root.
- [x] The file contains `google.com, pub-2889277787752693, DIRECT, f08c47fec0942fa0`.
- [x] Requests through either production domain resolve to the same declaration after deployment.

## Implementation Notes

- Place the file at `public/ads.txt`; Next.js copies public assets to the root of the static export.
- Verify the generated `out/ads.txt` content during the production build.

## Rollback Plan

Remove `public/ads.txt` and redeploy the previous static export.

## Success Metrics

- Google AdSense detects a valid ads.txt declaration for both domains.
