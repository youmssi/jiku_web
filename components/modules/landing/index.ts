// Landing module — public marketing pages, FR (default, at `/`) + EN (`/en`).
// Routes render <LandingPage/> and <UseCasesPage/>; every word lives in a
// content contract so the two locales can never drift in shape.
export { LandingPage } from "./landing-page";
export { LANDING_CONTENT } from "./content";
export type { LandingContent, LandingLocale } from "./content";
export { UseCasesPage } from "./use-cases-page";
export { USE_CASES_CONTENT } from "./use-cases-content";
export type { UseCasesPageContent } from "./use-cases-content";
export { PricingPage } from "./pricing-page";
export { PRICING_CONTENT, pricingContent } from "./pricing-content";
export type { PricingContent } from "./pricing-content";
export { BirthdayCardPage } from "./birthday-card-page";
export { BirthdayTextsPage } from "./birthday-texts-page";
export { BIRTHDAY_CARD_CONTENT, BIRTHDAY_TEXTS_CONTENT, birthdayCardContent } from "./birthday-content";
export type { BirthdayCardPageContent, BirthdayTextsPageContent } from "./birthday-content";
export { OrganizersPage } from "./organizers-page";
export { ORGANIZERS_CONTENT, organizersContent } from "./organizers-content";
export type { OrganizersPageContent } from "./organizers-content";
export { FaqPage } from "./faq-page";
export { MarketingFooter } from "./footer-section";
export { NotFoundPage } from "./not-found-page";
