import type { Locale } from "@/i18n/routing";
import { LEGAL_NOTICE_ROUTE, PRIVACY_ROUTE, TERMS_ROUTE } from "@/lib/constants";
import { LEGAL_EN } from "./legal-content.en";
import { LEGAL_FR } from "./legal-content.fr";
import type { LegalDocumentId, LegalDocuments } from "./legal-types";

export const LEGAL_DOCUMENTS: Record<Locale, LegalDocuments> = { fr: LEGAL_FR, en: LEGAL_EN };

/** Where each document lives, unprefixed; English pages add `/en`. */
export const LEGAL_PATHS: Record<LegalDocumentId, string> = {
  legal: LEGAL_NOTICE_ROUTE,
  terms: TERMS_ROUTE,
  privacy: PRIVACY_ROUTE,
};

export const LEGAL_LABELS: Record<
  Locale,
  { updated: string; contents: string; home: string; switchLocale: string; switchLabel: string; related: string }
> = {
  fr: {
    updated: "En vigueur au",
    contents: "Sommaire",
    home: "Accueil",
    switchLocale: "EN",
    switchLabel: "Read this page in English",
    related: "Documents légaux",
  },
  en: {
    updated: "In force as of",
    contents: "Contents",
    home: "Home",
    switchLocale: "FR",
    switchLabel: "Lire cette page en français",
    related: "Legal documents",
  },
};
