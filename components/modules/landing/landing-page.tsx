import { LANDING_CONTENT, type LandingLocale } from "./content";
import { Navigation } from "./navigation";
import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { HowItWorksSection } from "./how-it-works-section";
import { UseCasesSection } from "./use-cases-section";
import { PricingSection } from "./pricing-section";
import { FaqSection } from "./faq-section";
import { CtaSection } from "./cta-section";
import { FooterSection } from "./footer-section";
import { LandingJsonLd } from "./json-ld";

/**
 * The full landing page for one locale. French is the default market language
 * (served at `/`), English at `/en`; all copy comes from the content contract
 * so both locales always have the same structure.
 */
export function LandingPage({ locale, siteUrl }: { locale: LandingLocale; siteUrl: string }) {
  const content = LANDING_CONTENT[locale];

  return (
    <>
      <LandingJsonLd content={content} locale={locale} siteUrl={siteUrl} />
      <Navigation content={content.nav} />
      <main>
        <HeroSection content={content.hero} />
        <FeaturesSection content={content.features} />
        <HowItWorksSection content={content.howItWorks} />
        <UseCasesSection content={content.useCases} />
        <PricingSection content={content.pricing} />
        <FaqSection content={content.faq} />
        <CtaSection content={content.cta} />
      </main>
      <FooterSection content={content.footer} />
    </>
  );
}
