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

type NearMiss = { href: string; name: string; distance: number };

// Shared acceptance rule for a mistyped slug against a real one: small edit
// distance relative to the slug's own length, and the attempt must share the
// real slug's first and last character. Without the boundary guard, short
// slugs (e.g. "light") have a threshold of 1 and match many unrelated words
// that happen to be one edit away (e.g. "night", "sight", "eight", "flight"),
// suggesting the wrong page on a 404 instead of a genuine typo correction.
function nearMissDistance(attempted: string, slug: string): number | undefined {
  const distance = levenshtein(attempted, slug);
  if (distance === 0) return undefined; // exact match would not 404
  const threshold = Math.max(1, Math.floor(slug.length / 3));
  const sharesBoundaries =
    attempted.length > 0 &&
    attempted[0] === slug[0] &&
    attempted[attempted.length - 1] === slug[slug.length - 1];
  return distance <= threshold && sharesBoundaries ? distance : undefined;
}

// A near-miss slug suggestion: only offered when the mistyped product path is
// close enough to a real one that it is very likely the product the visitor
// wanted (small edit distance relative to the slug's own length).
function findNearMissProduct(pathname: string): NearMiss | undefined {
  const match = pathname.match(/^\/products\/([^/]+)\/?$/);
  if (!match) return undefined;
  const attempted = match[1].toLowerCase();
  let best: NearMiss | undefined;
  for (const product of products) {
    const distance = nearMissDistance(attempted, product.slug);
    if (distance !== undefined && (!best || distance < best.distance)) {
      best = { href: `/products/${product.slug}`, name: product.name, distance };
    }
  }
  return best;
}

// Static routes a visitor may type by hand: the privacy page and the home-page
// sections behind the nav anchors (/products, /about, /contact ...). The site
// has no top-level /products or /about page, so these otherwise dead-end.
const staticRoutes: { slug: string; href: string; name: string }[] = [
  { slug: "privacy", href: "/privacy", name: "Privacy Policy" },
  ...navLinks
    .filter((link) => !link.external && link.href.startsWith("#"))
    .map((link) => ({ slug: link.href.slice(1), href: `/${link.href}`, name: link.label })),
];

// Near-miss for a single-segment path (e.g. /privcy, /prducts, /about-us,
// /privacy-policy): accepts the same typo rule as products, plus an exact
// slug followed by a "-" qualifier, which is a common way to guess a URL.
function findNearMissStaticRoute(pathname: string): NearMiss | undefined {
  const match = pathname.match(/^\/([^/]+)\/?$/);
  if (!match) return undefined;
  const attempted = match[1].toLowerCase();
  let best: NearMiss | undefined;
  for (const route of staticRoutes) {
    if (attempted === route.slug) continue; // /privacy itself would not 404
    // Very short slugs (e.g. "ai") are one edit away from too many unrelated
    // paths (/api, /ab), so only the "-" qualifier form counts for them.
    const distance = attempted.startsWith(`${route.slug}-`)
      ? 1
      : route.slug.length >= 4
        ? nearMissDistance(attempted, route.slug)
        : undefined;
    if (distance !== undefined && (!best || distance < best.distance)) {
      best = { href: route.href, name: route.name, distance };
    }
  }
  return best;
}

function findNearMiss(pathname: string): NearMiss | undefined {
  return findNearMissProduct(pathname) ?? findNearMissStaticRoute(pathname);
}

export default function NotFound() {
  const pathname = usePathname();
  const nearMiss = findNearMiss(pathname ?? "");

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
              href={nearMiss.href}
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
