import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Jikū: White-label event invitations, ticketing, RSVP and check-in";

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
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
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
            background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)",
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
            background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "72px",
            height: "72px",
            borderRadius: "16px",
            background: "#2563EB",
            color: "white",
            fontSize: "36px",
            fontWeight: 700,
            marginBottom: "24px",
          }}
        >
          J
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
            color: "#F8FAFC",
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: "900px",
          }}
        >
          <div style={{ display: "flex" }}>
            Invitations, QR tickets{" "}
            <span style={{ color: "#60A5FA", marginLeft: "0.3em" }}>& check-in</span>
          </div>
          <div style={{ display: "flex" }}>under your own brand</div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "22px",
            color: "#94A3B8",
            textAlign: "center",
            marginTop: "20px",
            maxWidth: "700px",
            lineHeight: 1.4,
          }}
        >
          Send invitations by email and WhatsApp, issue signed QR tickets, and check guests in online or offline. Free for up to 100 guests.
        </div>

        {/* Feature badges */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "36px",
          }}
        >
          {["Email + WhatsApp", "QR tickets", "Offline check-in", "White-label"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(148,163,184,0.2)",
                  fontSize: "15px",
                  color: "#CBD5E1",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#60A5FA"
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
