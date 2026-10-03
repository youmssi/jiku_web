import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { BreadcrumbJsonLd, FaqJsonLd, LocalBusinessJsonLd, OrganizationJsonLd } from "@/components/modules/seo";
import { Link } from "@/i18n/navigation";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";
import { PearlBackdrop } from "./backdrops";
import { ClosingCta, CLOSING_OUTLINE } from "./closing-cta";
import { LANDING_CONTENT, type LandingLocale } from "./content";
import { MarketingHeader } from "./marketing-header";

/**
 * Dedicated FAQ page (JIKU-63, JIKU-197, JIKU-224): every question, in the
 * visitor's language, from the same content the landing page's short FAQ
 * shows, so the two never drift apart. Pearl hero, answers mounted while
 * closed so search engines read them, and the shared closing band.
 */
export function FaqPage({ locale, siteUrl }: { locale: LandingLocale; siteUrl: string }) {
  const { faq, nav, cta } = LANDING_CONTENT[locale];
  const prefix = locale === "fr" ? "" : `/${locale}`;
  const other: LandingLocale = locale === "fr" ? "en" : "fr";

  return (
    <div className="flex flex-1 flex-col bg-background">
      <OrganizationJsonLd siteUrl={siteUrl} />
      <LocalBusinessJsonLd siteUrl={siteUrl} />
      <BreadcrumbJsonLd
        items={[
          { name: faq.page.home, url: `${siteUrl}${prefix}` },
          { name: "FAQ", url: `${siteUrl}${prefix}${SEO_ROUTES.FAQ}` },
        ]}
      />
      <FaqJsonLd items={faq.items} locale={locale} />

      <MarketingHeader
        nav={{
          home: faq.page.home,
          signIn: nav.signIn,
          createAccount: nav.register,
          switchLocale: { label: nav.switchLocale.label, locale: other, ariaLabel: nav.switchLocale.ariaLabel },
        }}
        path={SEO_ROUTES.FAQ}
      />

      <section className="relative overflow-hidden">
        <PearlBackdrop />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <nav aria-label={faq.page.breadcrumb} className="mb-6 text-sm text-muted-foreground">
            <Link href={ROUTES.HOME} className="hover:text-foreground">
              {faq.page.home}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">FAQ</span>
          </nav>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <JikūLogo variant="mark" className="size-3.5" />
            <span className="text-shine">FAQ</span>
          </div>
          <h1 className="animate-blur-in text-balance text-4xl font-bold tracking-tight sm:text-5xl">{faq.page.heading}</h1>
          <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground animate-blur-in [animation-delay:150ms] sm:text-lg">
            {faq.page.intro}
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pt-12 pb-16 sm:pb-20">
        <Accordion type="single" collapsible className="rounded-3xl border border-border/60 bg-card/60 px-6 sm:px-8">
          {faq.items.map((item, i) => (
            <AccordionItem key={item.question} value={`faq-${i}`} className="last:border-b-0">
              <AccordionTrigger headingLevel={2} className="py-5 text-left text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent forceMount className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <section className="mt-20">
          <ClosingCta heading={cta.heading} text={cta.text}>
            <Button asChild size="lg" variant="secondary" className="h-12 rounded-full px-8 text-base">
              <Link href={ROUTES.REGISTER}>
                {cta.primaryCta}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className={CLOSING_OUTLINE}>
              <Link href={ROUTES.LOGIN}>{cta.secondaryCta}</Link>
            </Button>
          </ClosingCta>
        </section>
      </main>
    </div>
  );
}
