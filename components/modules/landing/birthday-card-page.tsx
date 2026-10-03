import { ArrowRight, Check, MessageCircle, Palette, Send, Users } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { Link } from "@/i18n/navigation";
import { cardFontVariables } from "@/lib/card-display-fonts";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";
import { BreadcrumbJsonLd, FaqJsonLd, OrganizationJsonLd } from "@/components/modules/seo";
import { CardSample } from "./card-sample";
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
  const path = locale === "fr" ? SEO_ROUTES.BIRTHDAY_CARD : `/en${SEO_ROUTES.BIRTHDAY_CARD}`;

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-900">
      <OrganizationJsonLd siteUrl={siteUrl} />
      <BreadcrumbJsonLd
        items={[
          { name: content.nav.home, url: siteUrl },
          { name: content.breadcrumb, url: `${siteUrl}${path}` },
        ]}
      />
      <FaqJsonLd items={content.faq.items} locale={locale} />

      <MarketingHeader nav={content.nav} path={SEO_ROUTES.BIRTHDAY_CARD} />

      <main className={`mx-auto w-full max-w-6xl flex-1 px-6 py-16 sm:py-20 ${cardFontVariables}`}>
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <JikūLogo variant="mark" className="size-3.5" />
              {content.eyebrow}
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{content.title}</h1>
            <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              {content.intro}
            </p>
            <Button asChild size="lg" className="mt-8 rounded-full px-8">
              <Link href={ROUTES.REGISTER}>
                {content.primaryCta}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
          <div className="flex justify-center">
            <CardSample sample={content.sample} invites={content.invites} url={siteUrl} size="lg" className="rotate-[-2deg]" />
          </div>
        </section>

        <section aria-labelledby="birthday-steps" className="mt-24">
          <h2 id="birthday-steps" className="text-center text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {content.steps.heading}
          </h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {content.steps.items.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-border/50 bg-card/50 p-6">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="birthday-why" className="mt-24">
          <h2 id="birthday-why" className="text-center text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {content.why.heading}
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {content.why.items.map((item, index) => {
              const Icon = WHY_ICONS[index % WHY_ICONS.length];
              return (
                <article key={item.title} className="flex gap-4 rounded-2xl border border-border/50 bg-card/50 p-6">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="birthday-occasions" className="mt-24 text-center">
          <h2 id="birthday-occasions" className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {content.occasions.heading}
          </h2>
          <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2.5">
            {content.occasions.items.map((occasion) => (
              <li
                key={occasion}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-medium"
              >
                <Check className="size-3.5 text-primary" strokeWidth={2.5} aria-hidden />
                {occasion}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-24 flex flex-col items-start gap-6 rounded-3xl border border-border/50 bg-muted/30 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-xl">
            <h2 className="text-balance text-xl font-bold tracking-tight sm:text-2xl">{content.texts.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{content.texts.text}</p>
          </div>
          <Button asChild variant="outline" size="lg" className="shrink-0 rounded-full px-6">
            <Link href={SEO_ROUTES.BIRTHDAY_TEXTS}>
              {content.texts.cta}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </section>

        <section aria-labelledby="birthday-faq" className="mx-auto mt-24 max-w-3xl">
          <h2 id="birthday-faq" className="text-center text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {content.faq.heading}
          </h2>
          <Accordion type="single" collapsible className="mt-10">
            {content.faq.items.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`}>
                <AccordionTrigger headingLevel={3} className="text-left text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent forceMount className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mt-24 rounded-3xl border border-primary/15 bg-gradient-to-b from-primary/[0.06] to-transparent p-8 text-center sm:p-12">
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">{content.cta.heading}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">{content.cta.text}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href={ROUTES.REGISTER}>
                {content.cta.primary}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link href={SEO_ROUTES.SIMULATOR}>{content.cta.secondary}</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
