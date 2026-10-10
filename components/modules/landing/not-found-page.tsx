import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { DOCS_ROUTE, ROUTES, SEO_ROUTES } from "@/lib/constants";
import { PearlBackdrop } from "./backdrops";
import { LANDING_CONTENT, type LandingLocale } from "./content";
import { MarketingFooter } from "./footer-section";
import { MarketingHeader } from "./marketing-header";

/**
 * The 404 page of the public site (JIKU-236): the site's header and footer, a
 * plain explanation, and three ways back instead of a dead end.
 */
export function NotFoundPage({ locale }: { locale: LandingLocale }) {
  const { notFound, nav } = LANDING_CONTENT[locale];
  const other: LandingLocale = locale === "fr" ? "en" : "fr";

  return (
    <div className="flex flex-1 flex-col bg-background">
      <title>{`${notFound.title} · Jikū`}</title>
      <meta name="robots" content="noindex" />
      <MarketingHeader
        nav={{
          home: notFound.home,
          signIn: nav.signIn,
          createAccount: nav.register,
          switchLocale: { label: nav.switchLocale.label, locale: other, ariaLabel: nav.switchLocale.ariaLabel },
        }}
        path={ROUTES.HOME}
      />
      <main id="main" className="relative flex flex-1 items-center overflow-hidden">
        <PearlBackdrop />
        <div className="relative mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-sm font-semibold text-muted-foreground">404</p>
          <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">{notFound.title}</h1>
          <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">{notFound.text}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
            <Button asChild size="lg" className="h-12 w-full rounded-full px-8 text-base sm:w-auto">
              <Link href={ROUTES.HOME}>
                {notFound.home}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-full bg-background/60 px-8 text-base sm:w-auto">
              <Link href={DOCS_ROUTE}>{notFound.guides}</Link>
            </Button>
            <Link
              href={SEO_ROUTES.FAQ}
              className="inline-flex min-h-11 items-center px-4 text-sm font-medium underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground sm:text-base"
            >
              {notFound.faq}
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter locale={locale} path={ROUTES.HOME} />
    </div>
  );
}
