import { ImageResponse } from "next/og";
import { buildOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/components/modules/seo";

export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "Check-in par QR code pour événements, fonctionne même hors-ligne";

export default function OpenGraphImage() {
  return new ImageResponse(
    buildOgImage({
      eyebrow: "Check-in QR code",
      headline: "Le contrôle d'accès qui marche même hors-ligne",
      subtitle: "Billets QR signés, scan sans réseau, synchronisation automatique.",
      badges: ["Hors-ligne", "Anti-duplication", "Sans application"],
    }),
    size,
  );
}
