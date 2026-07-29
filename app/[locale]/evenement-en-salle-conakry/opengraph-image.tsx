import { ImageResponse } from "next/og";
import { buildOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/components/modules/seo";

export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "Organiser un événement en salle à Conakry avec contrôle d'accès et billets QR";

export default function OpenGraphImage() {
  return new ImageResponse(
    buildOgImage({
      eyebrow: "Événements en salle à Conakry",
      headline: "Maîtrisez la capacité et l'accès de votre salle",
      subtitle: "Billets QR uniques, suivi des confirmations en direct, check-in hors-ligne.",
      badges: ["Capacité en direct", "Billets QR", "Contrôle d'accès"],
    }),
    size,
  );
}
