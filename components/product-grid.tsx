"use client";

import { useMemo, useState } from "react";
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
import styles from "./product-grid.module.css";

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
        <div className={styles.primary}>{inner}</div>
      ) : (
        <>
          <a href={`/products/${product.slug}`} className={styles.primary}>
            {inner}
          </a>
          <div className={styles.footer}>
            <OutboundLink
              href={product.url}
              aria-label={`${
                isInDevelopment ? "Follow development" : "Visit site"
              }: ${product.name}`}
              target="_blank"
              rel="noopener noreferrer"
              trackingTarget={product.slug}
              trackingContext="product_grid_visit"
              trackingUrl={product.url}
              className={styles.action}
            >
              {isInDevelopment ? "Follow development" : "Visit site"}
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </OutboundLink>
            <a
              href={`/products/${product.slug}`}
              aria-label={`${
                isInDevelopment ? "Explore product" : "Learn more"
              }: ${product.name}`}
              className={styles.action}
            >
              {isInDevelopment ? "Explore product" : "Learn more"}
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
  const [activeCategory, setActiveCategory] = useState<
    ProductCategory | "All"
  >("All");
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
  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <div>
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
    </div>
  );
}
