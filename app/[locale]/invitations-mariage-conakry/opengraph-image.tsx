import { ImageResponse } from "next/og";
import { buildOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/components/modules/seo";

export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "Invitations de mariage à Conakry par WhatsApp et e-mail, avec billets QR";

export default function OpenGraphImage() {
  return new ImageResponse(
    buildOgImage({
      eyebrow: "Mariages à Conakry",
      headline: "Vos invitations de mariage, envoyées par WhatsApp",
      subtitle: "Suivi des confirmations en direct et billets QR pour le jour J.",
      badges: ["WhatsApp + e-mail", "Billets QR", "Check-in hors-ligne"],
    }),
    size,
  );
}
