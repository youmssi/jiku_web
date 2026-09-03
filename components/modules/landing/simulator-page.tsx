import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { OrganizationJsonLd, LocalBusinessJsonLd, BreadcrumbJsonLd } from "@/components/modules/seo";
import { SimulatorCalculator } from "./simulator-calculator";
import type { SimulatorContent } from "./simulator-content";

/**
 * The /simulator pricing playground. The hero and chrome are server-rendered;
 * the interactive calculator is a client component. The CTA deep-links into the
 * reservation flow carrying the chosen guest count, so a visitor's simulated
 * price carries straight through to a real quote.
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
          <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            {content.intro}
          </p>
        </div>

        <div className="mt-12">
          <SimulatorCalculator content={content} locale={locale} />
        </div>
      </main>
    </div>
  );
}
