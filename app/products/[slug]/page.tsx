import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUpRight, ExternalLink } from "lucide-react";
import { OutboundLink } from "@/components/outbound-link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { SiteNav } from "@/components/site-nav";
import {
  getProductBySlug,
  isProductInDevelopment,
  productCreativeWorkStatus,
  products,
} from "@/lib/site-data";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product page could not be found.",
    };
  }

  const defaultTitle = `${product.name} - ${product.title}`;
  const title = product.metaTitle ?? defaultTitle;
  const description = product.metaDescription ?? product.longDescription;
  const internalUrl = `https://www.lamplitlabs.com/products/${product.slug}`;
  // An in-development product's domain is not launched yet, so the internal
  // product page stays canonical until the product goes live.
  const canonicalUrl = isProductInDevelopment(product)
    ? internalUrl
    : (product.canonicalUrl ?? internalUrl);

  return {
    title: product.metaTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [{ url: product.cover }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.cover],
    },
  };
}

function ProductJsonLd({ slug }: { slug: string }) {
  const product = getProductBySlug(slug);

  if (!product) {
    return null;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.schema?.name ?? product.name,
    // While a product is still in development, point structured data at the
    // internal product page instead of the not-yet-public product domain.
    url: isProductInDevelopment(product)
      ? `https://www.lamplitlabs.com/products/${product.slug}`
      : (product.canonicalUrl ?? product.url),
    applicationCategory:
      product.schema?.applicationCategory ?? "UtilitiesApplication",
    description: product.metaDescription ?? product.longDescription,
    creativeWorkStatus: productCreativeWorkStatus(product),
    featureList: product.schema?.featureList,
    operatingSystem: "Web",
    image: `https://www.lamplitlabs.com${product.cover}`,
    creator: {
      "@type": "Organization",
      name: "Lamplit Labs",
      url: "https://www.lamplitlabs.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const isInDevelopment = isProductInDevelopment(product);
  // While a product is in development its URL is not live yet, so every CTA
  // points at the on-page About section instead of the external product URL.
  const ctaHref = isInDevelopment ? "#about" : product.url;
  // In development the CTAs anchor to #about on this page, so the icon must
  // not promise an external destination: show a same-page arrow instead.
  const CtaIcon = isInDevelopment ? ArrowDown : ArrowUpRight;
  const NavCtaIcon = isInDevelopment ? ArrowDown : ExternalLink;
  // Analytics should record where the click actually goes: the internal
  // product page while in development, the live product domain otherwise.
  const ctaTrackingUrl = isInDevelopment
    ? `https://www.lamplitlabs.com/products/${product.slug}`
    : product.url;
  const ctaExternalProps = isInDevelopment
    ? {}
    : { target: "_blank", rel: "noopener noreferrer" };

  return (
    <>
      <ProductJsonLd slug={slug} />

      <SiteNav>
        {isInDevelopment && (
          <span
            data-testid="product-dev-note"
            className="mr-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            In development
          </span>
        )}
        <OutboundLink
          href={ctaHref}
          {...ctaExternalProps}
          trackingTarget={product.slug}
          trackingContext="product_page_nav_cta"
          trackingUrl={ctaTrackingUrl}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {isInDevelopment ? "Follow development" : `Visit ${product.name}`}
          <NavCtaIcon aria-hidden="true" className="h-3.5 w-3.5" />
        </OutboundLink>
      </SiteNav>

      <main>
        {/* ── Hero section with cover ──────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Cover background */}
          <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.08] dark:opacity-[0.05]"
            style={{ backgroundImage: `url(${product.cover})` }}
          />

          <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-20 sm:pb-20 sm:pt-28">
            {/* Tags */}
            <div className="mb-6 flex flex-wrap gap-2">
              {product.status && (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  Status: {product.status}
                </span>
              )}
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {isInDevelopment ? (
              <>
                <p className="font-display text-xl font-semibold tracking-tight text-muted-foreground">
                  {product.name}
                </p>
                <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  {product.title}
                </h1>
              </>
            ) : (
              <>
                <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  {product.name}
                </h1>
                <p className="mt-4 max-w-2xl text-xl text-muted-foreground sm:text-2xl">
                  {product.title}
                </p>
              </>
            )}

            <div className="mt-10 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <OutboundLink
                  href={ctaHref}
                  {...ctaExternalProps}
                  trackingTarget={product.slug}
                  trackingContext="product_page_hero_cta"
                  trackingUrl={ctaTrackingUrl}
                >
                  {isInDevelopment
                    ? `Visit ${product.name} (in development)`
                    : "Get started"}
                  <CtaIcon aria-hidden="true" className="ml-2 h-4 w-4" />
                </OutboundLink>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/">View all products</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Cover image showcase ─────────────────────────── */}
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

        {/* ── About section ────────────────────────────────── */}
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

        {/* ── Highlights / Features grid ───────────────────── */}
        {product.highlights.length > 0 && (
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
        )}

        {/* ── CTA banner ───────────────────────────────────── */}
        <section>
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
            <div className="rounded-2xl border bg-card p-8 text-center sm:p-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {isInDevelopment
                  ? `Follow ${product.name}'s development`
                  : `Ready to try ${product.name}?`}
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                {product.description}
              </p>
              <div className="mt-8">
                {isInDevelopment && (
                  <p
                    data-testid="product-dev-note"
                    className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    In development — not yet available
                  </p>
                )}
                <Button size="lg" asChild>
                  <OutboundLink
                    href={ctaHref}
                    {...ctaExternalProps}
                    trackingTarget={product.slug}
                    trackingContext="product_page_bottom_cta"
                    trackingUrl={ctaTrackingUrl}
                  >
                    {isInDevelopment
                      ? "Follow development"
                      : `Visit ${product.name}`}
                    <CtaIcon aria-hidden="true" className="ml-2 h-4 w-4" />
                  </OutboundLink>
                </Button>
                {isInDevelopment && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Want to know when it ships?{" "}
                    <a
                      data-testid="product-notify-me"
                      href={`mailto:hello@lamplitlabs.com?subject=${encodeURIComponent(`Notify me: ${product.name}`)}`}
                      className="font-medium underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                      Email us to be notified
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <Logo className="h-5 w-5" />
            Lamplit Labs
          </Link>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} Lamplit Labs. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
