import {
  ArrowRight,
  Building2,
  Check,
  ClipboardCheck,
  Gem,
  PartyPopper,
  Presentation,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { Link } from "@/i18n/navigation";
import { cardFontVariables } from "@/lib/card-display-fonts";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";
import { OrganizationJsonLd, LocalBusinessJsonLd, BreadcrumbJsonLd } from "@/components/modules/seo";
import { MarketingHeader } from "./marketing-header";
import { UseCaseFlows } from "./use-case-flows";
import { USE_CASE_JOURNEYS } from "./use-case-journeys";
import type { UseCaseProfile, UseCaseProfileId, UseCasesPageContent } from "./use-cases-content";

const PROFILE_ICONS: Record<UseCaseProfileId, LucideIcon> = {
  weddings: Gem,
  parties: PartyPopper,
  corporate: Presentation,
  assemblies: ClipboardCheck,
  clinics: Stethoscope,
  offices: Building2,
};

/** One situation: who it is for, the promise, one sentence, what it relies on, and the way in. */
function ProfileCard({ profile }: { profile: UseCaseProfile }) {
  const Icon = PROFILE_ICONS[profile.id];
  return (
    <article
      id={profile.id}
      className="flex scroll-mt-24 flex-col rounded-2xl border border-border/50 bg-card/50 p-6 target:border-primary target:shadow-lg"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <p className="text-sm font-medium text-muted-foreground">{profile.label}</p>
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{profile.promise}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{profile.text}</p>
      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
        {profile.features.map((feature) => (
          <li key={feature} className="inline-flex items-center gap-1.5 text-xs font-medium">
            <Check className="size-3.5 text-primary" strokeWidth={2.5} aria-hidden />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={ROUTES.REGISTER}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
      >
        {profile.cta}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}

/**
 * The dedicated use-cases page (JIKU-196): the journeys first, so a visitor
 * sees the product at work in their own situation, then six profiles with one
 * promise each, and the price in one line. The landing page's "Who it's for"
 * chips land on the profiles' anchors.
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

      <MarketingHeader nav={content.nav} path={SEO_ROUTES.USE_CASES} />

      <main className={`mx-auto w-full max-w-7xl flex-1 px-6 py-16 sm:py-20 ${cardFontVariables}`}>
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

        <UseCaseFlows content={USE_CASE_JOURNEYS[locale]} />

        <section aria-labelledby="use-case-profiles" className="mt-20">
          <h2 id="use-case-profiles" className="text-center text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {content.profiles.heading}
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {content.profiles.items.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </section>

        <p className="mx-auto mt-14 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
          {content.pricing.text}{" "}
          <Link href={SEO_ROUTES.SIMULATOR} className="font-semibold text-foreground underline-offset-4 hover:underline">
            {content.pricing.cta}
          </Link>
        </p>

        <section className="mt-20 rounded-3xl border border-primary/15 bg-gradient-to-b from-primary/[0.06] to-transparent p-8 text-center sm:p-12">
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
