import { ArrowRight } from "lucide-react";
import { CardStack } from "@/components/effects";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/shared";
import { ROUTES } from "@/lib/constants";
import { SilverBackdrop } from "./backdrops";
import { CardSample } from "./card-sample";
import type { LandingContent } from "./content";
import { SectionHeading } from "./section-heading";

/**
 * The shareable card (JIKU-184, JIKU-194, JIKU-221): the three styles in a pile
 * to drag or tap through, over a silver aurora, then the three steps from the
 * style to the yeses.
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

        <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-border/60 bg-zinc-50 sm:mt-14">
          <SilverBackdrop />
          <div className="relative grid items-center gap-10 px-6 py-12 md:grid-cols-2 md:px-12 lg:py-16">
            <ul className="flex flex-wrap justify-center gap-2 md:flex-col md:items-start">
              {content.samples.map((sample) => (
                <li key={sample.style} className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-semibold backdrop-blur">
                  {content.styles[sample.style]}
                </li>
              ))}
            </ul>
            <div className="mx-auto aspect-[4/5] w-full max-w-[16rem] sm:max-w-[18rem]">
              <CardStack
                label={content.heading}
                cards={content.samples.map((sample) => (
                  <CardSample key={sample.style} sample={sample} invites={invites} url={siteUrl} size="lg" className="pointer-events-none size-full" />
                ))}
              />
            </div>
          </div>
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
