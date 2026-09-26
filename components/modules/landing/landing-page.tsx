import {
  BellRing,
  ClipboardCheck,
  Layers,
  Link2,
  ListOrdered,
  Mail,
  Megaphone,
  QrCode,
  ScanLine,
  UserRoundCheck,
  Users,
  Wallet,
  WifiOff,
} from "lucide-react";
import { MotionProvider, RevealFallback } from "@/components/effects";
import { LANDING_CONTENT, type LandingLocale } from "./content";
import { CtaSection } from "./cta-section";
import { FaqSection } from "./faq-section";
import { BentoSection } from "./bento-section";
import { FooterSection } from "./footer-section";
import { HeroSection } from "./hero-section";
import { HighlightSection } from "./highlight-section";
import { HowItWorksSection } from "./how-it-works-section";
import { LandingJsonLd } from "./json-ld";
import { MoneySection } from "./money-section";
import { Navigation } from "./navigation";
import { PricingSection } from "./pricing-section";
import { DayLineVisual, TicketVisual } from "./product-visuals";
import { ProofSection } from "./proof-section";
import { ReplaceSection } from "./replace-section";
import { UseCasesSection } from "./use-cases-section";

const EVENT_ICONS = [Mail, Users, QrCode, Layers, WifiOff, ClipboardCheck];
const SERVICE_ICONS = [Link2, BellRing, ListOrdered, Megaphone, ScanLine, Wallet];

/**
 * The landing page for one locale (French at `/`, English at `/en`). It tells
 * the product in the order a visitor decides: the promise, proof, what it
 * replaces, the two uses (events, services), the team and the money, how to
 * start, who it is for, the price, the doubts, and the action.
 */
export function LandingPage({ locale, siteUrl }: { locale: LandingLocale; siteUrl: string }) {
  const content = LANDING_CONTENT[locale];

  return (
    <MotionProvider>
      <RevealFallback />
      <LandingJsonLd content={content} locale={locale} siteUrl={siteUrl} />
      <Navigation content={content.nav} />
      <main>
        <HeroSection content={content.hero} />
        <ProofSection content={content.proof} locale={locale} />
        <ReplaceSection content={content.replace} />
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
        <HighlightSection content={content.operators} icon={UserRoundCheck} soonLabel={content.soonLabel} />
        <MoneySection content={content.money} soonLabel={content.soonLabel} />
        <HowItWorksSection content={content.howItWorks} />
        <UseCasesSection content={content.useCases} more={content.useCases.more} />
        <PricingSection content={content.pricing} soonLabel={content.soonLabel} />
        <FaqSection content={content.faq} />
        <CtaSection content={content.cta} />
      </main>
      <FooterSection content={content.footer} />
    </MotionProvider>
  );
}
