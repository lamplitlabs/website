/** Single source of truth for the public contact address (contact section, privacy page, Organization JSON-LD, PDP notify-me). */
export const contactEmail = "hello@lamplitlabs.com";

export interface ProductHighlight {
  title: string;
  description: string;
}

export type ProductStatus = "Live" | "In development";
export type ProductCreativeWorkStatus = "Published" | "In development";
export type ProductCategory =
  | "AI"
  | "Education"
  | "Developer Tools"
  | "Azure";

export const productCategories: ProductCategory[] = [
  "AI",
  "Education",
  "Developer Tools",
  "Azure",
];

export interface ProductSchema {
  name: string;
  applicationCategory: "BusinessApplication" | "UtilitiesApplication";
  featureList: string[];
}

export interface Product {
  slug: string;
  name: string;
  title: string;
  description: string;
  longDescription: string;
  url: string;
  cover: string;
  tags: string[];
  category: ProductCategory;
  highlights: ProductHighlight[];
  featured?: boolean;
  status: ProductStatus;
  /**
   * Month (YYYY-MM) the current `status` label took effect, so visitors see a
   * status history ("Live since 2026-03") instead of only the label. Update it
   * whenever `status` changes.
   */
  statusSince: string;
  /**
   * Where a visitor can follow real progress on an unreleased product: an
   * https URL or a repository-relative doc path. tests/site-data.test.mjs
   * requires it for every product whose status is "In development", so a
   * stale status label can never ship without a live place to track it.
   */
  trackingDoc?: string;
  /**
   * One sentence for visitors of an in-development product: what is being
   * built right now and what unblocks release, so the status badge is more
   * than a label plus a date. Rendered next to the status badge on the
   * detail page when `status` is "In development".
   */
  roadmapNote?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  schema?: ProductSchema;
}

/** Single source of truth for product status checks used across the UI. */
export function isProductLive(product: Pick<Product, "status">): boolean {
  return product.status === "Live";
}

export function isProductInDevelopment(
  product: Pick<Product, "status">,
): boolean {
  return product.status === "In development";
}

/**
 * JSON-LD `creativeWorkStatus`, derived from `status` so the structured data
 * can never drift from the catalog label (the class of bug fixed in 3e043b8).
 * It is intentionally not a literal field on ProductSchema.
 */
export function productCreativeWorkStatus(
  product: Pick<Product, "status">,
): ProductCreativeWorkStatus {
  return isProductLive(product) ? "Published" : "In development";
}

/**
 * `href` for the "Notify me" link on in-development product pages. The
 * subject is percent-encoded so product names containing `&`, `?`, `#`, `+`
 * or non-ASCII characters survive the mailto URL instead of being cut off
 * or read as extra query parameters by the mail client.
 */
export function productNotifyMeHref(
  product: Pick<Product, "name">,
  email: string = contactEmail,
): string {
  return `mailto:${email}?subject=${encodeURIComponent(`Notify me: ${product.name}`)}`;
}

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  blog: string;
  x: string;
  linkedin: string;
  huggingface: string;
}

export const socialLinks: SocialLinks = {
  facebook: "https://www.facebook.com/lamplitlabs",
  instagram: "https://www.instagram.com/lamplitlabs",
  blog: "https://blogs.lamplitlabs.com",
  x: "https://x.com/lamplitlabs",
  linkedin: "https://www.linkedin.com/company/lamplitlabs",
  huggingface: "https://huggingface.co/lamplitlabs",
};

