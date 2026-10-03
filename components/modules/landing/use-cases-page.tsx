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
import { MotionProvider, Reveal, SpotlightCard } from "@/components/effects";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { Link } from "@/i18n/navigation";
import { cardFontVariables } from "@/lib/card-display-fonts";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";
import {
  OrganizationJsonLd,
  LocalBusinessJsonLd,
  BreadcrumbJsonLd,
} from "@/components/modules/seo";
import { PearlBackdrop } from "./backdrops";
import { ClosingCta, CLOSING_OUTLINE } from "./closing-cta";
import { MarketingHeader } from "./marketing-header";
import { UseCaseFlows } from "./use-case-flows";
import { USE_CASE_JOURNEYS } from "./use-case-journeys";
import type {
  UseCaseProfile,
  UseCaseProfileId,
  UseCasesPageContent,
} from "./use-cases-content";

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
    <SpotlightCard className="flex h-full flex-col bg-card/60 has-[:target]:border-foreground has-[:target]:shadow-lg">
      <article id={profile.id} className="flex flex-1 scroll-mt-24 flex-col">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
            <Icon className="size-5" aria-hidden />
          </span>
          <p className="text-sm font-medium text-muted-foreground">
            {profile.label}
          </p>
        </div>
        <h3 className="mt-5 text-lg font-semibold tracking-tight">
          {profile.promise}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {profile.text}
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
          {profile.features.map((feature) => (
            <li
              key={feature}
              className="inline-flex items-center gap-1.5 text-xs font-medium"
            >
              <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
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
    </SpotlightCard>
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
    <MotionProvider>
      <div className="flex flex-1 flex-col bg-background">
        <OrganizationJsonLd siteUrl={siteUrl} />
        <LocalBusinessJsonLd siteUrl={siteUrl} />
        <BreadcrumbJsonLd
          items={[
            { name: content.nav.home, url: siteUrl },
            { name: content.title, url: `${siteUrl}${path}` },
          ]}
        />

        <MarketingHeader nav={content.nav} path={SEO_ROUTES.USE_CASES} />

        <section className="relative overflow-hidden">
          <PearlBackdrop />
          <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-sm font-medium backdrop-blur">
              <JikūLogo variant="mark" className="size-3.5" />
              <span className="text-shine">{content.eyebrow}</span>
            </div>
            <h1 className="animate-blur-in text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              {content.title}
            </h1>
            <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground animate-blur-in [animation-delay:150ms] sm:text-lg">
              {content.intro}
            </p>
          </div>
        </section>

        <main
          className={`mx-auto w-full max-w-7xl flex-1 px-6 pb-16 sm:pb-20 ${cardFontVariables}`}
        >
          <UseCaseFlows content={USE_CASE_JOURNEYS[locale]} />

          <section aria-labelledby="use-case-profiles" className="mt-20">
            <h2
              id="use-case-profiles"
              className="text-center text-balance text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {content.profiles.heading}
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {content.profiles.items.map((profile, index) => (
                <Reveal
                  key={profile.id}
                  delay={(index % 3) * 0.06}
                  className="h-full"
                >
                  <ProfileCard profile={profile} />
                </Reveal>
              ))}
            </div>
          </section>

          <p className="mx-auto mt-14 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
            {content.pricing.text}{" "}
            <Link
              href={SEO_ROUTES.SIMULATOR}
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              {content.pricing.cta}
            </Link>
          </p>

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
                <Link href={SEO_ROUTES.SIMULATOR}>{content.cta.secondary}</Link>
              </Button>
            </ClosingCta>
          </section>
        </main>
      </div>
    </MotionProvider>
  );
}
