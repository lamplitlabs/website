import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUpRight, ExternalLink } from "lucide-react";
import { OutboundLink } from "@/components/outbound-link";
import { Button } from "@/components/ui/button";
import { ProductAbout } from "@/components/product/product-about";
import { ProductCoverShowcase } from "@/components/product/product-cover-showcase";
import { ProductFooter } from "@/components/product/product-footer";
import { ProductHighlights } from "@/components/product/product-highlights";
import { ProductRelated } from "@/components/product/product-related";
import { SiteNav } from "@/components/site-nav";
import {
  contactEmail,
  formatLastUpdated,
  getProductBySlug,
  isProductInDevelopment,
  isProductStatusStale,
  productCreativeWorkStatus,
  productNotifyMeHref,
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
    operatingSystem: product.operatingSystem ?? "Web",
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
  const isStatusStale = isProductStatusStale(product);
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
  // A live product's CTAs leave for an external domain this site does not
  // control. If that domain is down or redirects badly, the visitor's only way
  // forward is the browser back button, so every product page also offers the
  // rest of the catalog as an on-site next step instead of a dead end.
  const otherProducts = products.filter((other) => other.slug !== product.slug);

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

      <main id="main-content">
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
                  {product.statusSince && (
                    <span className="normal-case tracking-normal text-primary/80">
                      {" "}
                      since {product.statusSince}
                    </span>
                  )}
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

            {isStatusStale && (
              <p
                role="note"
                data-testid="stale-status-note"
                className="mb-6 max-w-2xl rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-foreground"
              >
                This product has been listed as in development since{" "}
                {product.statusSince} and its status has not been updated for
                over a year. Check the tracking page below for the latest
                progress; there is no confirmed release date.
              </p>
            )}

            {isInDevelopment && product.roadmapNote && (
              <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
                {product.roadmapNote}
              </p>
            )}

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
              {isInDevelopment && product.websiteUrl && (
                <Button size="lg" variant="outline" asChild>
                  <OutboundLink
                    href={product.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    trackingTarget={product.slug}
                    trackingContext="product_page_website_link"
                    trackingUrl={product.websiteUrl}
                  >
                    Visit the website
                    <ArrowUpRight aria-hidden="true" className="ml-2 h-4 w-4" />
                  </OutboundLink>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild>
                <Link href="/">View all products</Link>
              </Button>
            </div>

            <p
              data-testid="product-last-updated"
              className="mt-6 text-sm text-muted-foreground"
            >
              Listing updated{" "}
              <time dateTime={product.lastUpdated}>
                {formatLastUpdated(product.lastUpdated)}
              </time>
            </p>
          </div>
        </section>

        <ProductCoverShowcase product={product} />

        <ProductAbout product={product} />

        <ProductHighlights product={product} />

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
                      href={productNotifyMeHref(product)}
                      className="font-medium underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                      Email us to be notified
                    </a>{" "}
                    <span data-testid="product-notify-me-email">
                      {`(${contactEmail})`}
                    </span>
                  </p>
                )}
                {isInDevelopment && (
                  <p
                    data-testid="product-notify-me-expectation"
                    className="mt-2 text-xs text-muted-foreground"
                  >
                    The link opens your mail app with the subject pre-filled.
                    Send the email and we&apos;ll reply once when {product.name}{" "}
                    launches — no newsletter, no other emails.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
        {otherProducts.length > 0 && (
          <ProductRelated otherProducts={otherProducts} />
        )}
      </main>

      <ProductFooter />
    </>
  );
}
