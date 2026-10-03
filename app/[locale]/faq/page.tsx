import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { LANDING_CONTENT } from "@/components/modules/landing";
import { BreadcrumbJsonLd, FaqJsonLd, LocalBusinessJsonLd, OrganizationJsonLd, siteUrl } from "@/components/modules/seo";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";

interface PageProps {
  params: Promise<{ locale: string }>;
}

function resolveLocale(locale: string) {
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const { page } = LANDING_CONTENT[locale].faq;
  const canonical = locale === routing.defaultLocale ? SEO_ROUTES.FAQ : `/${locale}${SEO_ROUTES.FAQ}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical, languages: { fr: SEO_ROUTES.FAQ, en: `/en${SEO_ROUTES.FAQ}` } },
    openGraph: { type: "website", siteName: "Jikū", locale, title: page.title, description: page.description },
    twitter: { card: "summary_large_image", title: page.title, description: page.description },
  };
}

/**
 * Dedicated FAQ page (JIKU-63, JIKU-197): every question, in the visitor's
 * language, from the same content the landing page's short FAQ shows, so the
 * two never drift apart. Pricing answers are written from `lib/pricing.ts`.
 */
export default async function FaqPage({ params }: Readonly<PageProps>) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const { faq } = LANDING_CONTENT[locale];
  const url = siteUrl();
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-900">
      <OrganizationJsonLd siteUrl={url} />
      <LocalBusinessJsonLd siteUrl={url} />
      <BreadcrumbJsonLd
        items={[
          { name: faq.page.home, url: `${url}${prefix}` },
          { name: "FAQ", url: `${url}${prefix}${SEO_ROUTES.FAQ}` },
        ]}
      />
      <FaqJsonLd items={faq.items} locale={locale} />

      <header className="border-b border-border/30 px-6 py-4">
        <Link href={ROUTES.HOME} className="inline-flex items-center gap-2 text-sm font-semibold">
          <JikūLogo variant="mark" className="size-5" />
          Jikū
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <nav aria-label={faq.page.breadcrumb} className="mb-8 text-sm text-muted-foreground">
          <Link href={ROUTES.HOME} className="hover:text-foreground">
            {faq.page.home}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">FAQ</span>
        </nav>

        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{faq.page.heading}</h1>

        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">{faq.page.intro}</p>

        <Accordion type="single" collapsible className="mt-12">
          {faq.items.map((item, i) => (
            <AccordionItem key={item.question} value={`faq-${i}`}>
              <AccordionTrigger headingLevel={2} className="text-left text-base">
                {item.question}
              </AccordionTrigger>
              {/* Mounted while closed so every answer is in the page for search engines. */}
              <AccordionContent forceMount className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
    </div>
  );
}
