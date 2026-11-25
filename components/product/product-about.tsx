import type { Product } from "@/lib/site-data";

export function ProductAbout({ product }: { product: Product }) {
  return (
    <section id="about" className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            About
          </h2>
          <p className="mt-4 text-lg leading-8 text-foreground/90 sm:text-xl sm:leading-9">
            {product.longDescription}
          </p>
        </div>
      </div>
    </section>
  );
}
