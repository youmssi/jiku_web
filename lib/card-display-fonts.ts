import { Archivo, Bricolage_Grotesque, Cormorant_Garamond } from "next/font/google";

// The display faces of the three card styles (JIKU-194), as the CSS variables
// `CARD_STYLE_TOKENS` read. Applied on guest pages and around the organizer's
// style picker. They are not preloaded, so they never delay the page's own text
// on a slow connection; a card title shows in the fallback face for a moment
// and its fixed card frame keeps the swap from shifting the page.
const elegant = Cormorant_Garamond({ subsets: ["latin"], weight: ["600"], variable: "--font-card-elegant", preload: false });
const modern = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-card-modern", preload: false });
const festive = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-card-festive", preload: false });

export const cardFontVariables = `${elegant.variable} ${modern.variable} ${festive.variable}`;
