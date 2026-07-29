import { ImageResponse } from "next/og";
import { buildOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/components/modules/seo";

export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "Gestion de séminaire et événement d'entreprise en Guinée";

export default function OpenGraphImage() {
  return new ImageResponse(
    buildOgImage({
      eyebrow: "Séminaires en Guinée",
      headline: "De l'invitation au reporting de présence",
      subtitle: "Badges QR, confirmations en direct, export CSV des présences réelles.",
      badges: ["Badges QR", "Export CSV", "Marque blanche"],
    }),
    size,
  );
}
