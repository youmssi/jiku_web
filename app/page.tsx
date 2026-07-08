import { Navigation } from "@/components/modules/landing/navigation";
import { HeroSection } from "@/components/modules/landing/hero-section";
import { FeaturesSection } from "@/components/modules/landing/features-section";
import { HowItWorksSection } from "@/components/modules/landing/how-it-works-section";
import { TestimonialsSection } from "@/components/modules/landing/testimonials-section";
import { PricingSection } from "@/components/modules/landing/pricing-section";
import { CtaSection } from "@/components/modules/landing/cta-section";
import { FooterSection } from "@/components/modules/landing/footer-section";

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
      </main>
      <FooterSection />
    </>
  );
}
