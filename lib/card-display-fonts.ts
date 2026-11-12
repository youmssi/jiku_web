import { Bricolage_Grotesque, Cormorant_Garamond } from "next/font/google";

// The display faces of the three card styles (JIKU-194), as the CSS variables
// `CARD_STYLE_TOKENS` read. Applied on guest pages and around the organizer's
// style picker. They are not preloaded, so they never delay the page's own text
// on a slow connection; a card title shows in the fallback face for a moment
// and its fixed card frame keeps the swap from shifting the page. Each face
// loads only the weight its style draws with (JIKU-287), not the whole family.
// Modern draws Archivo at weight 800 and width 62.5 only: that single instance
// is cut from the variable font and declared in globals.css as
// `--font-card-modern` (public/fonts, OFL), 14 KiB instead of 90 KiB for every
// weight and width (JIKU-300).
const elegant = Cormorant_Garamond({ subsets: ["latin"], weight: ["600"], variable: "--font-card-elegant", preload: false });
const festive = Bricolage_Grotesque({ subsets: ["latin"], weight: ["800"], variable: "--font-card-festive", preload: false });

export const cardFontVariables = `${elegant.variable} ${festive.variable}`;
