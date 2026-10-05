import type { MetadataRoute } from "next";
import { siteUrl } from "./sitemap";

// Static export renders this to out/robots.txt at build time. Deriving the
// Sitemap pointer from app/sitemap.ts's siteUrl keeps the two from drifting
// (a hand-maintained public/robots.txt would silently shadow this file).
// tests/routes.test.mjs asserts out/robots.txt allows crawling and points at the sitemap.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
