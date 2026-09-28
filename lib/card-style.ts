// The three looks an organizer picks for guest-facing surfaces (JIKU-194):
// the card, the link preview, the WhatsApp card image, the answer page and the
// ticket. Typography, spacing and contrast are fixed here, so every choice stays
// legible; only the organizer's colour, logo and photo change.

export type CardStyle = "ELEGANT" | "MODERN" | "FESTIVE";

export const CARD_STYLES: CardStyle[] = ["ELEGANT", "MODERN", "FESTIVE"];

export const DEFAULT_CARD_STYLE: CardStyle = "MODERN";

export const FALLBACK_BRAND_COLOR = "#1E293B";

export interface CardStyleTokens {
  /** The display face, as Google Fonts names it, and the one weight drawn. */
  fontFamily: string;
  fontWeight: 600 | 700 | 800;
  /** A width axis value for condensed faces; null for the others. */
  fontWidth: number | null;
  /** The CSS variable next/font sets for the page (see `app/[locale]/(guest)/layout.tsx`). */
  fontVariable: string;
  uppercase: boolean;
  letterSpacing: string;
  /** Title size relative to the modern style, so every face fills the same space. */
  titleScale: number;
  radius: number;
  /** The light panel under the photo, and its ink. */
  panel: string;
  panelInk: string;
  panelMuted: string;
  /** A small accent: a gold rule, a black bar, a warm dot. */
  detail: string;
  soft: string;
}

export const CARD_STYLE_TOKENS: Record<CardStyle, CardStyleTokens> = {
  ELEGANT: {
    fontFamily: "Cormorant Garamond",
    fontWeight: 600,
    fontWidth: null,
    fontVariable: "var(--font-card-elegant)",
    uppercase: false,
    letterSpacing: "-0.01em",
    titleScale: 1.12,
    radius: 14,
    panel: "#FBF7F1",
    panelInk: "#2B1810",
    panelMuted: "#7A6557",
    detail: "#A9844E",
    soft: "#F2E9DC",
  },
  MODERN: {
    fontFamily: "Archivo",
    fontWeight: 800,
    fontWidth: 62.5,
    fontVariable: "var(--font-card-modern)",
    uppercase: true,
    letterSpacing: "-0.01em",
    titleScale: 0.92,
    radius: 6,
    panel: "#FFFFFF",
    panelInk: "#0C0C0D",
    panelMuted: "#5F6166",
    detail: "#0C0C0D",
    soft: "#F1F1F2",
  },
  FESTIVE: {
    fontFamily: "Bricolage Grotesque",
    fontWeight: 800,
    fontWidth: null,
    fontVariable: "var(--font-card-festive)",
    uppercase: false,
    letterSpacing: "-0.03em",
    titleScale: 1,
    radius: 26,
    panel: "#FFF3EA",
    panelInk: "#3A1409",
    panelMuted: "#8A5A45",
    detail: "#EA7A2E",
    soft: "#FFE4D2",
  },
};

/** The style an API value names, or the default for anything else. */
export function cardStyleOf(value: string | null | undefined): CardStyle {
  return CARD_STYLES.includes(value as CardStyle) ? (value as CardStyle) : DEFAULT_CARD_STYLE;
}

/** A hex colour mixed toward black by `amount` (0-1), for depth in the brand backgrounds. */
export function darken(hex: string, amount: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;
  const n = parseInt(match[1], 16);
  const channel = (shift: number) => Math.round(((n >> shift) & 0xff) * (1 - amount));
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

/** The background of a hero without a photo: the brand colour, treated per style. */
export function brandBackground(style: CardStyle, color: string): string {
  switch (style) {
    case "ELEGANT":
      return `radial-gradient(120% 90% at 20% 0%, ${color} 0%, ${darken(color, 0.35)} 45%, ${darken(color, 0.7)} 100%)`;
    case "MODERN":
      return `linear-gradient(180deg, ${color} 0%, ${darken(color, 0.2)} 100%)`;
    case "FESTIVE":
      return `linear-gradient(150deg, ${color} 0%, ${darken(color, 0.25)} 50%, ${darken(color, 0.6)} 100%)`;
  }
}

/** The shade over a photo that keeps white text readable. */
export const PHOTO_SHADE = "linear-gradient(180deg, rgba(0,0,0,0.05) 15%, rgba(12,4,2,0.8) 100%)";

/** The inline style of a title in the display face of [tokens], at [size] (any CSS length) before the style's scale. */
export function displayTitle(tokens: CardStyleTokens, size: string): {
  fontFamily: string;
  fontWeight: number;
  fontSize: string;
  lineHeight: number;
  letterSpacing: string;
  textTransform: "uppercase" | "none";
  fontVariationSettings?: string;
} {
  return {
    fontFamily: `${tokens.fontVariable}, ui-serif, Georgia, serif`,
    fontWeight: tokens.fontWeight,
    fontSize: `calc(${size} * ${tokens.titleScale})`,
    lineHeight: 0.98,
    letterSpacing: tokens.letterSpacing,
    textTransform: tokens.uppercase ? "uppercase" : "none",
    fontVariationSettings: tokens.fontWidth ? `"wdth" ${tokens.fontWidth}` : undefined,
  };
}
