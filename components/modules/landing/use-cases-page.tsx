import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Gem,
  GraduationCap,
  Heart,
  Landmark,
  Mic,
  Presentation,
  Users,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { Link } from "@/i18n/navigation";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";
import { OrganizationJsonLd, LocalBusinessJsonLd, BreadcrumbJsonLd } from "@/components/modules/seo";
import type { UseCasesPageContent } from "./use-cases-content";

// Icons pair positionally with the flattened case list (ceremonies 2,
// professional 4, institutional 3). Keep this list the same length as the
// total number of cases or a case renders a broken icon.
const CASE_ICONS: LucideIcon[] = [
  Gem, // mariage & baptême
  Heart, // fiançailles & dot
  Presentation, // séminaires & galas
  Mic, // conférences de presse
  Landmark, // inaugurations
  GraduationCap, // remises de diplômes
  Users, // assemblées générales
  ClipboardCheck, // formations
  Globe, // diaspora
];

function UseCaseCard({
  useCase,
  index,
}: {
  useCase: UseCasesPageContent["categories"][number]["cases"][number];
  index: number;
}) {
  const Icon = CASE_ICONS[index];

  return (
    <div className="group flex flex-col rounded-2xl border border-border/40 bg-card/50 p-7 transition-all duration-300 hover:border-primary/20 hover:shadow-lg">
      <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
        <Icon className="size-6" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">{useCase.title}</h3>
      <p className="mt-2 text-sm font-medium text-foreground">{useCase.promise}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{useCase.description}</p>
      <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
        <Check className="size-3.5" strokeWidth={2.5} />
        {useCase.proof}
      </p>
    </div>
  );
}

/**
 * The dedicated use-cases page: the full range of events the shipped product
 * covers, framed per segment ("promise + proof") so a visitor recognises their
 * own situation and the value is obvious before they ever see a price.
 */
export function UseCasesPage({
  content,
  locale,
  siteUrl,
}: {
  content: UseCasesPageContent;
  locale: "fr" | "en";
  siteUrl: string;
}) {
  const path = locale === "fr" ? "/use-cases" : "/en/use-cases";

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

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-16 sm:py-20">
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

        {content.categories.map((category, categoryIndex) => {
          const startIndex = content.categories
            .slice(0, categoryIndex)
            .reduce((sum, c) => sum + c.cases.length, 0);

          return (
            <section key={category.title} className="mt-20">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
                  {category.title}
                </h2>
                <p className="mt-3 text-sm font-medium text-primary sm:text-base">{category.promise}</p>
              </div>
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {category.cases.map((useCase, i) => (
                  <UseCaseCard
                    key={useCase.title}
                    useCase={useCase}
                    index={startIndex + i}
                  />
                ))}
              </div>
            </section>
          );
        })}

        <section className="mt-24 rounded-3xl border border-primary/15 bg-gradient-to-b from-primary/[0.06] to-transparent p-8 text-center sm:p-12">
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {content.cta.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            {content.cta.text}
          </p>
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
