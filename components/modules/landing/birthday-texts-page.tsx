import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { Link } from "@/i18n/navigation";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";
import { BreadcrumbJsonLd, OrganizationJsonLd } from "@/components/modules/seo";
import { CopyTextButton } from "./copy-text-button";
import { MarketingHeader } from "./marketing-header";
import type { BirthdayTextsPageContent } from "./birthday-content";

/**
 * Birthday invitation texts to copy (JIKU-220): what an invitation must say,
 * then ready texts per kind of birthday, and the card to send them on.
 */
export function BirthdayTextsPage({
  content,
  locale,
  siteUrl,
}: {
  content: BirthdayTextsPageContent;
  locale: "fr" | "en";
  siteUrl: string;
}) {
  const path = locale === "fr" ? SEO_ROUTES.BIRTHDAY_TEXTS : `/en${SEO_ROUTES.BIRTHDAY_TEXTS}`;

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-900">
      <OrganizationJsonLd siteUrl={siteUrl} />
      <BreadcrumbJsonLd
        items={[
          { name: content.nav.home, url: siteUrl },
          { name: content.breadcrumb, url: `${siteUrl}${path}` },
        ]}
      />

      <MarketingHeader nav={content.nav} path={SEO_ROUTES.BIRTHDAY_TEXTS} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16 sm:py-20">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <JikūLogo variant="mark" className="size-3.5" />
            {content.eyebrow}
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{content.title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            {content.intro}
          </p>
        </div>

        <nav aria-label={content.eyebrow} className="mt-10 flex flex-wrap justify-center gap-2">
          {content.groups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="rounded-full border border-border/60 px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
            >
              {group.heading}
            </a>
          ))}
        </nav>

        <section aria-labelledby="texts-checklist" className="mt-14 rounded-3xl border border-border/50 bg-muted/30 p-8">
          <h2 id="texts-checklist" className="text-xl font-bold tracking-tight sm:text-2xl">
            {content.checklist.heading}
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {content.checklist.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-relaxed">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {content.groups.map((group) => (
          <section key={group.id} id={group.id} aria-labelledby={`${group.id}-heading`} className="mt-16 scroll-mt-24">
            <h2 id={`${group.id}-heading`} className="text-2xl font-bold tracking-tight sm:text-3xl">
              {group.heading}
            </h2>
            <ul className="mt-6 grid gap-4">
              {group.texts.map((text) => (
                <li key={text} className="rounded-2xl border border-border/50 bg-card/50 p-6">
                  <p className="whitespace-pre-line text-sm leading-relaxed sm:text-base">{text}</p>
                  <div className="mt-4 flex justify-end">
                    <CopyTextButton text={text} label={content.copy.label} done={content.copy.done} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-20 rounded-3xl border border-primary/15 bg-gradient-to-b from-primary/[0.06] to-transparent p-8 text-center sm:p-12">
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">{content.send.heading}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">{content.send.text}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href={ROUTES.REGISTER}>
                {content.send.primary}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link href={SEO_ROUTES.BIRTHDAY_CARD}>{content.send.secondary}</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
