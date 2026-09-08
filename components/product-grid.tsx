"use client";

import { useReveal } from "@/hooks/use-reveal";
import { OutboundLink } from "@/components/outbound-link";
import type { Product } from "@/lib/site-data";

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

  const inner = (
    <div
      className={`relative flex flex-col justify-end bg-cover bg-center p-6 transition-all duration-500 ${
        isComingSoon ? "" : "group-hover:scale-[1.02] group-hover:shadow-2xl"
      } ${isFeatured ? "min-h-[400px] sm:min-h-[420px]" : "min-h-[340px]"}`}
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
        <div className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md">
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
                className={`rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-xs text-white/90 backdrop-blur-md transition-colors ${
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

  const className = `card-glow group block overflow-hidden rounded-xl ${
    isFeatured ? "sm:col-span-2" : ""
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
      <div className="flex items-center justify-between border-t border-border/40 bg-card px-4 py-3">
        <OutboundLink
          href={product.url}
          aria-label={`${
            isInDevelopment ? "Follow development" : "Visit site"
          }: ${product.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          trackingTarget={product.slug}
          trackingContext="product_grid_visit"
          trackingUrl={product.url}
        >
          {isInDevelopment ? "Follow development" : "Visit site"} &rarr;
        </OutboundLink>
        <a
          href={`/products/${product.slug}`}
          aria-label={`${
            isInDevelopment ? "Explore product" : "Learn more"
          }: ${product.name}`}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {isInDevelopment ? "Explore product" : "Learn more"} &rarr;
        </a>
      </div>
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  const { ref, visible } = useReveal(0.1);

  return (
    <div
      ref={ref}
      className={`reveal-stagger grid gap-6 sm:grid-cols-2 ${visible ? "visible" : ""}`}
    >
      {products.map((product, i) => (
        <ProductCard key={product.name} product={product} index={i} />
      ))}
    </div>
  );
}
