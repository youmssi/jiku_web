import { ArrowRight, CreditCard, HandCoins, Layers } from "lucide-react";
import { MotionProvider, SpotlightCard } from "@/components/effects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { Link } from "@/i18n/navigation";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";
import {
  OrganizationJsonLd,
  LocalBusinessJsonLd,
  BreadcrumbJsonLd,
} from "@/components/modules/seo";
import { PearlBackdrop } from "./backdrops";
import { ClosingCta, CLOSING_OUTLINE } from "./closing-cta";
import { MarketingHeader } from "./marketing-header";
import { PricingJsonLd } from "./pricing-json-ld";
import { SimulatorCalculator } from "./simulator-calculator";
import type { SimulatorContent } from "./simulator-content";

/**
 * The /simulator pricing page. The rule that picks the model, the payment
 * circuits and the call to action are server-rendered; the plan finder and the
 * three calculators are client components.
 */
export function SimulatorPage({
  content,
  locale,
  siteUrl,
}: {
  content: SimulatorContent;
  locale: "fr" | "en";
  siteUrl: string;
}) {
  const path = locale === "fr" ? "/simulator" : "/en/simulator";

  return (
    <MotionProvider>
      <div className="flex flex-1 flex-col bg-background">
        <OrganizationJsonLd siteUrl={siteUrl} />
        <LocalBusinessJsonLd siteUrl={siteUrl} />
        <PricingJsonLd content={content} url={`${siteUrl}${path}`} />
        <BreadcrumbJsonLd
          items={[
            { name: content.nav.home, url: siteUrl },
            { name: content.title, url: `${siteUrl}${path}` },
          ]}
        />

        <MarketingHeader nav={content.nav} path={SEO_ROUTES.SIMULATOR} />

        <section className="relative overflow-hidden">
          <PearlBackdrop />
          <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-sm font-medium backdrop-blur">
              <JikūLogo variant="mark" className="size-3.5" />
              <span className="text-shine">{content.eyebrow}</span>
            </div>
            <h1 className="animate-blur-in text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              {content.title}
            </h1>
            <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground animate-blur-in [animation-delay:150ms] sm:text-lg">
              {content.rule}
            </p>
          </div>
        </section>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-16 sm:pb-20">
          <div className="mt-12">
            <SimulatorCalculator content={content} locale={locale} />
          </div>

          <section
            className="mt-20 grid gap-5 lg:grid-cols-3"
            aria-labelledby="simulator-payments"
          >
            <SpotlightCard className="rounded-3xl bg-card/60 lg:col-span-2">
              <h2
                id="simulator-payments"
                className="text-xl font-bold tracking-tight"
              >
                {content.payments.heading}
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    <CreditCard className="size-4" aria-hidden />
                    {content.payments.toJiku.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {content.payments.toJiku.text}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {content.payments.toJiku.methods.map((method) => (
                      <li key={method.name}>
                        <Badge variant={method.soon ? "outline" : "secondary"}>
                          {method.name}
                          {method.soon
                            ? ` · ${content.payments.toJiku.soon}`
                            : ""}
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
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {content.payments.toYou.text}
                  </p>
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="rounded-3xl bg-muted/40">
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <Layers className="size-5" aria-hidden />
                {content.both.heading}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {content.both.text}
              </p>
            </SpotlightCard>
          </section>

          <section className="mt-20">
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
                <Link href={SEO_ROUTES.USE_CASES}>{content.cta.secondary}</Link>
              </Button>
            </ClosingCta>
          </section>
        </main>
      </div>
    </MotionProvider>
  );
}
