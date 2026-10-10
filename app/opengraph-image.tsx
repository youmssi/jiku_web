import { ImageResponse } from "next/og";
import { OgBrand } from "@/components/modules/seo";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Jikū : invitations WhatsApp, billets QR et file d'attente";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0A0A 0%, #262626 50%, #0A0A0A 100%)",
          fontFamily: "Inter, sans-serif",
          padding: "80px",
        }}
      >
        {/* Subtle grid pattern */}
        <svg
          style={{ position: "absolute", inset: 0, opacity: 0.05 }}
          width="1200"
          height="630"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="og-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#og-grid)" />
        </svg>

        {/* Gradient orbs */}
        <div
          style={{
            position: "absolute",
            left: "-100px",
            top: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-80px",
            bottom: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
          }}
        />

        <div style={{ display: "flex", marginBottom: "24px" }}>
          <OgBrand size={56} />
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: "64px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#FAFAFA",
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: "900px",
          }}
        >
          <div style={{ display: "flex" }}>
            Invitations, billets QR{" "}
            <span style={{ color: "#A3A3A3", marginLeft: "0.3em" }}>et entrée</span>
          </div>
          <div style={{ display: "flex" }}>à votre marque, sur WhatsApp</div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "22px",
            color: "#A3A3A3",
            textAlign: "center",
            marginTop: "20px",
            maxWidth: "700px",
            lineHeight: 1.4,
          }}
        >
          Cartes et invitations WhatsApp, billets QR contrôlés même sans réseau, rendez-vous et file du jour. Gratuit jusqu&apos;à 100 invités par an.
        </div>

        {/* Feature badges */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "36px",
          }}
        >
          {["WhatsApp et e-mail", "Billets QR", "Entrée sans réseau", "À votre marque"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  fontSize: "15px",
                  color: "#D4D4D4",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#A3A3A3"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {feature}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
