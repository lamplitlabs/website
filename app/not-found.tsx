"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { SiteNav } from "@/components/site-nav";
import { navLinks, products } from "@/lib/site-data";

// Levenshtein distance, used to catch a visitor mistyping a product slug
// (e.g. /products/amistio -> /products/amistiio) so the 404 page can offer
// the product they meant instead of a bare dead end.
function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// A near-miss slug suggestion: only offered when the mistyped product path is
// close enough to a real one that it is very likely the product the visitor
// wanted (small edit distance relative to the slug's own length).
function findNearMissProduct(pathname: string) {
  const match = pathname.match(/^\/products\/([^/]+)\/?$/);
  if (!match) return undefined;
  const attempted = match[1].toLowerCase();
  let best: { slug: string; name: string; distance: number } | undefined;
  for (const product of products) {
    const distance = levenshtein(attempted, product.slug);
    if (distance === 0) continue; // exact match would not 404
    const threshold = Math.max(1, Math.floor(product.slug.length / 3));
    // Require the attempted slug to share both the first and last character
    // with the real slug. Without this, short slugs (e.g. "light") have a
    // threshold of 1 and match many unrelated words that happen to be one
    // edit away (e.g. "night", "sight", "eight", "flight"), suggesting the
    // wrong product on a 404 page instead of a genuine typo correction.
    const sharesBoundaries =
      attempted.length > 0 &&
      attempted[0] === product.slug[0] &&
      attempted[attempted.length - 1] === product.slug[product.slug.length - 1];
    if (distance <= threshold && sharesBoundaries && (!best || distance < best.distance)) {
      best = { slug: product.slug, name: product.name, distance };
    }
  }
  return best;
}

export default function NotFound() {
  const pathname = usePathname();
  const nearMiss = findNearMissProduct(pathname ?? "");

  return (
    <>
      <SiteNav>
        <ul className="flex items-center gap-4 text-sm text-muted-foreground">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.external ? link.href : `/${link.href}`}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </SiteNav>

      <main id="main-content" className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-4 py-20 text-center">
        <Logo className="mb-6 h-16 w-16" />
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
          404
        </p>
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Page not found</h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          The page you are looking for does not exist or has moved. Head back
          to the Lamplit Labs home page to explore our products.
        </p>
        {nearMiss && (
          <p className="mb-8 max-w-md text-sm text-muted-foreground" data-testid="not-found-suggestion">
            Did you mean{" "}
            <Link
              href={`/products/${nearMiss.slug}`}
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {nearMiss.name}
            </Link>
            ?
          </p>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </main>
    </>
  );
}
