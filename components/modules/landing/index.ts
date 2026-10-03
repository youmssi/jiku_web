// Landing module — public marketing pages, FR (default, at `/`) + EN (`/en`).
// Routes render <LandingPage/> and <UseCasesPage/>; every word lives in a
// content contract so the two locales can never drift in shape.
export { LandingPage } from "./landing-page";
export { LANDING_CONTENT } from "./content";
export type { LandingContent, LandingLocale } from "./content";
export { UseCasesPage } from "./use-cases-page";
export { USE_CASES_CONTENT } from "./use-cases-content";
export type { UseCasesPageContent } from "./use-cases-content";
export { SimulatorPage } from "./simulator-page";
export { SIMULATOR_CONTENT } from "./simulator-content";
export type { SimulatorContent } from "./simulator-content";
export { BirthdayCardPage } from "./birthday-card-page";
export { BirthdayTextsPage } from "./birthday-texts-page";
export { BIRTHDAY_CARD_CONTENT, BIRTHDAY_TEXTS_CONTENT } from "./birthday-content";
export type { BirthdayCardPageContent, BirthdayTextsPageContent } from "./birthday-content";
export { DesignPreview } from "./design-preview";
