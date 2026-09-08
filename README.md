# Lamplit Labs

The official website for [Lamplit Labs](https://www.lamplitlabs.com) — a technology organization building practical tools that solve real problems.

Formerly known as Bites In Byte.

From visual AI agents with Amistio to medical exam prep, citizenship tools, career resources, developer utilities, and Azure resources — small, practical software packed into every byte.

## Products

| Product | Description | URL |
|---------|-------------|-----|
| **Amistio** | Visual AI agent builder with app connectors, versioned releases, and approval gates (`BusinessApplication`) — **Live** | [amistio.com](https://www.amistio.com) |
| **Kenntnistrainer** | KI-gestützte Kenntnisprüfung simulation & training for foreign doctors in Germany | [kenntnistrainer.de](https://www.kenntnistrainer.de) |
| **Fachsprachprüfung** | KI-gestützte FSP simulation & training for foreign doctors in Germany | [fachsprachtrainer.de](https://www.fachsprachtrainer.de) |
| **Leben in Deutschland** | German citizenship test (Einbürgerungstest) prep with 310 questions | [lebenindeutschland.org](https://www.lebenindeutschland.org) |
| **Resume Builder** | ATS-optimized resume builder | [resume.lamplitlabs.com](https://resume.lamplitlabs.com) |
| **Developer Tools** | Everyday developer utilities — JSON formatter, Base64, UUID, and more | [tools.lamplitlabs.com](https://tools.lamplitlabs.com) |
| **EDMX Tools** | Tools for EDMX/OData metadata files | [edmx.lamplitlabs.com](https://edmx.lamplitlabs.com) |
| **Azure Draw.io Assets** | Searchable Azure service icons for Draw.io architecture diagrams | [azure-assets.lamplitlabs.com](https://azure-assets.lamplitlabs.com) |
| **Azure Compliance Matrix** | Interactive compliance coverage matrix for Azure services | [azure-compliance.lamplitlabs.com](https://azure-compliance.lamplitlabs.com) |

Product descriptions, availability, and URLs follow the website catalog in [`lib/site-data.ts`](lib/site-data.ts). Each product lives in its own repository and is deployed independently.

## Tech Stack

- [Next.js 15](https://nextjs.org/) — static export (`output: "export"`)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) patterns
- [TypeScript](https://www.typescriptlang.org/)
- Deployed to [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- npm

### Development

```bash
# Install dependencies
npm install

# Start dev server at http://localhost:3000
npm run dev

# Build static export to ./out
npm run build

# Clean build artifacts
npm run clean
```

## Project Structure

```
app/            → Next.js app directory (pages, layout, global styles)
components/     → UI components (product grid, hero globe, social bar, etc.)
hooks/          → Custom React hooks
lib/            → Utility functions
public/         → Static assets (favicons, product cover SVGs, OG image)
vercel.json     → Vercel routing config (explicit `/` → `/index` rewrite for the static export)
.github/        → GitHub Actions workflows for CI and Vercel deployment
```

## Deployment

Pushes to `main` automatically deploy to Vercel via the workflow in `.github/workflows/deploy-web-vercel.yml`.

The canonical production endpoints are [lamplitlabs.com](https://lamplitlabs.com) and [www.lamplitlabs.com](https://www.lamplitlabs.com), both served by Vercel.

Vercel's Next.js builder strips the `.html` extension from static-export pages (`out/index.html` is served as `/index`) and does not emit an explicit route for `/`. `vercel.json` adds that rewrite so the homepage never depends on implicit directory-index resolution. Keep it in place when changing routing.

## Connect

- [GitHub](https://github.com/lamplitlabs)
- [Facebook](https://www.facebook.com/lamplitlabs)
- [Instagram](https://www.instagram.com/lamplitlabs)
- [Blog](https://blogs.lamplitlabs.com)
- [X](https://x.com/lamplitlabs)
- [LinkedIn](https://www.linkedin.com/company/lamplitlabs)

## License

[MIT](LICENSE)
