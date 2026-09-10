"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { OutboundLink } from "@/components/outbound-link";
import {
  productCategories,
  type Product,
  type ProductCategory,
} from "@/lib/site-data";

function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const isFeatured = product.featured;
  const isComingSoon = product.comingSoon;
  const isInDevelopment = product.status === "In development";
  const isLive = product.status === "Live";

  const inner = (
    <div
      className={`relative flex flex-col justify-end overflow-hidden bg-cover bg-center p-6 transition-all duration-500 after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-br after:from-primary/10 after:to-transparent after:opacity-0 after:transition-opacity after:duration-500 ${
        isComingSoon
          ? ""
          : "motion-safe:group-hover:scale-[1.015] group-hover:shadow-2xl group-hover:after:opacity-100"
      } ${isFeatured ? "min-h-[380px]" : "min-h-[320px]"}`}
      style={{ backgroundImage: `url(${product.cover})` }}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          isComingSoon
            ? "bg-gradient-to-t from-black/90 via-black/60 to-black/20"
            : "bg-gradient-to-t from-black/90 via-black/50 to-black/10 group-hover:from-black/95 group-hover:via-black/60"
        }`}
      />

      {/* Product status badge */}
      {(product.status || isComingSoon) && (
        <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md">
          {(isInDevelopment || isLive) && (
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isInDevelopment ? "bg-primary" : "bg-emerald-400"
              }`}
              aria-hidden="true"
            />
          )}
          {product.status ?? "Coming Soon"}
        </div>
      )}

      {/* Content */}
      <div
        className={`relative z-10 transition-transform duration-500 ${
          isComingSoon ? "" : "translate-y-2 group-hover:translate-y-0"
        } ${isFeatured ? "max-w-2xl" : ""}`}
      >
        {product.tags && product.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs text-white/90 backdrop-blur-md transition-colors ${
                  isComingSoon ? "" : "group-hover:bg-white/20"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3
          className={`font-bold text-white ${
            isFeatured ? "text-2xl sm:text-3xl" : "text-xl"
          }`}
        >
          {product.name}
        </h3>
        <p
          className={`mt-1 font-medium text-white/85 ${
            isFeatured ? "text-base" : "text-sm"
          }`}
        >
          {product.title}
        </p>
        <p
          className={`mt-2 text-white/60 ${
            isComingSoon
              ? ""
              : "transition-colors group-hover:text-white/75"
          } ${
            isFeatured
              ? "line-clamp-3 text-sm sm:text-base"
              : "line-clamp-2 text-sm"
          }`}
        >
          {product.description}
        </p>
      </div>
    </div>
  );

  // Featured cards take the whole row so the 3-column bento never leaves a hole
  const className = `card-glow group block overflow-hidden rounded-2xl ${
    isFeatured ? "sm:col-span-2 lg:col-span-3" : ""
  } ${isComingSoon ? "cursor-default" : ""}`;

  if (isComingSoon) {
    return (
      <div
        className={className}
        style={{ transitionDelay: `${index * 120}ms` }}
      >
        {inner}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <a href={`/products/${product.slug}`} className="block">
        {inner}
      </a>
      <div className="glass flex items-center justify-between gap-4 border-t border-border/40 px-4 py-3">
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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {isInDevelopment ? "Follow development" : "Visit site"}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </OutboundLink>
        <a
          href={`/products/${product.slug}`}
          aria-label={`${
            isInDevelopment ? "Explore product" : "Learn more"
          }: ${product.name}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {isInDevelopment ? "Explore product" : "Learn more"}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
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
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
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
        className={`reveal-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${
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
