import "server-only";

import { qrPath } from "@/lib/qr-path";
import { CARD_STYLE_TOKENS, PHOTO_SHADE, brandBackground, readableBrand, type CardStyle } from "@/lib/card-style";
import { CardText, hasArabic, type TextDirection } from "./card-text";

// The card of an open invitation, drawn for `ImageResponse` (JIKU-194,
// JIKU-283): one artwork, three formats. The portrait card (1080 × 1350) is the
// one people post; the status card (1080 × 1920) fills a WhatsApp or Facebook
// status; the landscape card (1200 × 630) is the link preview and the image at
// the top of the WhatsApp message. Only flexbox and inline styles: the renderer
// supports nothing else.

export const PORTRAIT = { width: 1080, height: 1350 };
export const STATUS = { width: 1080, height: 1920 };
export const LANDSCAPE = { width: 1200, height: 630 };

/** The bands a status viewer covers with its progress bar, name and reply field: nothing that matters goes there. */
const STATUS_SAFE_BAND = 250;

export interface CardArtData {
  style: CardStyle;
  color: string;
  eventName: string;
  organizerName: string;
  /** Data URLs, already read, so a broken link never breaks the image. */
  logo: string | null;
  photo: string | null;
  /** "14", "nov.", "sam. · 19 h": the date as the card writes it. */
  day: string | null;
  month: string | null;
  weekdayTime: string | null;
  /** "sam. 14 nov. · 19 h", for the landscape card. */
  when: string | null;
  location: string | null;
  /** "Jusqu'au 7 nov. · 20 h", or null when answers stay open until the event. */
  answerBy: string | null;
  /** The answer page the QR code opens. */
  url: string;
  /** Jikū signs free cards only (JIKU-288); a paid organizer's card carries its brand alone. */
  signature: boolean;
  labels: { invites: string; scan: string; via: string };
  /** The direction of the card's own words, right to left in Arabic (JIKU-293). */
  direction: TextDirection;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/** The QR code as one SVG path, with a quiet zone of two modules. */
function JikuMark({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <g transform="translate(1, 2)">
        <path
          d="M 13 16 C 13 22 18 24 22 22 C 26 20 26 14 22 10 C 18 6 10 6 6 10 C 2 14 2 20 6 24"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />
        <path
          d="M 13 4 L 13 16 C 13 20 11 22 8 22 C 5 22 3 20 3 17"
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="13" cy="4" r="2" fill={color} />
      </g>
    </svg>
  );
}

function Hero({ data, children, padding }: { data: CardArtData; children: React.ReactNode; padding: number }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding,
        color: "#FFFFFF",
        backgroundColor: readableBrand(data.color),
        // The renderer fails on an undefined background, so the key is left out rather than emptied.
        ...(data.photo ? {} : { backgroundImage: brandBackground(data.style, data.color) }),
        overflow: "hidden",
      }}
    >
      {data.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.photo} alt="" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : null}
      {data.photo ? <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", backgroundImage: PHOTO_SHADE }} /> : null}
      {children}
    </div>
  );
}

function Organizer({ data, size }: { data: CardArtData; size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.4, fontFamily: "Inter", fontWeight: 700, fontSize: size * 0.5 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          borderRadius: data.style === "MODERN" ? 8 : size,
          background: "rgba(255,255,255,0.16)",
          border: "2px solid rgba(255,255,255,0.4)",
          fontSize: size * 0.36,
          overflow: "hidden",
        }}
      >
        {data.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initials(data.organizerName)
        )}
      </div>
      <div style={{ display: "flex" }}><CardText text={data.labels.invites} direction={data.direction} /></div>
    </div>
  );
}

/** A long event name steps its size down, so it wraps on a few lines instead of running off the card. */
function titleScale(name: string): number {
  if (name.length > 60) return 0.58;
  if (name.length > 40) return 0.72;
  if (name.length > 24) return 0.86;
  return 1;
}