export const products: Product[] = [
  {
    slug: "amistio",
    name: "Amistio",
    title: "Build agents that do the work. Stay in control.",
    description:
      "A visual AI agent builder for turning goals into versioned automations with real app actions, approval gates, shareable run pages, and inspectable runs.",
    longDescription:
      "Amistio helps individuals, small businesses, and teams build agents that do more than chat. Start from a template, describe a goal, or assemble a flow on the visual canvas; connect AI and app actions; test the editable draft; then freeze, publish, and activate an exact version. Agents can run manually, on schedules, from webhooks, or through shareable forms, with encrypted connections, human approvals, agent-owned data, and a clear run history. Remote MCP servers can be connected, while MCP tool execution, organization-owned agents, and supported customer-managed deployment remain planned.",
    url: "https://www.amistio.com",
    cover: "/covers/amistio.svg",
    tags: ["AI Agents", "Visual Automation", "App Connectors"],
    category: "AI",
    highlights: [
      {
        title: "Visual Agent Builder",
        description:
          "Start from a working template, describe an outcome in plain language, or drag and connect plain-language blocks on the canvas.",
      },
      {
        title: "Real App Actions",
        description:
          "Use typed actions for Slack, GitHub, Notion, Airtable, Discord, Google Sheets, HTTP, time, random IDs, and each agent's own data store.",
      },
      {
        title: "Versioned Releases",
        description:
          "Test an editable draft, freeze an immutable signed version, publish it, and activate the exact graph that should run.",
      },
      {
        title: "Flexible Runs",
        description:
          "Run manually, from a webhook, on a schedule, or through a shareable page with a designed form and optional voice conversation.",
      },
      {
        title: "Controls Built In",
        description:
          "Keep credentials encrypted, pause sensitive steps for human approval, share versions without credentials, and inspect every run's steps and outcome.",
      },
    ],
    featured: true,
    status: "Live",
    statusSince: "2026-03",
    metaTitle: "Amistio - Visual AI Agent Builder",
    metaDescription:
      "Build visual AI agents with app connectors, immutable versions, approval gates, shareable run pages, and inspectable execution history.",
    canonicalUrl: "https://www.amistio.com",
    schema: {
      name: "Amistio visual AI agent builder",
      applicationCategory: "BusinessApplication",
      featureList: [
        "Visual drag-and-drop agent flow builder",
        "Starter templates and goal-to-draft generation",
        "Built-in tools and provider app connectors",
        "Encrypted per-user connection credentials",
        "Immutable agent versions and activation",
        "Manual, webhook, scheduled, share-link, and voice runs",
        "Human approval gates and inspectable run history",
      ],
    },
  },
  {
    slug: "light",
    name: "Lamplit Light",
    title: "AI that runs where you are",
    description:
      "Small, specialised AI models you host yourself in the browser, on a laptop, on-prem, in your private cloud, inside your app, or on the edge. Your data never leaves.",
    longDescription:
      "Lamplit Light is Lamplit Labs' sovereign AI lab for small, specialised models you host yourself. Each model is built for one clearly defined job, grounded in verified knowledge, measured against deterministic offline release gates and an independent multi-model judge panel, then compressed into compact ONNX exports for self-hosted use. Every model ships under the light-<purpose>-<version> naming pattern together with its purpose, base model, size, licence and gate result, so you always know what a model is for and which release you are running. The family started with a German language tutor and grows one job at a time.",
    url: "https://ai.lamplitlabs.com",
    cover: "/covers/light.svg",
    tags: ["Sovereign AI", "Small Models", "On-device"],
    category: "AI",
    highlights: [
      {
        title: "Runs where you are",
        description:
          "Host compact models in a browser, on a laptop, on-prem, in a private cloud, inside your app, or on edge and IoT hardware.",
      },
      {
        title: "Your weights, your rules",
        description:
          "Models are designed for self-hosting so your data stays where you run them and the exported weights are yours.",
      },
      {
        title: "Small by design",
        description:
          "Each model is trained for a single, clearly defined job and nothing else, which keeps it small enough to run on hardware you already have.",
      },
      {
        title: "Gated before release",
        description:
          "Every release is measured against deterministic offline gates and checked by an independent multi-model judge panel.",
      },
      {
        title: "One job per model",
        description:
          "Named light-<purpose>-<version> and shipped with its purpose, base model, size, licence and gate result, so you always know what a model is for and which release you run.",
      },
    ],
    featured: true,
    status: "In development",
    statusSince: "2026-09",
    trackingDoc: "https://huggingface.co/lamplitlabs",
    roadmapNote:
      "The first light-<purpose> models are being trained and run through the offline gates and judge panel; a model is listed here only once it passes and its weights are published.",
    metaTitle: "Lamplit Light - Small AI Models You Host Yourself",
    metaDescription:
      "Small, specialised AI models you host in browsers, apps, private clouds, laptops, on-prem, or at the edge. Your data never leaves.",
    canonicalUrl: "https://ai.lamplitlabs.com",
    schema: {
      name: "Lamplit Light sovereign AI models",
      applicationCategory: "BusinessApplication",
      featureList: [
        "Self-hosted small AI models",
        "Single-purpose specialised models",
        "Verified knowledge training",
        "Deterministic offline release gates",
        "Independent multi-model judge panel",
        "Compact ONNX q8 and q4 exports",
        "Browser and edge runtime support",
      ],
    },
  },
  {
    slug: "kenntnistrainer",
    status: "Live",
    statusSince: "2026-04",
    name: "Kenntnistrainer",
    title: "AI-powered Kenntnisprüfung simulation and training",
    description:
      "Kenntnisprüfung preparation with AI simulation: a structured 7-step case flow, AI feedback, spaced repetition, and medical communication in German.",
    longDescription:
      "Kenntnistrainer helps foreign doctors in Germany prepare for the Kenntnisprüfung with guided case-based training. It combines exam-style simulation, feedback loops, and focused medical language practice.",
    url: "https://www.kenntnistrainer.de",
    cover: "/covers/kenntnistrainer.svg",
    tags: ["AI", "Medical", "Training"],
    category: "Education",
    highlights: [
      { title: "7-Step Case Flow", description: "Structured exam simulation following the official Kenntnisprüfung format step by step." },
      { title: "AI Feedback", description: "Get instant, detailed feedback on your responses powered by AI evaluation." },
      { title: "Spaced Repetition", description: "Smart review scheduling so you retain medical knowledge efficiently." },
      { title: "German Medical Language", description: "Practice medical communication in German with realistic scenarios." },
    ],
    featured: true,
    metaDescription:
      "AI-powered Kenntnisprüfung training for foreign doctors in Germany: 7-step case simulation, instant feedback, spaced repetition and German medical language.",
  },
  {
    slug: "fachsprachprufung",
    status: "Live",
    statusSince: "2026-04",
    name: "Fachsprachprüfung",
    title: "AI-powered FSP simulation and training",
    description:
      "FSP preparation with AI simulation: doctor-patient conversation, documentation, and doctor-to-doctor handover in German.",
    longDescription:
      "Fachsprachprüfung supports foreign doctors preparing for the language-focused medical exam in Germany. It trains practical workflows from patient interaction to handover communication.",
    url: "https://www.fachsprachtrainer.de",
    cover: "/covers/fsp.svg",
    tags: ["AI", "Medical", "Language"],
    category: "Education",
    highlights: [
      { title: "Patient Conversation", description: "Practice realistic doctor-patient dialogues with AI-simulated patients." },
      { title: "Documentation Training", description: "Learn to write medical reports and referral letters in German." },
      { title: "Doctor-to-Doctor Handover", description: "Train structured handover communication with medical peers." },
      { title: "Exam-Ready Practice", description: "Covers all three FSP exam sections in a single training flow." },
    ],
    featured: true,
    metaDescription:
      "AI-powered Fachsprachprüfung (FSP) training for doctors in Germany: practice patient conversations, medical documentation and doctor-to-doctor handovers.",
  },
  {
    slug: "leben-in-deutschland",
    status: "Live",
    statusSince: "2026-03",
    name: "Leben in Deutschland",
    title: "Citizenship test prep for Germany",
    description:
      "Prepare for the German citizenship test with a free platform and comprehensive resources.",
    longDescription:
      "Leben in Deutschland offers focused preparation for the Einbürgerungstest with complete question coverage, region-specific content, and a simple practice flow.",
    url: "https://www.lebenindeutschland.org",
    cover: "/covers/leben.svg",
    tags: ["Education", "Germany", "Integration"],
    category: "Education",
    highlights: [
      { title: "310 Official Questions", description: "Complete coverage of all questions from the official question catalog." },
      { title: "Region-Specific Content", description: "Practice with questions specific to your Bundesland." },
      { title: "Progress Tracking", description: "See which topics you have mastered and where you need more practice." },
      { title: "Free to Use", description: "No account required, no paywalls. Just start practicing." },
    ],
    featured: true,
    metaDescription:
      "Free Einbürgerungstest preparation: practice all 310 official Leben in Deutschland questions plus Bundesland-specific ones, with progress tracking.",
  },
  {
    slug: "developer-tools",
    status: "Live",
    statusSince: "2026-03",
    name: "Developer Tools",
    title: "Everyday utilities for developers",
    description:
      "A growing collection of browser-based developer utilities, including JSON formatter, Base64, UUID, and more.",
    longDescription:
      "Developer Tools is a practical toolkit for common engineering tasks. It focuses on speed, usability, and free access directly in the browser.",
    url: "https://tools.lamplitlabs.com",
    cover: "/covers/tools.svg",
    tags: ["Developer Tools", "Utilities", "Web"],
    category: "Developer Tools",
    highlights: [
      { title: "JSON Formatter", description: "Format, validate, and minify JSON with syntax highlighting." },
      { title: "Base64 Encoder/Decoder", description: "Encode and decode Base64 strings instantly." },
      { title: "UUID Generator", description: "Generate v4 UUIDs with one click." },
      { title: "Browser-Based", description: "All tools run entirely in your browser. Nothing is sent to a server." },
    ],
    featured: true,
    metaDescription:
      "Free browser-based developer utilities from Lamplit Labs: JSON formatter, Base64 encoder/decoder, UUID generator and more. Nothing leaves your browser.",
  },
  {
    slug: "edmx-tools",
    status: "Live",
    statusSince: "2026-03",
    name: "EDMX Tools",
    title: "Tools for EDMX and OData metadata",
    description:
      "A set of tools for EDMX and OData metadata files, including explorer, trimmer, and conversion utilities.",
    longDescription:
      "EDMX Tools supports teams working with enterprise metadata by making exploration and transformation of EDMX and OData schemas straightforward.",
    url: "https://edmx.lamplitlabs.com",
    cover: "/covers/edmx.svg",
    tags: ["Developer Tools", ".NET", "OData"],
    category: "Developer Tools",
    highlights: [
      { title: "EDMX Explorer", description: "Browse entity types, properties, and associations visually." },
      { title: "EDMX Trimmer", description: "Remove unused entities to reduce metadata file size." },
      { title: "OpenAPI Converter", description: "Convert EDMX metadata to OpenAPI specification." },
      { title: "JSON Converter", description: "Transform EDMX XML into structured JSON for easier processing." },
    ],
    metaDescription:
      "Free EDMX and OData metadata tools: explore entity models, trim unused entities, and convert EDMX to OpenAPI or JSON in your browser.",
  },
  {
    slug: "azure-drawio-assets",
    status: "Live",
    statusSince: "2026-04",
    name: "Azure Draw.io Assets",
    title: "Azure icons for architecture diagrams",
    description:
      "Browse Azure service icons for architecture diagrams, synced from official Microsoft icon sets.",
    longDescription:
      "Azure Draw.io Assets provides a searchable catalog of Azure architecture icons so teams can build clean and up-to-date diagrams quickly.",
    url: "https://azure-assets.lamplitlabs.com",
    cover: "/covers/azure-assets.svg",
    tags: ["Azure", "Draw.io", "Architecture"],
    category: "Azure",
    highlights: [
      { title: "643+ Icons", description: "Comprehensive collection of Azure service icons for diagrams." },
      { title: "Auto-Synced", description: "Continuously updated from official Microsoft Azure icon sets." },
      { title: "Draw.io Ready", description: "Icons formatted and ready to drag into your Draw.io diagrams." },
      { title: "Searchable Catalog", description: "Find the right icon quickly with built-in search." },
    ],
    metaDescription:
      "Searchable catalog of 643+ Azure architecture icons, auto-synced from official Microsoft icon sets and ready to drop into Draw.io diagrams.",
  },
  {
    slug: "azure-compliance-matrix",
    status: "Live",
    statusSince: "2026-04",
    name: "Azure Compliance Matrix",
    title: "Azure services compliance coverage",
    description:
      "Interactive compliance coverage matrix for Azure services with search and filtering across major frameworks.",
    longDescription:
      "Azure Compliance Matrix helps security and compliance teams explore certification coverage across Azure and Azure Government offerings in one place.",
    url: "https://azure-compliance.lamplitlabs.com",
    cover: "/covers/azure-compliance.svg",
    tags: ["Azure", "Compliance", "Security"],
    category: "Azure",
    highlights: [
      { title: "17 Frameworks", description: "Coverage across ISO 27001, SOC, HIPAA, PCI DSS, and more." },
      { title: "Interactive Matrix", description: "Search, filter, and explore compliance coverage by service." },
      { title: "Azure Government", description: "Includes compliance data for both Azure and Azure Government." },
      { title: "Always Current", description: "Data sourced and updated from official Microsoft documentation." },
    ],
    metaDescription:
      "Interactive compliance matrix for Azure and Azure Government services across 17 frameworks (ISO 27001, SOC, HIPAA, PCI DSS) with search and filtering.",
  },
];

export const navLinks: NavLink[] = [
  { label: "Products", href: "#products" },
  { label: "AI", href: "#ai" },
  { label: "About", href: "#about" },
  { label: "Blog", href: socialLinks.blog, external: true },
  { label: "Contact", href: "#contact" },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
