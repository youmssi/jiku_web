import type { Locale } from "@/i18n/routing";

/**
 * Fumadocs' own interface strings in French (English is its default). The
 * keys are Fumadocs' message ids, so they read as English sentences.
 */
export const DOCS_UI_TRANSLATIONS: Record<Locale, Record<string, string>> = {
  fr: {
    "Search(search trigger)": "Rechercher",
    "Search(search dialog)": "Rechercher dans les guides",
    "Open Search(search trigger)(aria-label)": "Ouvrir la recherche",
    "Close Search(search dialog)(aria-label)": "Fermer la recherche",
    "No results found(search dialog)": "Aucun résultat",
    "On this page(table of contents)": "Sur cette page",
    "Table of Contents(inline table of contents)": "Sommaire",
    "No Headings(table of contents)": "Aucun titre",
    "Next Page(pagination)": "Page suivante",
    "Previous Page(pagination)": "Page précédente",
    "Last updated on(page footer)": "Mis à jour le",
    "Open Sidebar(sidebar)(aria-label)": "Ouvrir le menu",
    "Close Sidebar(sidebar)(aria-label)": "Fermer le menu",
    "Close Sidebar(aria-label)": "Fermer le menu",
    "Collapse Sidebar(sidebar)(aria-label)": "Réduire le menu",
    "Show Sidebar(sidebar)": "Afficher le menu",
    "Hide Sidebar(sidebar)": "Masquer le menu",
    "Toggle Menu(mobile menu)(aria-label)": "Ouvrir ou fermer le menu",
    "Copy Anchor Link(heading anchor)(aria-label)": "Copier le lien de cette section",
    "Copied Anchor Link(heading anchor)(aria-label)": "Lien copié",
    "Copy Text(code block)(aria-label)": "Copier le texte",
    "Copied Text(code block)(aria-label)": "Texte copié",
    "Page Not Found(404 page)": "Page introuvable",
    "Back to Home(404 page)": "Retour à l'accueil",
    "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)":
      "Cette page a peut-être été supprimée, renommée ou est momentanément indisponible.",
  },
  en: {},
};
