import { ArrowRight, CalendarDays, Check, Clock3, QrCode } from "lucide-react";
import { OccasionShowcase } from "@/components/effects";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/shared";
import { Link } from "@/i18n/navigation";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";
import { PearlBackdrop } from "./backdrops";
import { CardSample } from "./card-sample";
import type { LandingContent } from "./content";

/**
 * The promise, the one action that matters, and the product itself (JIKU-221):
 * the headline ends on an occasion that rotates with its card, over a pearl
 * background in the brand's greys. Text, buttons and the first card are in the
 * server HTML; the grain loads afterwards on wide screens only. On a phone the
 * plan link turns into a text link and the two uses step aside (the menu has
 * them), so the card shows on the first screen; the product facts close the
 * hero (JIKU-229).
 */
export function HeroSection({
  content,
  facts,
  siteUrl,
}: {
  content: LandingContent["hero"];
  facts: LandingContent["numbers"];
  siteUrl: string;
}) {
  const cards = content.occasions.map((occasion) => (
    <CardSample key={occasion.label} sample={occasion.card} invites={content.card.invites} url={siteUrl} size="lg" className="size-full shadow-2xl shadow-black/15" />
  ));

  return (
    <section id="hero" className="relative overflow-hidden pt-28 sm:pt-32">
      <PearlBackdrop />

      <div className="relative mx-auto max-w-7xl px-6 pb-12 sm:pb-16">
        <OccasionShowcase
          lead={content.lead}
          sentence={content.sentence}
          occasions={content.occasions.map((occasion) => occasion.label)}
          cards={cards}
          pickLabel={content.pickOccasion}
          overlay={<CardOverlay content={content} />}
        >
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg lg:mx-0">{content.subtitle}</p>

          <div className="mt-8 flex flex-col items-center gap-2 sm:mt-9 sm:flex-row sm:gap-3 lg:items-start">
            <Button asChild size="lg" className="h-12 w-full rounded-full px-8 text-base shadow-xl shadow-black/15 sm:w-auto">
              <TrackedLink
                href={ROUTES.REGISTER}
                eventName="cta_click"
                eventProperties={{ location: "hero", label: content.primaryCta }}
              >
                {content.primaryCta}
                <ArrowRight className="ml-2 size-4" />
              </TrackedLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="hidden h-12 rounded-full bg-background/60 px-8 text-base backdrop-blur sm:inline-flex">
              <Link href={SEO_ROUTES.SIMULATOR}>{content.secondaryCta}</Link>
            </Button>
            <Link
              href={SEO_ROUTES.SIMULATOR}
              className="inline-flex min-h-11 items-center text-sm font-medium underline decoration-foreground/30 underline-offset-4 sm:hidden"
            >
              {content.secondaryCta}
            </Link>
          </div>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-4">{content.ctaNote}</p>

          <div className="mt-8 hidden flex-wrap justify-center gap-2 sm:flex lg:justify-start">
            <a
              href="#events"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background/60 px-4 text-sm font-medium backdrop-blur transition hover:border-foreground/30"
            >
              <CalendarDays className="size-4" aria-hidden />
              {content.uses.events}
            </a>
            <a
              href="#services"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background/60 px-4 text-sm font-medium backdrop-blur transition hover:border-foreground/30"
            >
              <Clock3 className="size-4" aria-hidden />
              {content.uses.services}
            </a>
          </div>
        </OccasionShowcase>

        <dl className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-y-6 border-t border-border/70 pt-8 sm:mt-20 md:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col-reverse items-center px-2 text-center">
              <dt className="mt-1 text-sm text-muted-foreground">{fact.label}</dt>
              <dd className="text-3xl font-bold tracking-tight sm:text-4xl">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** The answers and the ticket a "yes" receives, pinned beside whichever card shows. */
function CardOverlay({ content }: { content: LandingContent["hero"] }) {
  return (
    <>
      <div aria-hidden className="absolute -right-6 top-[46%] hidden flex-col gap-1.5 sm:flex">
        {content.card.answers.map((answer, index) => (
          <span
            key={answer}
            className={
              index === 0
                ? "inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background shadow-lg"
                : "rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
            }
          >
            {index === 0 ? <Check className="size-3.5" /> : null}
            {answer}
          </span>
        ))}
      </div>
      <div
        aria-hidden
        className="absolute -bottom-6 -left-3 flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-xl sm:-left-10"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
          <QrCode className="size-5" />
        </span>
        <span className="text-left">
          <span className="block text-sm font-semibold">{content.card.ticket.guest}</span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-600" />
            {content.card.ticket.status}
          </span>
        </span>
      </div>
    </>
  );
}
