import { CalendarPlus, LineChart, Send, UserCheck, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/effects";
import type { LandingContent } from "./content";
import { SectionHeading } from "./section-heading";

const STEP_ICONS: LucideIcon[] = [CalendarPlus, Send, UserCheck, LineChart];

export function HowItWorksSection({ content }: { content: LandingContent["howItWorks"] }) {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-t border-border/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading badge={content.badge} heading={content.heading} subheading={content.subheading} />
        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.steps.map((step, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <Reveal key={step.title} delay={index * 0.08}>
                <li className="relative h-full rounded-2xl border border-border/50 bg-card p-6">
                  <span className="absolute right-5 top-5 text-4xl font-bold text-primary/15" aria-hidden>
                    {index + 1}
                  </span>
                  {Icon ? <Icon className="size-6 text-primary" aria-hidden /> : null}
                  <h3 className="mt-5 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
