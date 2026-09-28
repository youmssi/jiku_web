import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/effects";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/shared";
import { ROUTES } from "@/lib/constants";
import { CardSample } from "./card-sample";
import type { LandingContent } from "./content";
import { SectionHeading } from "./section-heading";

/**
 * The shareable card (JIKU-184, JIKU-194): the three styles side by side, then
 * the three steps from the style to the yeses. On a phone the cards scroll
 * sideways, so the section stays one screen tall.
 */
export function CardsSection({
  content,
  invites,
  siteUrl,
}: {
  content: LandingContent["cards"];
  invites: string;
  siteUrl: string;
}) {
  return (
    <section id="cards" className="scroll-mt-24 border-t border-border/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading badge={content.badge} heading={content.heading} subheading={content.subheading} />

        <div className="-mx-6 mt-10 sm:mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 sm:mx-auto sm:grid sm:max-w-4xl sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
          {content.samples.map((sample, index) => (
            <Reveal key={sample.style} delay={index * 0.06} className="w-[64%] shrink-0 snap-center sm:w-auto">
              <CardSample sample={sample} invites={invites} url={siteUrl} />
              <p className="mt-4 text-center text-sm font-semibold">{content.styles[sample.style]}</p>
            </Reveal>
          ))}
        </div>

        <ol className="mx-auto mt-10 sm:mt-14 grid max-w-5xl gap-8 sm:grid-cols-3">
          {content.steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="h-12 rounded-full px-8">
            <TrackedLink href={ROUTES.REGISTER} eventName="cta_click" eventProperties={{ location: "cards", label: content.cta }}>
              {content.cta}
              <ArrowRight className="ml-2 size-4" />
            </TrackedLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
