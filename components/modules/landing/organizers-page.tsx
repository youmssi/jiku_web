import {
  ArrowRight,
  Check,
  LayoutList,
  Palette,
  ScanLine,
  Smartphone,
} from "lucide-react";
import { TrackedLink } from "@/components/shared";
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
import { DOCS_ROUTE, ROUTES, SEO_ROUTES } from "@/lib/constants";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
} from "@/components/modules/seo";
import { PearlBackdrop } from "./backdrops";
import { CardSample } from "./card-sample";
import { ClosingCta, CLOSING_OUTLINE } from "./closing-cta";
import { MarketingFooter } from "./footer-section";
import { MarketingHeader } from "./marketing-header";
import type { OrganizersPageContent } from "./organizers-content";

const WHY_ICONS = [LayoutList, ScanLine, Palette, Smartphone];

/**
 * The page for professional event organizers (JIKU-266): wedding planners,
 * agencies and venues. It speaks only of invitations, tickets and the door,
 * shows Pro Organisateur and how to put it in a client's quote, then the
 * way in. The launch ads and the sales assistant link here.
 */
export function OrganizersPage({
  content,
  locale,
  siteUrl,
}: {
  content: OrganizersPageContent;
  locale: "fr" | "en";
  siteUrl: string;
}) {
  const path =
    locale === "fr" ? SEO_ROUTES.ORGANIZERS : `/en${SEO_ROUTES.ORGANIZERS}`;

  return (
    <MotionProvider>
      <div className="flex flex-1 flex-col bg-background">
        <BreadcrumbJsonLd
          items={[
            { name: content.nav.home, url: siteUrl },
            { name: content.breadcrumb, url: `${siteUrl}${path}` },
          ]}
        />
        <FaqJsonLd items={content.faq.items} locale={locale} />

        <MarketingHeader nav={content.nav} path={SEO_ROUTES.ORGANIZERS} />

        <main id="main" className="flex flex-1 flex-col">
          <section className={`relative overflow-hidden ${cardFontVariables}`}>
            <PearlBackdrop />
            <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
              <div className="text-center lg:text-left">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-sm font-medium backdrop-blur">
                  <JikūLogo variant="mark" className="size-3.5" />
                  <span className="text-shine">{content.eyebrow}</span>
                </div>
                <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                  {content.title}
                </h1>
                <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {content.intro}
                </p>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-full px-8 text-base shadow-xl shadow-black/15"
                  >
                    <TrackedLink eventName="cta_click" eventProperties={{ location: "organizers_hero" }} href={ROUTES.REGISTER}>
                      {content.primaryCta}
                      <ArrowRight className="ml-2 size-4" />
                    </TrackedLink>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8 text-base">
                    <Link href={SEO_ROUTES.PRICING}>{content.secondaryCta}</Link>
                  </Button>
                </div>
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

          <div className="mx-auto w-full max-w-6xl flex-1 px-6 pb-16 sm:pb-20">
            <section aria-labelledby="organizers-steps" className="mt-20">
              <h2
                id="organizers-steps"
                className="text-center text-balance text-2xl font-bold tracking-tight sm:text-3xl"
              >
                {content.steps.heading}
              </h2>
              <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className="mt-8 text-center">
                <Link
                  href={`${DOCS_ROUTE}/guest-list`}
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
                >
                  {content.steps.guide}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </p>
            </section>

            <section aria-labelledby="organizers-why" className="mt-24">
              <h2
                id="organizers-why"
                className="text-center text-balance text-2xl font-bold tracking-tight sm:text-3xl"
              >
                {content.why.heading}
              </h2>
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {content.why.items.map((item, index) => {
                  const Icon = WHY_ICONS[index % WHY_ICONS.length];
                  return (
                    <SpotlightCard key={item.title} className="flex gap-4 bg-card/60">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <div>
                        <h3 className="font-semibold tracking-tight">{item.title}</h3>
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
              aria-labelledby="organizers-pack"
              className="mt-24 grid gap-6 rounded-3xl border border-border/50 bg-muted/30 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr]"
            >
              <div>
                <h2
                  id="organizers-pack"
                  className="text-balance text-2xl font-bold tracking-tight sm:text-3xl"
                >
                  {content.pack.heading}
                </h2>
                <p className="mt-4">
                  <span className="text-3xl font-bold tracking-tight sm:text-4xl">{content.pack.price}</span>{" "}
                  <span className="text-muted-foreground">{content.pack.per}</span>
                </p>
                <ul className="mt-6 flex flex-col gap-3">
                  {content.pack.includes.map((line) => (
                    <li key={line} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                      <Check className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-between gap-6 rounded-2xl border border-border/50 bg-background p-5 sm:p-6">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{content.pack.resell.heading}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {content.pack.resell.text}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{content.pack.note}</p>
              </div>
            </section>

            <section aria-labelledby="organizers-faq" className="mx-auto mt-24 max-w-3xl">
              <h2
                id="organizers-faq"
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
                  <AccordionItem key={item.question} value={`faq-${index}`} className="last:border-b-0">
                    <AccordionTrigger headingLevel={3} className="items-center py-5 text-left text-base">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent forceMount className="text-base leading-relaxed text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            <section className="mt-24">
              <ClosingCta heading={content.cta.heading} text={content.cta.text}>
                <Button asChild size="lg" variant="secondary" className="h-12 rounded-full px-8 text-base">
                  <TrackedLink eventName="cta_click" eventProperties={{ location: "organizers_closing" }} href={ROUTES.REGISTER}>
                    {content.cta.primary}
                    <ArrowRight className="ml-2 size-4" />
                  </TrackedLink>
                </Button>
                <Button asChild size="lg" variant="outline" className={CLOSING_OUTLINE}>
                  <Link href={SEO_ROUTES.PRICING}>{content.cta.secondary}</Link>
                </Button>
              </ClosingCta>
            </section>
          </div>
        </main>
        <MarketingFooter locale={locale} path={SEO_ROUTES.ORGANIZERS} />
      </div>
    </MotionProvider>
  );
}