function Title({ data, size }: { data: CardArtData; size: number }) {
  const tokens = CARD_STYLE_TOKENS[data.style];
  size = size * titleScale(data.eventName);
  return (
    <div
      style={{
        display: "flex",
        fontFamily: tokens.fontFamily,
        fontWeight: tokens.fontWeight,
        fontSize: size * tokens.titleScale,
        lineHeight: 0.98,
        // Letter spacing would break the joins between Arabic letters.
        letterSpacing: hasArabic(data.eventName) ? 0 : tokens.letterSpacing,
        textTransform: tokens.uppercase ? "uppercase" : "none",
        maxWidth: "92%",
      }}
    >
      <CardText text={data.eventName} wrap />
    </div>
  );
}

function Via({ data, size, color }: { data: CardArtData; size: number; color: string }) {
  if (!data.signature) return <div style={{ display: "flex" }} />;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.4, fontFamily: "Inter", fontWeight: 500, fontSize: size, color, flexShrink: 0, whiteSpace: "nowrap" }}>
      <JikuMark size={size * 1.3} color={color} />
      <CardText text={data.labels.via} direction={data.direction} />
    </div>
  );
}

/** The card people post: 60 % photo and title, 40 % date, place and QR code. */
export function PortraitCard({ data }: { data: CardArtData }) {
  const tokens = CARD_STYLE_TOKENS[data.style];
  const qr = qrPath(data.url);
  const heroHeight = PORTRAIT.height * 0.6;
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: tokens.panel }}>
      <div style={{ display: "flex", height: heroHeight }}>
        <Hero data={data} padding={64}>
          <Organizer data={data} size={64} />
          <Title data={data} size={124} />
        </Hero>
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          padding: "52px 64px 40px",
          gap: 40,
          color: tokens.panelInk,
          background: tokens.panel,
          borderTop: data.style === "MODERN" ? `12px solid ${tokens.panelInk}` : data.style === "ELEGANT" ? `3px solid ${tokens.detail}` : "none",
          borderRadius: data.style === "FESTIVE" ? "56px 56px 0 0" : 0,
          marginTop: data.style === "FESTIVE" ? -56 : 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 22 }}>
          {data.day ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
              <div style={{ display: "flex", fontFamily: tokens.fontFamily, fontWeight: tokens.fontWeight, fontSize: 168, lineHeight: 0.8 }}>
                {data.day}
              </div>
              <div style={{ display: "flex", flexDirection: "column", fontFamily: "Inter", paddingBottom: 6 }}>
                <div style={{ display: "flex", fontWeight: 700, fontSize: 34, letterSpacing: data.direction === "rtl" ? 0 : "0.08em", textTransform: "uppercase" }}>
                  <CardText text={data.month ?? ""} direction={data.direction} />
                </div>
                <div style={{ display: "flex", fontWeight: 500, fontSize: 32, color: tokens.panelMuted }}><CardText text={data.weekdayTime ?? ""} direction={data.direction} /></div>
              </div>
            </div>
          ) : null}
          {data.location ? (
            <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 500, fontSize: 32, color: tokens.panelMuted }}><CardText text={data.location} wrap /></div>
          ) : null}
          {data.answerBy ? (
            <div style={{ display: "flex" }}>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Inter",
                  fontWeight: 700,
                  fontSize: 28,
                  padding: "10px 22px",
                  borderRadius: data.style === "MODERN" ? 4 : 999,
                  background: data.style === "MODERN" ? tokens.panelInk : tokens.soft,
                  color: data.style === "MODERN" ? "#FFFFFF" : tokens.panelInk,
                }}
              >
                <CardText text={data.answerBy} direction={data.direction} />
              </div>
            </div>
          ) : null}
          <div style={{ display: "flex", marginTop: "auto" }}>
            <Via data={data} size={24} color={tokens.panelMuted} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", padding: 14, background: "#FFFFFF", borderRadius: Math.max(8, tokens.radius) }}>
            <svg width={250} height={250} viewBox={`0 0 ${qr.size} ${qr.size}`} shapeRendering="crispEdges">
              <path d={qr.path} fill="#111111" />
            </svg>
          </div>
          <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 700, fontSize: 26 }}><CardText text={data.labels.scan} direction={data.direction} /></div>
        </div>
      </div>
    </div>
  );
}

