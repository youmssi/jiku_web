import type { Locale } from "@/i18n/routing";

export const DOCS_HOME_LABEL: Record<Locale, string> = { fr: "Retour au site", en: "Back to the site" };
export const DOCS_REGISTER_LABEL: Record<Locale, string> = { fr: "Créer un compte", en: "Create an account" };
export const DOCS_OTHER_LANGUAGE: Record<Locale, { label: string }> = {
  fr: { label: "Read this guide in English" },
  en: { label: "Lire ce guide en français" },
};
/** The site's home page, first step of a guide's breadcrumb. */
export const DOCS_BREADCRUMB_HOME: Record<Locale, string> = { fr: "Accueil", en: "Home" };

export const DOCS_META: Record<Locale, { title: string; description: string }> = {
  fr: {
    title: "Guides",
    description:
      "Guides pas à pas : créer et partager une carte d'invitation, inviter une liste, contrôler les entrées, ouvrir les rendez-vous et la file du jour.",
  },
  en: {
    title: "Guides",
    description:
      "Step-by-step guides: create and share an invitation card, invite a guest list, check guests in, open bookings and the day line.",
  },
};
