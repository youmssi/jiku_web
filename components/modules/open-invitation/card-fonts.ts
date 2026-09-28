import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CardStyle } from "@/lib/card-style";

/**
 * The fonts a card image needs (JIKU-194), shipped with the app so a card never
 * depends on a font service being reachable. Each file is a static instance
 * (the image renderer reads no variable axes) of an OFL face from Google Fonts;
 * the paths are literal so the build traces them into the server bundle.
 */
type Weight = 500 | 600 | 700 | 800;

interface ImageFont {
  name: string;
  data: Buffer;
  weight: Weight;
  style: "normal";
}

const cache = new Map<string, Promise<Buffer>>();

function load(file: string): Promise<Buffer> {
  let pending = cache.get(file);
  if (!pending) {
    pending = readFile(file);
    cache.set(file, pending);
  }
  return pending;
}

const DISPLAY: Record<CardStyle, () => Promise<ImageFont>> = {
  ELEGANT: async () => ({
    name: "Cormorant Garamond",
    data: await load(join(process.cwd(), "assets/card-fonts/cormorant-garamond-600.ttf")),
    weight: 600,
    style: "normal",
  }),
  MODERN: async () => ({
    name: "Archivo",
    data: await load(join(process.cwd(), "assets/card-fonts/archivo-condensed-800.ttf")),
    weight: 800,
    style: "normal",
  }),
  FESTIVE: async () => ({
    name: "Bricolage Grotesque",
    data: await load(join(process.cwd(), "assets/card-fonts/bricolage-grotesque-800.ttf")),
    weight: 800,
    style: "normal",
  }),
};

/** The display face of [style] and the text face, for `ImageResponse`. */
export async function cardFonts(style: CardStyle): Promise<ImageFont[]> {
  return Promise.all([
    DISPLAY[style](),
    load(join(process.cwd(), "assets/card-fonts/inter-500.ttf")).then((data) => ({ name: "Inter", data, weight: 500 as const, style: "normal" as const })),
    load(join(process.cwd(), "assets/card-fonts/inter-700.ttf")).then((data) => ({ name: "Inter", data, weight: 700 as const, style: "normal" as const })),
  ]);
}
