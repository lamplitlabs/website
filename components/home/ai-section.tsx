import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Blocks,
  Check,
  Laptop,
  MonitorSmartphone,
  Router,
  Server,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { HuggingFaceIcon } from "@/components/icons";
import { OutboundLink } from "@/components/outbound-link";
import { RevealSection } from "@/components/home/reveal-section";
import { socialLinks } from "@/lib/site-data";

const lightHomeUrl = "https://ai.lamplitlabs.com";
const lightTryUrl = "https://ai.lamplitlabs.com/try";

interface RuntimeCard {
  index: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

const runtimes: RuntimeCard[] = [
  {
    index: "01",
    title: "Browser",
    desc: "Runs on WebGPU or WASM through transformers.js. Nothing leaves the tab.",
    icon: MonitorSmartphone,
  },
  {
    index: "02",
    title: "Laptop",
    desc: "Local sessions on hardware already in your hands.",
    icon: Laptop,
  },
  {
    index: "03",
    title: "On-prem / private cloud",
    desc: "Your servers, your network. The same exported model.",
    icon: Server,
  },
  {
    index: "04",
    title: "Inside your app",
    desc: "Embedded where your product already runs, with no round trip.",
    icon: Blocks,
  },
  {
    index: "05",
    title: "Edge / IoT",
    desc: "Small enough to ship close to the signal.",
    icon: Router,
  },
];

interface BuildStep {
  index: string;
  title: string;
  desc: string;
}

const buildSteps: BuildStep[] = [
  {
    index: "01",
    title: "Define the job",
    desc: "A narrow purpose and a clear bar the model has to clear.",
  },
  {
    index: "02",
    title: "Gather verified knowledge",
    desc: "Ground the model in source material that can be checked.",
  },
  {
    index: "03",
    title: "Distil from a teacher",
    desc: "A large model answers thousands of prompts for the job; its answers become the lesson.",
  },
  {
    index: "04",
    title: "Train a student",
    desc: "A small model learns to reproduce them. Every student is named light-<purpose>-<version>.",
  },
  {
    index: "05",
    title: "Measure",
    desc: "Deterministic release gates and an independent judge panel decide what ships.",
  },
  {
    index: "06",
    title: "Compress and ship",
    desc: "Exported to ONNX and quantised, it loads straight into transformers.js.",
  },
];

const familyPoints: { key: string; text: ReactNode }[] = [
  {
    key: "one-job",
    text: (
      <>
        One clearly defined job per model, named{" "}
        <code className="whitespace-nowrap font-mono text-[0.8125rem] text-foreground/90">
          light-&lt;purpose&gt;-&lt;version&gt;
        </code>
        .
      </>
    ),
  },
  {
    key: "release-facts",
    text: "Every release lists its purpose, base model, size, licence and gate result.",
  },
  {
    key: "runs-where-it-fits",
    text: "Models that fit run in the browser; the rest run on hardware you control.",
  },
  {
    key: "data-stays",
    text: "Your prompts and data stay on the device or server you run the model on.",
  },
];

function ModelDistillationIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 360 300"
      className="h-full min-h-[260px] w-full text-primary"
    >
      <defs>
        <linearGradient id="teacher-core" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <rect
        x="102"
        y="52"
        width="156"
        height="216"
        rx="28"
        className="fill-background stroke-primary/30"
        strokeWidth="2"
      />
      <rect
        x="116"
        y="72"
        width="128"
        height="168"
        rx="16"
        className="fill-card stroke-border"
        strokeWidth="1"
      />
      <circle cx="180" cy="250" r="5" className="fill-primary/60" />
      <circle cx="118" cy="98" r="62" fill="url(#teacher-core)" />
      <circle cx="118" cy="98" r="42" className="fill-primary/10" />
      <path
        d="M158 106 C198 122 209 138 220 160 C205 184 190 194 158 205"
        className="fill-primary/10 stroke-primary/30"
        strokeWidth="2"
      />
      <path
        d="M146 118 C178 134 188 146 198 160 C188 174 178 184 146 197"
        className="fill-primary/20 stroke-primary/40"
        strokeWidth="2"
      />
      <circle cx="180" cy="160" r="24" className="fill-primary" />
      <circle cx="180" cy="160" r="44" className="fill-primary/10" />
      <path
        d="M206 160 H232"
        className="stroke-primary/50"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M72 224 H288"
        className="stroke-border"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M88 232 H272"
        className="stroke-primary/20"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function AiSection() {
  return (
    <section id="ai" className="lab-grid border-t">
      <div className="mx-auto max-w-5xl px-4 py-24">
        <RevealSection className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            Lamplit Light &middot; our AI lab
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            AI that runs{" "}
            <span className="lamplit-text">where you are.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            We build small, specialised models you host yourself - in a browser,
            on a laptop, on-prem, in your private cloud, inside your app or on
            the edge. Your data never leaves. The weights are yours.
          </p>
          <p className="mono-label mt-5 text-primary">
            small models &middot; hosted by you &middot; no data leaves
          </p>
        </RevealSection>

        <div className="mt-16">
          <RevealSection className="mb-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mono-label text-primary">where it runs</p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                  The runtime changes, the model does not.
                </h3>
              </div>
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                Sovereign means you hold the weights, control the hardware, and
                decide when models change, what they cost, and who reads traffic.
              </p>
            </div>
          </RevealSection>

          <RevealSection className="reveal-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {runtimes.map((runtime) => (
              <article
                key={runtime.title}
                className="glass glass-lift rounded-2xl p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="mono-label text-primary">
                    {runtime.index}
                  </span>
                  <span className="rounded-lg bg-primary/10 p-2 text-primary">
                    <runtime.icon className="h-4 w-4" />
                  </span>
                </div>
                <h4 className="mt-5 font-semibold">{runtime.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {runtime.desc}
                </p>
              </article>
            ))}
          </RevealSection>
        </div>

