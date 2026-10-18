import { ArrowRight, Check, CreditCard, HandCoins, Minus } from "lucide-react";
import { TrackedLink } from "@/components/shared";
import { MotionProvider, SpotlightCard } from "@/components/effects";
import { BreadcrumbJsonLd } from "@/components/modules/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";
import { salesMailto } from "@/lib/support";
import { cn } from "@/lib/utils";
import { PearlBackdrop } from "./backdrops";
import { ClosingCta, CLOSING_OUTLINE } from "./closing-cta";
import { MarketingFooter } from "./footer-section";
import { MarketingHeader } from "./marketing-header";
import { PricingCalculator } from "./pricing-calculator";
import type { PricingContent } from "./pricing-content";
import { PricingJsonLd } from "./pricing-json-ld";

/**
 * The /pricing page (ADR 109): the offers, a one-question calculator, what
 * each offer includes, and how payment works. Only the calculator runs in the
 * browser.
 */
export function PricingPage({
  content,
  locale,
  siteUrl,
}: {
  content: PricingContent;
  locale: "fr" | "en";
  siteUrl: string;
}) {
  const path = locale === "fr" ? SEO_ROUTES.PRICING : `/en${SEO_ROUTES.PRICING}`;

  return (
    <MotionProvider>
      <div className="flex flex-1 flex-col bg-background">
        <PricingJsonLd content={content} url={`${siteUrl}${path}`} />
        <BreadcrumbJsonLd
          items={[
            { name: content.nav.home, url: siteUrl },
            { name: content.eyebrow, url: `${siteUrl}${path}` },
          ]}
        />

        <MarketingHeader nav={content.nav} path={SEO_ROUTES.PRICING} />

        <main id="main" className="flex flex-1 flex-col">
          <section className="relative overflow-hidden">
            <PearlBackdrop />
            <div className="relative mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-sm font-medium backdrop-blur">
                <JikūLogo variant="mark" className="size-3.5" />
                <span className="text-shine">{content.eyebrow}</span>
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">{content.title}</h1>
              <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">{content.rule}</p>
            </div>
          </section>

          <div className="mx-auto w-full max-w-6xl flex-1 px-6 pb-16 sm:pb-20">
            <section aria-label={content.eyebrow} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {content.offers.map((offer) => (
                <Card
                  key={offer.id}
                  className={cn("flex flex-col", offer.highlight && "border-primary shadow-lg shadow-primary/10")}
                >
                  <CardHeader className="flex-1">
                    <CardTitle className="text-base">{offer.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{offer.audience}</p>
                    <p className="mt-3 text-2xl font-bold tracking-tight">{offer.price}</p>
                    <p className="text-sm text-muted-foreground">{offer.unit}</p>
                    <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                      {offer.features.map((feature) => (
                        <li key={feature} className="flex gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      asChild
                      className="h-11 w-full rounded-full text-sm"
                      variant={offer.highlight ? "default" : "outline"}
                    >
                      <TrackedLink eventName="cta_click" eventProperties={{ location: `pricing_${offer.id}` }} href={offer.href}>
                        {offer.cta}
                        <ArrowRight className="ml-2 size-4" />
                      </TrackedLink>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </section>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {content.enterprise.text}{" "}
              <a
                href={salesMailto(content.enterprise.mailSubject)}
                className="font-semibold text-foreground underline-offset-4 hover:underline"
              >
                {content.enterprise.cta}
              </a>
            </p>
            <p className="mt-2 text-center text-xs text-muted-foreground">{content.taxNote}</p>

            <section className="mt-16" aria-labelledby="pricing-calculator">
              <PricingCalculator content={content.calculator} locale={locale} />
            </section>

            <section className="mt-16" aria-labelledby="pricing-compare">
              <h2 id="pricing-compare" className="text-xl font-bold tracking-tight">
                {content.compare.heading}
              </h2>
              <div className="mt-6 overflow-hidden rounded-2xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 z-10 min-w-36 bg-background" />
                      {content.offers.map((offer) => (
                        <TableHead key={offer.id} className="min-w-28 text-center font-semibold text-foreground">
                          {offer.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {content.compare.rows.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell className="sticky left-0 z-10 min-w-36 whitespace-normal bg-background font-medium">{row.label}</TableCell>
                        {row.values.map((value, index) => (
                          <TableCell key={content.offers[index].id} className="whitespace-normal text-center">
                            {value === true ? (
                              <Check className="mx-auto size-4 text-primary" aria-label={content.compare.included} />
                            ) : value === false ? (
                              <Minus className="mx-auto size-4 text-muted-foreground" aria-label={content.compare.notIncluded} />
                            ) : (
                              value
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section className="mt-16" aria-labelledby="pricing-extras">
              <h2 id="pricing-extras" className="text-xl font-bold tracking-tight">
                {content.extras.heading}
              </h2>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {content.extras.items.map((item) => (
                  <div key={item.title} className="rounded-2xl border bg-card/60 p-5">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-16" aria-labelledby="pricing-payments">
              <SpotlightCard className="rounded-3xl bg-card/60">
                <h2 id="pricing-payments" className="text-xl font-bold tracking-tight">
                  {content.payments.heading}
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="flex items-center gap-2 font-semibold">
                      <CreditCard className="size-4" aria-hidden />
                      {content.payments.toJiku.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{content.payments.toJiku.text}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {content.payments.toJiku.methods.map((method) => (
                        <li key={method.name}>
                          <Badge variant={method.soon ? "outline" : "secondary"}>
                            {method.name}
                            {method.soon ? ` · ${content.payments.toJiku.soon}` : ""}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 font-semibold">
                      <HandCoins className="size-4" aria-hidden />
                      {content.payments.toYou.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{content.payments.toYou.text}</p>
                  </div>
                </div>
              </SpotlightCard>
            </section>

            <section className="mt-16">
              <ClosingCta heading={content.cta.heading} text={content.cta.text}>
                <Button asChild size="lg" variant="secondary" className="h-12 rounded-full px-8 text-base">
                  <TrackedLink eventName="cta_click" eventProperties={{ location: "pricing_closing" }} href={ROUTES.REGISTER}>
                    {content.cta.primary}
                    <ArrowRight className="ml-2 size-4" />
                  </TrackedLink>
                </Button>
                <Button asChild size="lg" variant="outline" className={CLOSING_OUTLINE}>
                  <Link href={SEO_ROUTES.USE_CASES}>{content.cta.secondary}</Link>
                </Button>
              </ClosingCta>
            </section>
          </div>
        </main>
        <MarketingFooter locale={locale} path={SEO_ROUTES.PRICING} />
      </div>
    </MotionProvider>
  );
}
