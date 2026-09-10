import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";
import { CookieConsent } from "@/components/cookie-consent";
import { GoogleAnalytics } from "@/components/google-analytics";
import { products, socialLinks } from "@/lib/site-data";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Lamplit Labs - Practical Tools for Real Problems",
    template: "%s | Lamplit Labs",
  },
  description:
    "Lamplit Labs builds practical tools that solve real problems, including the visual AI agent builder Amistio, the sovereign-AI lab Lamplit Light, Kenntnistrainer, Fachsprachprufung, Leben in Deutschland, Resume Builder, Developer Tools, EDMX Tools, Azure Draw.io Assets, and Azure Compliance Matrix.",
  metadataBase: new URL("https://www.lamplitlabs.com"),
  keywords: [
    "Lamplit Labs",
    "lamplitlabs",
    "Amistio",
    "visual AI agent builder",
    "app connectors",
    "approval gates",
    "AI agent platform",
    "Lamplit Light",
    "sovereign AI",
    "small language models",
    "on-device AI",
    "transformers.js",
    "self-hosted AI models",
    "Kenntnistrainer",
    "Kenntnisprufung",
    "KP exam",
    "Fachsprachprufung",
    "FSP",
    "Leben in Deutschland",
    "Einburgerungstest",
    "German citizenship test",
    "Resume Builder",
    "ATS resume",
    "Developer Tools",
    "JSON formatter",
    "Base64 encoder",
    "UUID generator",
    "EDMX Tools",
    "OData",
    "Azure Draw.io Assets",
    "Azure icons",
    "Draw.io",
    "Azure Compliance Matrix",
    "Azure compliance",
    "ISO 27001",
    "SOC compliance",
    "HIPAA",
    "PCI DSS",
  ],
  authors: [{ name: "Lamplit Labs", url: "https://www.lamplitlabs.com" }],
  creator: "Lamplit Labs",
  publisher: "Lamplit Labs",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.lamplitlabs.com",
  },
  openGraph: {
    title: "Lamplit Labs - Practical Tools for Real Problems",
    description:
      "Lamplit Labs builds the visual AI agent builder Amistio, the sovereign-AI lab Lamplit Light, and practical tools across education, career, developer workflows, and Azure compliance.",
    url: "https://www.lamplitlabs.com",
    siteName: "Lamplit Labs",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lamplit Labs - Practical Tools for Real Problems",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lamplit Labs - Practical Tools for Real Problems",
    description:
      "Lamplit Labs builds the visual AI agent builder Amistio, the sovereign-AI lab Lamplit Light, and practical tools across education, career, developer workflows, and Azure compliance.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Lamplit Labs",
  url: "https://www.lamplitlabs.com",
  logo: "https://www.lamplitlabs.com/icon-512.png",
  description:
    "A technology organization building the visual AI agent builder Amistio, the sovereign-AI lab Lamplit Light, and practical products for medical exam prep, citizenship, careers, developer workflows, and Azure compliance.",
  foundingDate: "2020",
  sameAs: Object.values(socialLinks),
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@lamplitlabs.com",
    contactType: "customer support",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Lamplit Labs",
  url: "https://www.lamplitlabs.com",
  description:
    "Lamplit Labs builds the visual AI agent builder Amistio, the sovereign-AI lab Lamplit Light, and practical tools for education, careers, developer workflows, and compliance.",
  publisher: {
    "@type": "Organization",
    name: "Lamplit Labs",
    url: "https://www.lamplitlabs.com",
  },
};

const productJsonLd = products.map((product) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: product.schema?.name ?? product.name,
  url: product.canonicalUrl ?? product.url,
  applicationCategory:
    product.schema?.applicationCategory ?? "UtilitiesApplication",
  description: product.metaDescription ?? product.longDescription,
  creativeWorkStatus: product.schema?.creativeWorkStatus,
  featureList: product.schema?.featureList,
  operatingSystem: "Web",
  creator: {
    "@type": "Organization",
    name: "Lamplit Labs",
    url: "https://www.lamplitlabs.com",
  },
}));

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          defer
          data-domain="lamplitlabs.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {productJsonLd.map((item, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
          />
        ))}
      </head>
      <body className={`${inter.className} ${fraunces.variable}`}>
        <Providers>
          {children}
          <GoogleAnalytics />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
