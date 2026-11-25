import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Globe,
  KeyRound,
  Laptop,
  Lock,
  Mail,
  Radio,
  Repeat,
  Server,
  Smartphone,
  Unplug,
} from "lucide-react";
import { Footer } from "@/components/home/footer";
import { HuggingFaceIcon } from "@/components/icons";
import { OutboundLink } from "@/components/outbound-link";
import { SiteNav } from "@/components/site-nav";
import {
  aiDataSource,
  aiModels,
  aiSuiteScenarios,
  factsGate,
  formatShare,
  gatesPassed,
  huggingFaceModelUrl,
  huggingFaceSpaceUrl,
} from "@/lib/ai-models";
import {
  contactEmail,
  formatLastUpdated,
  getProductBySlug,
  isProductLive,
  navLinkHref,
  navLinks,
  socialLinks,
} from "@/lib/site-data";

// The AI project's content served on this site (TASK-084,
// docs/features/ai-route.md). Model numbers come from lib/ai-models.ts, a
// dated snapshot of the AI project's generated data file.

export const metadata: Metadata = {
  title: "AI - Small Models You Host Yourself",
  description:
    "Lamplit Light: small, specialised AI models you host yourself - in a browser, on a laptop, on-prem or at the edge - with the release-gate numbers each one was measured on.",
  alternates: { canonical: "https://www.lamplitlabs.com/ai" },
};

const light = getProductBySlug("light");
const lightIsLive = light ? isProductLive(light) : false;
// The domain is written once, in lib/site-data.ts (the light product's url).
const lightDomain = light ? new URL(light.url).hostname : null;

const sovereignty = [
  {
    icon: Lock,
    title: "Data stays home",
    text: "Prompts, documents and answers never cross your perimeter. There is no third party to audit because there is no third party.",
  },
  {
    icon: KeyRound,
    title: "You hold the weights",
    text: "The model is a file you own, under the licence of its open base. Copy it, archive it, run it in ten years.",
  },
  {
    icon: Repeat,
    title: "It changes when you say so",
    text: "No silent model updates and no behaviour drift between Monday and Tuesday. A new version is a decision you take, measured against the old one.",
  },
  {
    icon: Unplug,
    title: "No meter, no outage",
    text: "Once it is on your machine there is no per-token bill, no rate limit and no status page to watch. It works offline.",
  },
];

const runtimes = [
  {
    icon: Globe,
    title: "In the browser",
    text: "Nothing installed, nothing uploaded - the model downloads once and stays in the browser cache.",
  },
  {
    icon: Laptop,
    title: "On a laptop or desktop",
    text: "A native runtime on the machine that already has the data. Works on a train, on a plane, behind a firewall.",
  },
  {
    icon: Server,
    title: "On-prem or private cloud",
    text: "An inference endpoint inside your network, behind your identity provider, on hardware you already own or rent.",
  },
  {
    icon: Smartphone,
    title: "Inside your app",
    text: "Shipped with your product as a file. Your users get the feature without an account at a third party.",
  },
  {
    icon: Radio,
    title: "On the edge and IoT",
    text: "Small enough for gateways, kiosks and industrial controllers where the round trip to a cloud is the problem.",
  },
];

const commissionHref = `mailto:${contactEmail}?subject=${encodeURIComponent("A model for our job")}`;

const linkClassName =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const primaryLinkClassName = `${linkClassName} bg-primary text-primary-foreground hover:bg-primary/90`;
const secondaryLinkClassName = `${linkClassName} border border-border bg-background/60 hover:border-primary/40 hover:text-primary`;

