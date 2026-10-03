import { BellRing, ClipboardCheck, Layers, Link2, ListOrdered, Mail, QrCode, ScanLine } from "lucide-react";
import { MotionProvider, RevealFallback } from "@/components/effects";
import { cardFontVariables } from "@/lib/card-display-fonts";
import { BentoSection } from "./bento-section";
import { CardsSection } from "./cards-section";
import { LANDING_CONTENT, type LandingLocale } from "./content";
import { CtaSection } from "./cta-section";
import { FaqSection } from "./faq-section";
import { FooterSection } from "./footer-section";
import { HeroSection } from "./hero-section";
import { LandingJsonLd } from "./json-ld";
import { Navigation } from "./navigation";
import { NumbersSection } from "./numbers-section";
import { PricingSection } from "./pricing-section";
import { DayLineVisual, TicketVisual } from "./product-visuals";
import { ReplaceSection } from "./replace-section";
import { StickyCta } from "./sticky-cta";
import { TrustSection } from "./trust-section";
import { UseCasesSection } from "./use-cases-section";

const EVENT_ICONS = [Mail, QrCode, Layers, ClipboardCheck];
const SERVICE_ICONS = [Link2, BellRing, ListOrdered, ScanLine];

/**
 * The landing page for one locale (French at `/`, English at `/en`), in the
 * order a visitor decides (JIKU-195): the promise with the product, what it
 * replaces, the shareable card, the two uses, trust, who it is for, the price,
 * the doubts, and the action. Every idea is said once; the detail lives on
 * the use-cases page, the simulator and the FAQ.
 */
export function LandingPage({ locale, siteUrl }: { locale: LandingLocale; siteUrl: string }) {
  const content = LANDING_CONTENT[locale];

  return (
    <MotionProvider>
      <RevealFallback />
      <LandingJsonLd content={content} locale={locale} siteUrl={siteUrl} />
      <Navigation content={content.nav} />
      <main className={cardFontVariables}>
        <HeroSection content={content.hero} siteUrl={siteUrl} />
        <NumbersSection content={content.numbers} />
        <ReplaceSection content={content.replace} />
        <CardsSection content={content.cards} invites={content.hero.card.invites} siteUrl={siteUrl} />
        <BentoSection
          id="events"
          content={content.events}
          icons={EVENT_ICONS}
          visual={<TicketVisual labels={content.events.visual} />}
          soonLabel={content.soonLabel}
        />
        <BentoSection
          id="services"
          content={content.services}
          icons={SERVICE_ICONS}
          visual={<DayLineVisual labels={content.services.visual} />}
          soonLabel={content.soonLabel}
        />
        <TrustSection content={content.trust} />
        <UseCasesSection content={content.useCases} />
        <PricingSection content={content.pricing} locale={locale} />
        <FaqSection content={content.faq} />
        <CtaSection content={content.cta} />
      </main>
      <FooterSection content={content.footer} />
      <StickyCta label={content.stickyCta} />
    </MotionProvider>
  );
}
