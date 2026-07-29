import { ImageResponse } from "next/og";
import { buildOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/components/modules/seo";

export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "Questions fréquentes sur Jikū";

export default function OpenGraphImage() {
  return new ImageResponse(
    buildOgImage({
      eyebrow: "FAQ",
      headline: "Vos questions sur Jikū, répondues",
      subtitle: "Check-in hors-ligne, envoi WhatsApp, marque blanche, tarifs et données des invités.",
      badges: ["Sans application", "Hors-ligne", "Marque blanche"],
    }),
    size,
  );
}