/** The link preview and the WhatsApp image: the photo, the title and the date, with Jikū as a signature. */
export function LandscapeCard({ data }: { data: CardArtData }) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <Hero data={data} padding={60}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <Organizer data={data} size={56} />
          <Via data={data} size={22} color="rgba(255,255,255,0.8)" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <Title data={data} size={96} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontFamily: "Inter", fontWeight: 700, fontSize: 28 }}>
              {[data.when, data.location, data.answerBy]
                .filter((part): part is string => Boolean(part))
                .map((part) => (
                  <div
                    key={part}
                    style={{
                      display: "flex",
                      padding: "8px 18px",
                      borderRadius: data.style === "MODERN" ? 4 : 999,
                      background: "rgba(255,255,255,0.16)",
                      border: "2px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    <CardText text={part} direction={part === data.location ? undefined : data.direction} />
                  </div>
                ))}
          </div>
        </div>
      </Hero>
    </div>
  );
}

/** The status card: the title high on the photo, the date, place and QR code low, all clear of the viewer's bands. */
export function StatusCard({ data }: { data: CardArtData }) {
  const tokens = CARD_STYLE_TOKENS[data.style];
  const qr = qrPath(data.url);
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: tokens.panel }}>
      <div style={{ display: "flex", height: 1120 }}>
        <Hero data={data} padding={72}>
          <div style={{ display: "flex", marginTop: STATUS_SAFE_BAND - 72 }}>
            <Organizer data={data} size={68} />
          </div>
          <Title data={data} size={136} />
        </Hero>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: `56px 72px ${STATUS_SAFE_BAND}px`,
          gap: 28,
          color: tokens.panelInk,
          background: tokens.panel,
          borderTop: data.style === "MODERN" ? `12px solid ${tokens.panelInk}` : data.style === "ELEGANT" ? `3px solid ${tokens.detail}` : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 18 }}>
            {data.day ? (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
                <div style={{ display: "flex", fontFamily: tokens.fontFamily, fontWeight: tokens.fontWeight, fontSize: 150, lineHeight: 0.8 }}>
                  {data.day}
                </div>
                <div style={{ display: "flex", flexDirection: "column", fontFamily: "Inter", paddingBottom: 6 }}>
                  <div style={{ display: "flex", fontWeight: 700, fontSize: 34, letterSpacing: data.direction === "rtl" ? 0 : "0.08em", textTransform: "uppercase" }}>
                    <CardText text={data.month ?? ""} direction={data.direction} />
                  </div>
                  <div style={{ display: "flex", fontWeight: 500, fontSize: 32, color: tokens.panelMuted }}><CardText text={data.weekdayTime ?? ""} direction={data.direction} /></div>
                </div>
              </div>
            ) : null}
            {data.location ? (
              <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 500, fontSize: 32, color: tokens.panelMuted }}><CardText text={data.location} wrap /></div>
            ) : null}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", padding: 14, background: "#FFFFFF", borderRadius: Math.max(8, tokens.radius) }}>
              <svg width={230} height={230} viewBox={`0 0 ${qr.size} ${qr.size}`} shapeRendering="crispEdges">
                <path d={qr.path} fill="#111111" />
              </svg>
            </div>
            <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 700, fontSize: 26 }}><CardText text={data.labels.scan} direction={data.direction} /></div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", gap: 24 }}>
          {data.answerBy ? (
            <div
              style={{
                display: "flex",
                fontFamily: "Inter",
                fontWeight: 700,
                fontSize: 28,
                padding: "10px 22px",
                borderRadius: data.style === "MODERN" ? 4 : 999,
                background: data.style === "MODERN" ? tokens.panelInk : tokens.soft,
                color: data.style === "MODERN" ? "#FFFFFF" : tokens.panelInk,
              }}
            >
              <CardText text={data.answerBy} direction={data.direction} />
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
          <Via data={data} size={24} color={tokens.panelMuted} />
        </div>
      </div>
    </div>
  );
}
