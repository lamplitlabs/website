import type { MetadataRoute } from "next";
import { products } from "@/lib/site-data";

// Static export (next.config.js `output: "export"`) renders this to out/sitemap.xml
// at build time, so product routes can never drift from lib/site-data.ts.
// tests/routes.test.mjs asserts out/sitemap.xml lists exactly the exported routes.
export const dynamic = "force-static";

export const siteUrl = "https://www.lamplitlabs.com";

// Static (non-product) routes: each needs an app/<route>/page.tsx.
export const staticRoutes: { path: string; changeFrequency: "monthly" | "yearly"; priority: number }[] = [
  { path: "/", changeFrequency: "monthly", priority: 1.0 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticRoutes.map(({ path, changeFrequency, priority }) => ({
      url: `${siteUrl}${path}`,
      changeFrequency,
      priority,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      // `lastUpdated` is the product's content-updated field in lib/site-data.ts;
      // emitting it as <lastmod> lets search engines see which product pages changed
      // (tests/routes.test.mjs checks out/sitemap.xml carries one per product route).
      lastModified: product.lastUpdated,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
