import Link from "next/link";
import type { Product } from "@/lib/site-data";

export function ProductRelated({ otherProducts }: { otherProducts: Product[] }) {
  return (
    <section
      aria-labelledby="explore-other-products"
      data-testid="product-explore-others"
      className="border-t bg-muted/30"
    >
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h2
          id="explore-other-products"
          className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Explore our other products
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherProducts.map((other) => (
            <li key={other.slug}>
              <Link
                href={`/products/${other.slug}`}
                data-testid="product-explore-other-link"
                className="block h-full rounded-xl border bg-card p-5 transition-all duration-300 hover:border-foreground/10 hover:shadow-md"
              >
                <span className="font-semibold">{other.name}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  {other.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
