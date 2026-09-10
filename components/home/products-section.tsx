import { ProductGrid } from "@/components/product-grid";
import { RevealSection } from "@/components/home/reveal-section";
import { products } from "@/lib/site-data";

export function ProductsSection() {
  return (
    <section id="products" className="lab-grid border-t">
      <div className="mx-auto max-w-5xl px-4 py-24">
        <RevealSection className="mb-14 text-center">
          <div className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            Our Products
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Our Products
          </h2>
          <p className="mt-3 text-balance text-muted-foreground">
            Tools, platforms and models we build and maintain
          </p>
        </RevealSection>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
