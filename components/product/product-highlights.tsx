import type { Product } from "@/lib/site-data";

export function ProductHighlights({ product }: { product: Product }) {
  if (product.highlights.length === 0) {
    return null;
  }
  return (
    <section className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <h2 className="mb-10 text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Key Features
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {product.highlights.map((highlight, index) => (
            <div
              key={index}
              className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:border-foreground/10 hover:shadow-md"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground transition-colors group-hover:bg-foreground/10 group-hover:text-foreground">
                {index + 1}
              </div>
              <h3 className="font-semibold">{highlight.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
