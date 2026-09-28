import { Archivo, Bricolage_Grotesque, Cormorant_Garamond } from "next/font/google";

// The display faces of the three card styles (JIKU-194), as the CSS variables
// `CARD_STYLE_TOKENS` read. Applied on guest pages and around the organizer's
// style picker; next/font loads a face only where its class is used.
const elegant = Cormorant_Garamond({ subsets: ["latin"], weight: ["600"], variable: "--font-card-elegant" });
const modern = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-card-modern" });
const festive = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-card-festive" });

export const cardFontVariables = `${elegant.variable} ${modern.variable} ${festive.variable}`;
