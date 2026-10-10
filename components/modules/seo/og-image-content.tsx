/**
 * Shared visual chrome for the per-page Open Graph images (JIKU-63) — each
 * thematic page's own `opengraph-image.tsx` supplies just its headline/badges
 * and calls `new ImageResponse(buildOgImage(...), OG_SIZE)`. Kept visually
 * consistent with the root `app/opengraph-image.tsx` (JIKU-47) but distinct
 * per page and watermark-free, as the story requires.
 */

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * The Jikū logo for images drawn by `ImageResponse`: the mark of
 * `public/jiku-logo.svg`, redrawn in light strokes for a dark background, and
 * the wordmark. Inline, so the image needs no file or network read.
 */
export function OgBrand({ size = 44 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: `${Math.round(size / 4)}px` }}>
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <g transform="translate(1, 2)">
          <path
            d="M 13 16 C 13 22 18 24 22 22 C 26 20 26 14 22 10 C 18 6 10 6 6 10 C 2 14 2 20 6 24"
            stroke="#FAFAFA"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.35"
          />
          <path
            d="M 13 4 L 13 16 C 13 20 11 22 8 22 C 5 22 3 20 3 17"
            stroke="#FAFAFA"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="13" cy="4" r="1.8" fill="#FAFAFA" />
        </g>
      </svg>
      <div style={{ display: "flex", color: "#FAFAFA", fontSize: `${Math.round(size * 0.62)}px`, fontWeight: 700, letterSpacing: "-0.02em" }}>
        Jikū
      </div>
    </div>
  );
}
export const OG_CONTENT_TYPE = "image/png";

export function buildOgImage({
  eyebrow,
  headline,
  subtitle,
  badges,
}: {
  eyebrow: string;
  headline: string;
  subtitle: string;
  badges: string[];
}) {
  return (
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 20px",
          borderRadius: "9999px",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.05)",
          color: "#A3A3A3",
          fontSize: "20px",
          fontWeight: 600,
          marginBottom: "28px",
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: "56px",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "#FAFAFA",
          textAlign: "center",
          lineHeight: 1.15,
          maxWidth: "980px",
        }}
      >
        {headline}
      </div>

      <div
        style={{
          fontSize: "22px",
          color: "#A3A3A3",
          textAlign: "center",
          marginTop: "22px",
          maxWidth: "760px",
          lineHeight: 1.4,
        }}
      >
        {subtitle}
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "36px" }}>
        {badges.map((badge) => (
          <div
            key={badge}
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
            {badge}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", marginTop: "40px" }}>
        <OgBrand />
      </div>
    </div>
  );
}
