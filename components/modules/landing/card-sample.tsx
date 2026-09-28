import { CardHero, OrganizerMark } from "@/components/shared";
import { CARD_STYLE_TOKENS, displayTitle } from "@/lib/card-style";
import { qrPath } from "@/lib/qr-path";
import { cn } from "@/lib/utils";
import type { LandingCardSample } from "./content";
import { SAMPLE_PHOTO } from "./sample-photo";

/**
 * An invitation card drawn with the product's own styles (JIKU-194): the
 * banner with the organizer and the title, then the date and a QR code. The
 * QR code opens the site, so a visitor who scans it lands somewhere real.
 * Decorative: the section around it says what it shows.
 */
export function CardSample({
  sample,
  invites,
  url,
  className,
  size = "md",
}: {
  sample: LandingCardSample;
  invites: string;
  url: string;
  className?: string;
  size?: "md" | "lg";
}) {
  const tokens = CARD_STYLE_TOKENS[sample.style];
  const qr = qrPath(url);
  const large = size === "lg";
  return (
    <div
      aria-hidden
      className={cn("flex aspect-[4/5] flex-col overflow-hidden shadow-xl shadow-black/10", className)}
      style={{ borderRadius: tokens.radius, background: tokens.panel, color: tokens.panelInk }}
    >
      <CardHero
        style={sample.style}
        color={sample.color}
        bannerUrl={sample.photo ? SAMPLE_PHOTO : null}
        className="flex basis-[60%] flex-col justify-between"
      >
        <div className={cn("flex items-center gap-2 font-semibold", large ? "p-5 text-xs" : "p-4 text-[11px]")}>
          <OrganizerMark name={sample.organizer} logoUrl={null} square={sample.style === "MODERN"} />
          <span className="truncate">
            {sample.organizer} {invites}
          </span>
        </div>
        <p
          className={cn("text-balance", large ? "px-5 pb-5" : "px-4 pb-4")}
          style={displayTitle(tokens, large ? "2.35rem" : "1.6rem")}
        >
          {sample.event}
        </p>
      </CardHero>
      <div
        className={cn("flex flex-1 items-center justify-between gap-3", large ? "px-5" : "px-4")}
        style={{ borderTop: `3px solid ${tokens.detail}` }}
      >
        <p className={cn("font-semibold leading-snug", large ? "text-sm" : "text-xs")}>{sample.when}</p>
        <svg
          viewBox={`0 0 ${qr.size} ${qr.size}`}
          className={cn("shrink-0 rounded-md bg-white", large ? "size-20" : "size-14")}
          shapeRendering="crispEdges"
        >
          <path d={qr.path} fill="#0C0C0D" />
        </svg>
      </div>
    </div>
  );
}
