import { ArrowRight, CreditCard, HandCoins, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { Link } from "@/i18n/navigation";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";
import { OrganizationJsonLd, LocalBusinessJsonLd, BreadcrumbJsonLd } from "@/components/modules/seo";
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
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-900">
      <OrganizationJsonLd siteUrl={siteUrl} />
      <LocalBusinessJsonLd siteUrl={siteUrl} />
      <PricingJsonLd content={content} url={`${siteUrl}${path}`} />
      <BreadcrumbJsonLd
        items={[
          { name: content.nav.home, url: siteUrl },
          { name: content.title, url: `${siteUrl}${path}` },
        ]}
      />

      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href={ROUTES.HOME} className="inline-flex items-center gap-2.5">
            <JikūLogo variant="mark" className="size-7" />
            <span className="font-semibold tracking-tight">Jikū</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={content.nav.switchLocale.href}
              aria-label={content.nav.switchLocale.ariaLabel}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              {content.nav.switchLocale.label}
            </Link>
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
              <Link href={ROUTES.LOGIN}>{content.nav.signIn}</Link>
            </Button>
            <Button size="sm" className="rounded-full" asChild>
              <Link href={ROUTES.REGISTER}>{content.nav.createAccount}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <JikūLogo variant="mark" className="size-3.5" />
            {content.eyebrow}
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{content.title}</h1>
          <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">{content.rule}</p>
        </div>

        <div className="mt-12">
          <SimulatorCalculator content={content} locale={locale} />
        </div>

        <section className="mt-20 grid gap-5 lg:grid-cols-3" aria-labelledby="simulator-payments">
          <div className="rounded-3xl border border-border/50 bg-card/60 p-6 lg:col-span-2">
            <h2 id="simulator-payments" className="text-xl font-bold tracking-tight">
              {content.payments.heading}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  <CreditCard className="size-4 text-primary" />
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
                  <HandCoins className="size-4 text-primary" />
                  {content.payments.toYou.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{content.payments.toYou.text}</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-primary/15 bg-primary/[0.05] p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <Layers className="size-5 text-primary" />
              {content.both.heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.both.text}</p>
          </div>
        </section>

        <section className="mt-20 rounded-[2rem] bg-foreground px-6 py-14 text-center text-background sm:px-12">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{content.cta.heading}</h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-background/70">{content.cta.text}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="rounded-full">
              <Link href={ROUTES.REGISTER}>
                {content.cta.primary}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full text-background hover:bg-background/10 hover:text-background">
              <Link href={SEO_ROUTES.USE_CASES}>{content.cta.secondary}</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
