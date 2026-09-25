import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { LEGAL_DOCUMENTS, LEGAL_PATHS } from "./legal-content";
import type { LegalDocumentId } from "./legal-types";

/** Title, description and hreflang alternates of a legal document. */
export function legalMetadata(id: LegalDocumentId, locale: Locale): Metadata {
  const document = LEGAL_DOCUMENTS[locale][id];
  const path = LEGAL_PATHS[id];
  return {
    title: document.title,
    description: document.description,
    alternates: {
      canonical: locale === routing.defaultLocale ? path : `/${locale}${path}`,
      languages: { fr: path, en: `/en${path}` },
    },
  };
}
