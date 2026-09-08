# Product Context - Lamplit Labs Website

## Organization & Purpose

**Lamplit Labs** is a technology organization building practical tools that solve real problems. The website (formerly "Bites In Byte") serves as:
- Corporate homepage and brand
- Central hub linking to all products
- Showcase of current and upcoming product offerings
- Landing page for all Lamplit Labs properties

## Current Products

| Product | Purpose | Technology | Status |
|---------|---------|-----------|--------|
| **Amistio** | Visual AI agent builder with app connectors and approval gates | Next.js | Live |
| **Kenntnistrainer** | KI-gestützte medical exam prep (Germany) | Next.js | Live |
| **Fachsprachprüfung** | FSP simulation & training (Germany) | Next.js | Live |
| **Leben in Deutschland** | German citizenship test prep (310 questions) | Next.js | Live |
| **Resume Builder** | ATS-optimized resume creation | Next.js | Live |
| **Developer Tools** | JSON formatter, Base64, UUID, etc. | Next.js | Live |
| **EDMX Tools** | Tools for EDMX/OData metadata files | Next.js | Live |
| **Azure Draw.io Assets** | Searchable Azure service icons for Draw.io architecture diagrams | Not recorded | Live |
| **Azure Compliance Matrix** | Interactive compliance coverage matrix for Azure services | Not recorded | Live |

Product descriptions and availability follow the website catalog in [`lib/site-data.ts`](../../lib/site-data.ts). Each product lives in its own repository and deploys independently; technologies not documented here are marked "Not recorded".

## Users & Goals

**Primary Users:**
- Team members and developers maintaining products
- Prospective customers visiting the website
- Existing customers discovering other products

**Key Goals:**
- Maintain a professional, cohesive brand presence
- Drive traffic to individual product repositories
- Showcase organization capabilities and values
- Support company growth and visibility

## Product Outcomes (Verified)

1. **Brand presence** — Professional website representing Lamplit Labs
2. **Product discovery** — Links and marketing for all current products
3. **Deployment reliability** — Automatic deployment to Vercel, high uptime

## Known Constraints

- **Static export:** No server-side rendering (set in `next.config.js`)
- **Performance:** Must load quickly for all users (Vercel global CDN)
- **Maintenance:** Small team managing multiple products
- **Localization:** Some products target German-speaking users

## Future Directions (Open Questions)

- [ ] Should this website support multiple languages (i18n)?
- [ ] Are there analytics or conversion tracking goals we should instrument?
- [ ] What is the release cadence for adding new products?
- [ ] Should we maintain a product roadmap or changelog on this site?

## Changes Made by PULSE Bootstrap

This bootstrap added documentation in `docs/context/` to capture product understanding. No product code was modified.