export default function AiPage() {
  return (
    <>
      <SiteNav>
        <ul className="flex items-center gap-4 text-sm text-muted-foreground">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={navLinkHref(link)}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                aria-current={link.href === "/ai" ? "page" : undefined}
                className={
                  link.href === "/ai"
                    ? "text-foreground"
                    : "transition-colors hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </SiteNav>

      <main id="main-content" data-testid="ai-page">
        <section className="hero-lamplight lab-grid border-b border-border">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <p className="mono-label text-primary">Lamplit Light · sovereign AI</p>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              AI that runs <span className="lamplit-text">where you are.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              We build small, specialised models you host yourself - in a
              browser, on a laptop, on-prem, in your private cloud, inside your
              app or on the edge. Your data never leaves. The weights are yours.
            </p>
            {lightDomain && (
              <p
                data-testid="ai-status"
                className="mono-label mt-6 text-muted-foreground"
              >
                {lightIsLive
                  ? `Live · also at ${lightDomain}`
                  : `In development · public site coming to ${lightDomain}`}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#models" className={primaryLinkClassName}>
                See the models
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href={commissionHref} className={secondaryLinkClassName}>
                <Mail className="h-4 w-4" />
                Ask for a model for your job
              </a>
            </div>
          </div>
        </section>

        <section aria-labelledby="ai-sovereign" className="mx-auto max-w-5xl px-4 py-16">
          <p className="mono-label text-primary">Sovereign AI</p>
          <h2 id="ai-sovereign" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Your model. Your machines. Your rules.
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Sovereign means you hold the weights, you run them on hardware you
            control, and nobody else decides when the model changes, what it
            costs or who reads the traffic.
          </p>
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {sovereignty.map((item) => (
              <li key={item.title} className="glass flex gap-4 rounded-2xl p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold">{item.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {item.text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="ai-runtimes" className="border-y border-border bg-muted/30">
          <div className="mx-auto max-w-5xl px-4 py-16">
            <p className="mono-label text-primary">Where it runs</p>
            <h2 id="ai-runtimes" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              One model, every place you work
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {runtimes.map((runtime) => (
                <li key={runtime.title} className="glass rounded-2xl p-5">
                  <runtime.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="mt-4 block text-sm font-semibold">{runtime.title}</span>
                  <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                    {runtime.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="models" aria-labelledby="ai-models" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16">
          <p className="mono-label text-primary">Models</p>
          <h2 id="ai-models" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            What you can take home today
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Each model does one job. Each one ships only after it passes every
            release gate on a {aiSuiteScenarios}-scenario suite, and these are
            the numbers it was measured on.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {aiModels.map((model) => {
              const facts = factsGate(model);
              const passed = gatesPassed(model);
              return (
                <article
                  key={model.id}
                  data-testid="ai-model-card"
                  aria-labelledby={`model-${model.id}`}
                  className="glass flex flex-col rounded-3xl p-6 sm:p-7"
                >
                  <p className="mono-label text-muted-foreground">
                    {model.line} · {model.edition} edition
                  </p>
                  <h3 id={`model-${model.id}`} className="mt-2 text-xl font-semibold">
                    {model.label}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {model.pitch}
                  </p>

                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-5 text-sm">
                    <div>
                      <dt className="mono-label text-muted-foreground">Parameters</dt>
                      <dd className="mt-1">{model.paramsBillions} billion</dd>
                    </div>
                    <div>
                      <dt className="mono-label text-muted-foreground">Facts</dt>
                      <dd className="mt-1">
                        {facts ? `${formatShare(facts.actual)} (gate ${formatShare(facts.threshold)})` : "not measured"}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="mono-label text-muted-foreground">Runs in</dt>
                      <dd className="mt-1">{model.runsIn}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="mono-label text-muted-foreground">Size</dt>
                      <dd className="mt-1">{model.size}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="mono-label text-muted-foreground">Licence</dt>
                      <dd className="mt-1">{model.licence}</dd>
                    </div>
                  </dl>

                  <details className="group mt-5 rounded-xl border border-border px-4 py-3 text-sm">
                    <summary className="cursor-pointer font-medium" data-testid="ai-model-gates">
                      {passed}/{model.gates.length} release gates passed · measured{" "}
                      {formatLastUpdated(model.measuredAt)}
                    </summary>
                    <table className="mt-3 w-full text-left">
                      <caption className="sr-only">
                        Release gates for {model.label}
                      </caption>
                      <thead>
                        <tr className="text-muted-foreground">
                          <th scope="col" className="py-1 font-normal">Gate</th>
                          <th scope="col" className="py-1 text-right font-normal">Measured</th>
                          <th scope="col" className="py-1 text-right font-normal">Needed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {model.gates.map((gate) => (
                          <tr key={gate.key} className="border-t border-border/60">
                            <th scope="row" className="py-1.5 pr-2 font-normal">
                              {gate.actual >= gate.threshold && (
                                <Check className="mr-1.5 inline h-3.5 w-3.5 text-primary" aria-label="passed" />
                              )}
                              {gate.label}
                            </th>
                            <td className="py-1.5 text-right tabular-nums">{formatShare(gate.actual)}</td>
                            <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                              {formatShare(gate.threshold)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>

                  <div className="mt-6 flex flex-wrap gap-3 pt-1">
                    {model.hubSpace && (
                      <OutboundLink
                        href={huggingFaceSpaceUrl(model.hubSpace)}
                        target="_blank"
                        rel="noopener noreferrer"
                        trackingTarget={`${model.id}_try`}
                        trackingContext="ai_page"
                        trackingUrl={huggingFaceSpaceUrl(model.hubSpace)}
                        className={primaryLinkClassName}
                      >
                        Try it in your browser
                        <ArrowUpRight className="h-4 w-4" />
                      </OutboundLink>
                    )}
                    <OutboundLink
                      href={huggingFaceModelUrl(model.hubRepo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      trackingTarget={`${model.id}_weights`}
                      trackingContext="ai_page"
                      trackingUrl={huggingFaceModelUrl(model.hubRepo)}
                      className={model.hubSpace ? secondaryLinkClassName : primaryLinkClassName}
                    >
                      <HuggingFaceIcon className="h-4 w-4" />
                      Weights on Hugging Face
                    </OutboundLink>
                  </div>
                </article>
              );
            })}
          </div>

          <p data-testid="ai-data-source" className="mt-6 text-xs text-muted-foreground">
            Numbers from the Lamplit Light release gates as of{" "}
            {formatLastUpdated(aiDataSource.generatedAt)}. Each model&apos;s date
            is when its gates ran; a newer version replaces it here once it
            passes.
          </p>
        </section>

        <section className="hero-lamplight border-t border-border">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Have a job for a model?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Tell us the task, where it has to run and what a right answer
              looks like. We will tell you whether a small model can do it -
              and show you the measurement before you sign anything.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={commissionHref} className={primaryLinkClassName}>
                <Mail className="h-4 w-4" />
                {contactEmail}
              </a>
              <OutboundLink
                href={socialLinks.huggingface}
                target="_blank"
                rel="noopener noreferrer"
                trackingTarget="huggingface"
                trackingContext="ai_page"
                trackingUrl={socialLinks.huggingface}
                className={secondaryLinkClassName}
              >
                <HuggingFaceIcon className="h-4 w-4" />
                Lamplit Labs on Hugging Face
              </OutboundLink>
              <Link href="/products/light" className={secondaryLinkClassName}>
                Lamplit Light product page
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
