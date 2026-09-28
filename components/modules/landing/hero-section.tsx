import { ArrowRight, CalendarDays, Check, Clock3, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { TrackedLink } from "@/components/shared";
import { Link } from "@/i18n/navigation";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";
import { CardSample } from "./card-sample";
import type { LandingContent } from "./content";

/**
 * The promise, the one action that matters, and the product itself: a real
 * card in the Modern style with the ticket a "yes" receives. Server rendered,
 * no JavaScript, so the first paint is the whole message.
 */
export function HeroSection({
  content,
  card,
  siteUrl,
}: {
  content: LandingContent["hero"];
  card: LandingContent["cards"]["samples"][number];
  siteUrl: string;
}) {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[10%] -top-[25%] size-[50vw] max-h-[640px] max-w-[640px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-12 sm:pb-20 lg:grid-cols-[1.15fr_0.85fr] lg:pb-28">
        <div className="text-center lg:text-left">
          <a
            href="#cards"
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-medium sm:text-sm text-primary transition hover:border-primary/40"
          >
            <JikūLogo variant="mark" className="size-3.5" />
            {content.badge}
            <ArrowRight className="size-3.5" aria-hidden />
          </a>

          <h1 className="text-balance text-[clamp(2.3rem,6vw,4.4rem)] font-bold leading-[1.03] tracking-tight">
            {content.headline}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg lg:mx-0">{content.subtitle}</p>

          <div id="hero-cta" className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
            <Button asChild size="lg" className="h-12 w-full rounded-full px-8 text-base shadow-lg shadow-primary/25 sm:w-auto">
              <TrackedLink
                href={ROUTES.REGISTER}
                eventName="cta_click"
                eventProperties={{ location: "hero", label: content.primaryCta }}
              >
                {content.primaryCta}
                <ArrowRight className="ml-2 size-4" />
              </TrackedLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-full px-8 text-base sm:w-auto">
              <Link href={SEO_ROUTES.SIMULATOR}>{content.secondaryCta}</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{content.ctaNote}</p>

          <div className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
            <a
              href="#events"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm font-medium transition hover:border-primary/40"
            >
              <CalendarDays className="size-4 text-primary" aria-hidden />
              {content.uses.events}
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm font-medium transition hover:border-primary/40"
            >
              <Clock3 className="size-4 text-primary" aria-hidden />
              {content.uses.services}
            </a>
          </div>
        </div>

        <figure className="relative mx-auto w-full max-w-[17rem] pb-10 sm:max-w-[22rem] lg:max-w-[24rem]">
          <figcaption className="sr-only">{content.card.alt}</figcaption>
          <CardSample sample={card} invites={content.card.invites} url={siteUrl} size="lg" className="rotate-[-2deg]" />
          <div aria-hidden className="absolute -right-10 top-[46%] hidden flex-col gap-1.5 sm:flex">
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
            className="absolute -left-3 bottom-0 flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-xl sm:-left-10"
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
        </figure>
      </div>
    </section>
  );
}
