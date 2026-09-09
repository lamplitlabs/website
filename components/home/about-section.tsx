import { Code2, Globe, Heart, Users } from "lucide-react";
import { RevealSection } from "@/components/home/reveal-section";

const aboutItems = [
  {
    icon: Code2,
    title: "Built with care",
    desc: "Every product is crafted to solve a specific, real-world problem - no fluff, just useful software.",
  },
  {
    icon: Users,
    title: "Thousands of users",
    desc: "Our tools are used by thousands of people across Germany and beyond, every day.",
  },
  {
    icon: Globe,
    title: "Germany and beyond",
    desc: "From visual AI agents to medical prep, citizenship, and developer tools - built locally, used globally.",
  },
  {
    icon: Heart,
    title: "Accessible first",
    desc: "We are committed to keeping our tools accessible and free where possible.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="border-t">
      <div className="mx-auto max-w-5xl px-4 py-24">
        <RevealSection className="mb-14 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">About Us</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Lamplit Labs builds the visual AI agent builder Amistio alongside
            practical tools for education, careers, developer workflows, and
            compliance.
          </p>
        </RevealSection>

        <RevealSection>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aboutItems.map((item) => (
              <div
                key={item.title}
                className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:border-foreground/10 hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-lg bg-muted p-2.5 transition-colors group-hover:bg-foreground/10">
                  <item.icon className="h-5 w-5 text-foreground/70" />
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
