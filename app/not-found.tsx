"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { SiteNav } from "@/components/site-nav";
import { navLinkHref, navLinks, products } from "@/lib/site-data";

// Levenshtein distance, used to catch a visitor mistyping a product slug
// (e.g. /products/kenntnistrainer -> /products/kenntnistrainerr) so the 404 page can offer
// the product they meant instead of a bare dead end. A swap of two neighbouring
// letters counts as one edit (optimal string alignment / Damerau-Levenshtein),
// so /aobut is one slip from /about, as a visitor would count it.
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
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
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

// A product path a visitor may type or follow by hand: the real
// /products/<slug>, the singular /product/<slug>, or the bare /<slug> at the
// site root. The segment name is matched case-insensitively (/Products/...).
const productPathPattern = /^\/(?:(products?)\/)?([^/]+)\/?$/i;

// A near-miss slug suggestion: only offered when the mistyped product path is
// close enough to a real one that it is very likely the product the visitor
// wanted. Three kinds of slip count:
// - the real slug in the wrong place or case (/eszett, /product/eszett,
//   /products/Eszett): the static host is case-sensitive, so these 404 even
//   though the slug itself is right;
// - the slug with hyphens added or dropped (/products/edmxtools);
// - the slug with one extra trailing "s" or its last letter dropped
//   (/products/lights, /products/ligh, /products/edmx-tool), for slugs of 4
//   letters or more: nearMissDistance's threshold and last-letter guard reject
//   these on short slugs, yet they are the commonest slip at the end of a URL;
// - a small typo, under nearMissDistance's threshold and boundary guard, so
//   unrelated words such as /products/night still get no suggestion.
function findNearMissProduct(pathname: string): NearMiss | undefined {
  const match = pathname.match(productPathPattern);
  if (!match) return undefined;
  const [, segment, raw] = match;
  const attempted = raw.toLowerCase();
  const isRealPath = (slug: string) => segment === "products" && raw === slug;
  let best: NearMiss | undefined;
  for (const product of products) {
    const { slug } = product;
    if (isRealPath(slug)) return undefined; // the real product page would not 404
    const distance =
      attempted === slug
        ? 0 // case-only or path-only difference
        : attempted.replace(/-/g, "") === slug.replace(/-/g, "")
          ? 1 // hyphen-only difference
          : slug.length >= 4 && (attempted === `${slug}s` || attempted === slug.slice(0, -1))
            ? 1 // extra trailing "s" or dropped last letter
            : nearMissDistance(attempted, slug);
    if (distance !== undefined && (!best || distance < best.distance)) {
      best = { href: `/products/${slug}`, name: product.name, distance };
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
  // Nav links to real top-level routes (/ai) are candidates under their own path.
  ...navLinks
    .filter((link) => !link.external && /^\/[a-z-]+$/.test(link.href))
    .map((link) => ({ slug: link.href.slice(1), href: link.href, name: link.label })),
];

// Near-miss for a single-segment path (e.g. /privcy, /prducts, /about-us,
// /privacy-policy, /About, /AI): accepts the same typo rule as products, plus
// an exact slug followed by a "-" qualifier, which is a common way to guess a
// URL, plus the slug in the wrong case: the static host is case-sensitive, so
// /PRIVACY 404s even though the word is right.
function findNearMissStaticRoute(pathname: string): NearMiss | undefined {
  const match = pathname.match(/^\/([^/]+)\/?$/);
  if (!match) return undefined;
  const raw = match[1];
  const attempted = raw.toLowerCase();
  let best: NearMiss | undefined;
  for (const route of staticRoutes) {
    if (raw === route.slug) continue; // /privacy itself would not 404
    // Very short slugs (e.g. "ai") are one edit away from too many unrelated
    // paths (/api, /ab), so only the case-only and "-" qualifier forms count
    // for them.
    const distance = attempted === route.slug
      ? 0 // case-only difference
      : attempted.startsWith(`${route.slug}-`)
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
  // The 404 is prerendered once as out/404.html, where the pathname is not the
  // visitor's URL, so a suggestion computed during render would differ between
  // that HTML and the first client render and throw React #418 (hydration
  // mismatch). Compute it after mount instead: both renders start without a
  // suggestion and it appears once the real URL is known.
  const [nearMiss, setNearMiss] = useState<NearMiss | undefined>(undefined);
  useEffect(() => {
    setNearMiss(findNearMiss(pathname ?? ""));
  }, [pathname]);

  return (
    <>
      <SiteNav>
        <ul className="flex items-center gap-4 text-sm text-muted-foreground">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={navLinkHref(link)}
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
