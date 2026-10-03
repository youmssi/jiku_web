import {
  ArrowRight,
  Check,
  MessageCircle,
  Palette,
  Send,
  Users,
} from "lucide-react";
import { MotionProvider, Reveal, SpotlightCard } from "@/components/effects";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { Link } from "@/i18n/navigation";
import { cardFontVariables } from "@/lib/card-display-fonts";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  OrganizationJsonLd,
} from "@/components/modules/seo";
import { PearlBackdrop } from "./backdrops";
import { CardSample } from "./card-sample";
import { ClosingCta, CLOSING_OUTLINE } from "./closing-cta";
import { MarketingHeader } from "./marketing-header";
import type { BirthdayCardPageContent } from "./birthday-content";

const WHY_ICONS = [Palette, MessageCircle, Users, Send];

/**
 * The online birthday invitation card page (JIKU-220): what the card is, how
 * it is sent on WhatsApp, the answers people search for, then the way in.
 */
export function BirthdayCardPage({
  content,
  locale,
  siteUrl,
}: {
  content: BirthdayCardPageContent;
  locale: "fr" | "en";
  siteUrl: string;
}) {
  const path =
    locale === "fr"
      ? SEO_ROUTES.BIRTHDAY_CARD
      : `/en${SEO_ROUTES.BIRTHDAY_CARD}`;

  return (
    <MotionProvider>
      <div className="flex flex-1 flex-col bg-background">
        <OrganizationJsonLd siteUrl={siteUrl} />
        <BreadcrumbJsonLd
          items={[
            { name: content.nav.home, url: siteUrl },
            { name: content.breadcrumb, url: `${siteUrl}${path}` },
          ]}
        />
        <FaqJsonLd items={content.faq.items} locale={locale} />

        <MarketingHeader nav={content.nav} path={SEO_ROUTES.BIRTHDAY_CARD} />

        <section className={`relative overflow-hidden ${cardFontVariables}`}>
          <PearlBackdrop />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
            <div className="text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-sm font-medium backdrop-blur">
                <JikūLogo variant="mark" className="size-3.5" />
                <span className="text-shine">{content.eyebrow}</span>
              </div>
              <h1 className="animate-blur-in text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                {content.title}
              </h1>
              <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground animate-blur-in [animation-delay:150ms] sm:text-lg">
                {content.intro}
              </p>
              <Button
                asChild
                size="lg"
                className="mt-8 h-12 rounded-full px-8 text-base shadow-xl shadow-black/15"
              >
                <Link href={ROUTES.REGISTER}>
                  {content.primaryCta}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-[17rem] animate-float-soft sm:max-w-[21rem]">
                <CardSample
                  sample={content.sample}
                  invites={content.invites}
                  url={siteUrl}
                  size="lg"
                  className="rotate-[-3deg] shadow-2xl shadow-black/15"
                />
              </div>
            </div>
          </div>
        </section>

        <main
          className={`mx-auto w-full max-w-6xl flex-1 px-6 pb-16 sm:pb-20 ${cardFontVariables}`}
        >
          <section aria-labelledby="birthday-steps" className="mt-20">
            <h2
              id="birthday-steps"
              className="text-center text-balance text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {content.steps.heading}
            </h2>
            <ol className="mt-10 grid gap-5 md:grid-cols-3">
              {content.steps.items.map((step, index) => (
                <li key={step.title}>
                  <Reveal
                    delay={index * 0.06}
                    className="h-full rounded-2xl border border-border/50 bg-card/60 p-6"
                  >
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.text}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="birthday-why" className="mt-24">
            <h2
              id="birthday-why"
              className="text-center text-balance text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {content.why.heading}
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {content.why.items.map((item, index) => {
                const Icon = WHY_ICONS[index % WHY_ICONS.length];
                return (
                  <SpotlightCard
                    key={item.title}
                    className="flex gap-4 bg-card/60"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-semibold tracking-tight">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          </section>

          <section
            aria-labelledby="birthday-occasions"
            className="mt-24 text-center"
          >
            <h2
              id="birthday-occasions"
              className="text-balance text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {content.occasions.heading}
            </h2>
            <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2.5">
              {content.occasions.items.map((occasion) => (
                <li
                  key={occasion}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-medium"
                >
                  <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                  {occasion}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-24 flex flex-col items-start gap-6 rounded-3xl border border-border/50 bg-muted/30 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="max-w-xl">
              <h2 className="text-balance text-xl font-bold tracking-tight sm:text-2xl">
                {content.texts.heading}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {content.texts.text}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="shrink-0 rounded-full px-6"
            >
              <Link href={SEO_ROUTES.BIRTHDAY_TEXTS}>
                {content.texts.cta}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </section>

          <section
            aria-labelledby="birthday-faq"
            className="mx-auto mt-24 max-w-3xl"
          >
            <h2
              id="birthday-faq"
              className="text-center text-balance text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {content.faq.heading}
            </h2>
            <Accordion
              type="single"
              collapsible
              className="mt-10 rounded-3xl border border-border/60 bg-card/60 px-6 sm:px-8"
            >
              {content.faq.items.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  value={`faq-${index}`}
                  className="last:border-b-0"
                >
                  <AccordionTrigger
                    headingLevel={3}
                    className="py-5 text-left text-base"
                  >
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent
                    forceMount
                    className="text-sm leading-relaxed text-muted-foreground"
                  >
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section className="mt-24">
            <ClosingCta heading={content.cta.heading} text={content.cta.text}>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-12 rounded-full px-8 text-base"
              >
                <Link href={ROUTES.REGISTER}>
                  {content.cta.primary}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className={CLOSING_OUTLINE}
              >
                <Link href={SEO_ROUTES.SIMULATOR}>{content.cta.secondary}</Link>
              </Button>
            </ClosingCta>
          </section>
        </main>
      </div>
    </MotionProvider>
  );
}
