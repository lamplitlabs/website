import Image from "next/image";
import type { Product } from "@/lib/site-data";

export function ProductCoverShowcase({ product }: { product: Product }) {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
          <Image
            src={product.cover}
            alt={`${product.name} cover`}
            width={800}
            height={400}
            sizes="(min-width: 1024px) 1024px, 100vw"
            priority
            className="aspect-[16/9] w-full object-cover sm:aspect-[2/1]"
          />
        </div>
      </div>
    </section>
  );
}
