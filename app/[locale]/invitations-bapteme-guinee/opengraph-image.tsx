import { ImageResponse } from "next/og";
import { buildOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/components/modules/seo";

export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "Invitations de baptême en Guinée par WhatsApp et e-mail";

export default function OpenGraphImage() {
  return new ImageResponse(
    buildOgImage({
      eyebrow: "Baptêmes en Guinée",
      headline: "Vos invitations de baptême, envoyées en quelques minutes",
      subtitle: "Suivi des présences en direct et billets QR pour l'accueil des invités.",
      badges: ["WhatsApp + e-mail", "Suivi en direct", "Gratuit jusqu'à 100"],
    }),
    size,
  );
}