        <div className="mt-16">
          <RevealSection className="mb-6 text-center">
            <p className="mono-label text-primary">how a model is built</p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              A high-level path from job to shipped runtime.
            </h3>
          </RevealSection>

          <RevealSection>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute bottom-5 left-5 top-5 w-px bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 lg:bottom-auto lg:left-0 lg:right-0 lg:top-6 lg:h-px lg:w-auto lg:bg-gradient-to-r"
              />
              <ol className="grid gap-5 lg:grid-cols-6 lg:gap-4">
                {buildSteps.map((step, index) => (
                  <li key={step.index} className="relative flex gap-4 lg:block">
                    <span
                      className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background text-primary shadow-[0_0_22px_hsl(var(--glow)/0.22)] motion-safe:animate-pulse"
                      style={{
                        animationDelay: `${index * 1.2}s`,
                        animationDuration: "7.2s",
                      }}
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </span>
                    <div className="glass rounded-2xl p-4 lg:mt-5">
                      <p className="mono-label text-primary">{step.index}</p>
                      <h4 className="mt-2 font-semibold">{step.title}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </RevealSection>
        </div>

        <RevealSection className="mt-16">
          <div className="glass grid gap-8 rounded-2xl p-6 sm:grid-cols-[1.2fr_1fr] sm:p-8">
            <div>
              <p className="mono-label text-primary">the model family</p>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">
                One job per model. Every model yours to run.
              </h3>
              <ul className="mt-6 space-y-3">
                {familyPoints.map((point) => (
                  <li
                    key={point.key}
                    className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{point.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--glow)/0.75)]" />
                In development &middot; public site coming to ai.lamplitlabs.com
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <OutboundLink
                  href={lightHomeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  trackingTarget="light"
                  trackingContext="ai_section"
                  trackingUrl={lightHomeUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Explore Lamplit Light
                  <ArrowUpRight className="h-4 w-4" />
                </OutboundLink>
                <OutboundLink
                  href={lightTryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  trackingTarget="light_try"
                  trackingContext="ai_section"
                  trackingUrl={lightTryUrl}
                  className="inline-flex items-center justify-center rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Try a model in your browser
                </OutboundLink>
                <OutboundLink
                  href={socialLinks.huggingface}
                  target="_blank"
                  rel="noopener noreferrer"
                  trackingTarget="huggingface"
                  trackingContext="ai_section"
                  trackingUrl={socialLinks.huggingface}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <HuggingFaceIcon className="h-4 w-4" />
                  Lamplit Labs on Hugging Face
                </OutboundLink>
                <Link
                  href="/products/light"
                  className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Product details &rarr;
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center rounded-2xl bg-primary/5 text-primary">
              <ModelDistillationIllustration />
            </div>
          </div>
        </RevealSection>

        <RevealSection className="mx-auto mt-8 max-w-3xl text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every model is measured before it ships. The release gates and the
            judge panel decide, and the numbers are published on the AI site
            &mdash; including the ones that fail.
          </p>
        </RevealSection>
      </div>
    </section>
  );
}
