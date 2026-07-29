import { ImageResponse } from "next/og";
import { buildOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/components/modules/seo";

export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "Tarifs Jikū : gratuit jusqu'à 100 invités, puis un prix unique par événement";

export default function OpenGraphImage() {
  return new ImageResponse(
    buildOgImage({
      eyebrow: "Tarifs",
      headline: "Gratuit jusqu'à 100 invités. Ensuite, un prix par événement.",
      subtitle: "150 000 à 500 000 GNF selon le nombre d'invités. Aucun abonnement.",
      badges: ["Sans engagement", "Marque blanche", "Paiement unique"],
    }),
    size,
  );
}
