"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { OutboundLink } from "@/components/outbound-link";
import { TiltSurface } from "@/components/tilt-surface";
import { cn } from "@/lib/utils";
import {
  productCategories,
  isProductInDevelopment,
  isProductLive,
  type Product,
  type ProductCategory,
} from "@/lib/site-data";
import {
  filterProductsByQuery,
  SEARCH_QUERY_PARAM,
  withSearchQueryParam,
} from "@/lib/product-search";
import styles from "./product-grid.module.css";

const CATEGORY_QUERY_PARAM = "category";
// The grid lives inside <section id="products"> (components/home/products-section.tsx).
const PRODUCTS_SECTION_ID = "products";

function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const isFeatured = product.featured;
  const isInDevelopment = isProductInDevelopment(product);
  // "Coming soon" is derived from status, not a separate flag, so the badge
  // can never drift from a product's real status.
  const isComingSoon = isInDevelopment;
  const isLive = isProductLive(product);

  const inner = (
    <>
      <div
        className={styles.cover}
        style={{ backgroundImage: `url(${product.cover})` }}
      >
        <div className={styles.badges}>
          {isFeatured && (
            <span className={styles.featuredBadge}>
              <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
              Featured
            </span>
          )}
          {product.status && (
            <span className={styles.status}>
              {(isInDevelopment || isLive) && (
                <span
                  className={cn(
                    styles.statusDot,
                    isInDevelopment && styles.inDevelopment
                  )}
                  aria-hidden="true"
                />
              )}
              {product.status}
            </span>
          )}
        </div>
      </div>
      <div className={styles.content}>
        {product.tags && product.tags.length > 0 && (
          <div className={styles.tags}>
            {product.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className={cn("font-display font-semibold tracking-tight", styles.name)}>
          {product.name}
        </h3>
        <p className={styles.title}>{product.title}</p>
        <p className={styles.description}>{product.description}</p>
      </div>
    </>
  );

  return (
    <TiltSurface
      className={cn(
        styles.card,
        isFeatured && styles.featured,
        isComingSoon && styles.comingSoon
      )}
      surfaceClassName={styles.surface}
      disabled={isComingSoon}
      style={{ animationDelay: `${Math.min(index, 5) * 80}ms` }}
    >
      {isComingSoon ? (
        <div className={styles.primary}>
          {inner}
          <div className={styles.progress}>
            <a
              href={`/products/${product.slug}`}
              className={styles.action}
              aria-label={`${isInDevelopment ? "See progress" : "Learn more"}: ${product.name}`}
              data-testid="coming-soon-see-progress"
            >
              {isInDevelopment ? "See progress" : "Learn more"}
              <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>
      ) : (
        <>
          <a href={`/products/${product.slug}`} className={styles.primary}>
            {inner}
          </a>
          <div className={styles.footer}>
            <OutboundLink
              href={product.url}
              aria-label={`Visit site: ${product.name}`}
              target="_blank"
              rel="noopener noreferrer"
              trackingTarget={product.slug}
              trackingContext="product_grid_visit"
              trackingUrl={product.url}
              className={styles.action}
            >
              Visit site
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </OutboundLink>
            <a
              href={`/products/${product.slug}`}
              aria-label={`${
                isInDevelopment ? "See progress" : "Learn more"
              }: ${product.name}`}
              className={styles.action}
            >
              {isInDevelopment ? "See progress" : "Learn more"}
              <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          </div>
        </>
      )}
    </TiltSurface>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  const { ref, visible } = useReveal(0.1);
  const [activeCategory, setActiveCategoryState] = useState<
    ProductCategory | "All"
  >("All");
  const [query, setQuery] = useState("");
  // Keep the active filter in the URL (`?category=AI`) so a filtered view can
  // be reloaded, bookmarked or shared. Read on mount (after hydration, so the
  // static export still matches) and write back with replaceState on click.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const param = params.get(CATEGORY_QUERY_PARAM);
    // Restore a shared/reloaded search (`?q=ai`) alongside the category.
    const initialQuery = params.get(SEARCH_QUERY_PARAM);
    if (initialQuery) setQuery(initialQuery);
    if (param && (productCategories as string[]).includes(param)) {
      setActiveCategoryState(param as ProductCategory);
      // A shared /?category=AI link should land on the filtered cards, not the
      // hero. Skip when the URL already carries a hash (e.g. #contact) so we
      // never override an explicit anchor.
      if (!window.location.hash) {
        document
          .getElementById(PRODUCTS_SECTION_ID)
          ?.scrollIntoView({ behavior: "auto", block: "start" });
      }
    }
  }, []);
  const setActiveCategory = (category: ProductCategory | "All") => {
    setActiveCategoryState(category);
    const url = new URL(window.location.href);
    if (category === "All") {
      url.searchParams.delete(CATEGORY_QUERY_PARAM);
    } else {
      url.searchParams.set(CATEGORY_QUERY_PARAM, category);
    }
    window.history.replaceState(window.history.state, "", url);
  };
  // Mirror the search box into `?q=` (like `?category=`) so a searched view
  // can be reloaded, bookmarked or shared.
  const updateQuery = (next: string) => {
    setQuery(next);
    window.history.replaceState(
      window.history.state,
      "",
      withSearchQueryParam(new URL(window.location.href), next)
    );
  };
  const categoryCounts = useMemo(() => {
    return products.reduce<Partial<Record<ProductCategory, number>>>(
      (counts, product) => {
        counts[product.category] = (counts[product.category] ?? 0) + 1;
        return counts;
      },
      {}
    );
  }, [products]);
  const availableCategories = useMemo(
    () =>
      productCategories.filter(
        (category) => (categoryCounts[category] ?? 0) > 0
      ),
    [categoryCounts]
  );
  const filters: Array<ProductCategory | "All"> = [
    "All",
    ...availableCategories,
  ];
  const categoryProducts =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);
  // Free-text search narrows the active category by name/description
  // substring so a user can type a tool name instead of clicking tabs.
  const filteredProducts = filterProductsByQuery(categoryProducts, query);
  const hasQuery = query.trim().length > 0;
  // In-development cards are deliberately not clickable, so give those users
  // a concrete next step: the homepage AI section (#ai) explains what is
  // coming and how to follow it. Rendered only while something is in development.
  const hasInDevelopment = products.some(isProductInDevelopment);

  return (
    <div>
      <div className="mx-auto mb-4 max-w-md">
        <label htmlFor="product-search" className="sr-only">
          Search products by name or description
        </label>
        <input
          id="product-search"
          type="search"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Search products…"
          autoComplete="off"
          data-testid="product-search"
          className="glass w-full rounded-full border px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </div>
      <div
        role="group"
        aria-label="Filter products by category"
        className="mb-8 flex flex-wrap justify-center gap-2"
      >
        {filters.map((category) => {
          const isActive = activeCategory === category;
          const count =
            category === "All"
              ? products.length
              : (categoryCounts[category] ?? 0);

          return (
            <button
              key={category}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveCategory(category)}
              className={`${styles.filter} rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                isActive
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {category}
              <span className="mono-label ml-2 tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="sr-only">
        Showing {filteredProducts.length} of {products.length} products
      </p>
      {hasInDevelopment && (
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Products marked{" "}
          <span className="text-foreground">In development</span> are not live
          yet.{" "}
          <a
            href="#ai"
            data-testid="in-development-whats-next"
            className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            See what&apos;s next
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </a>
        </p>
      )}
      <div
        ref={ref}
        className={`reveal-stagger ${styles.grid} ${
          visible ? "visible" : ""
        }`}
      >
        {filteredProducts.map((product, i) => (
          <ProductCard key={product.slug} product={product} index={i} />
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <p
          role="status"
          data-testid="product-grid-empty"
          className="py-12 text-center text-sm text-muted-foreground"
        >
          {hasQuery
            ? `No products match “${query.trim()}”.`
            : "No products in this category yet."}{" "}
          <button
            type="button"
            onClick={() => {
              updateQuery("");
              setActiveCategory("All");
            }}
            className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Show all products
          </button>
        </p>
      )}
    </div>
  );
}
