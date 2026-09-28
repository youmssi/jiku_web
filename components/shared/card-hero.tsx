import type { ReactNode } from "react";
import { PHOTO_SHADE, brandBackground, type CardStyle } from "@/lib/card-style";
import { cn } from "@/lib/utils";

/**
 * The top of a guest page (JIKU-194): the event's banner photo, darkened so
 * white text stays readable, or the brand colour treated in the organizer's
 * style. Shared by the answer page and the ticket.
 */
export function CardHero({
  style,
  color,
  bannerUrl,
  className,
  children,
}: {
  style: CardStyle;
  color: string;
  bannerUrl: string | null | undefined;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("relative isolate overflow-hidden text-white", className)}
      style={{ backgroundColor: color, backgroundImage: bannerUrl ? undefined : brandBackground(style, color) }}
    >
      {bannerUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bannerUrl} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10" style={{ backgroundImage: PHOTO_SHADE }} />
        </>
      ) : null}
      {children}
    </div>
  );
}

/** The organizer's logo, or their initials, in a small round frame on a hero. */
export function OrganizerMark({ name, logoUrl, square }: { name: string; logoUrl: string | null | undefined; square?: boolean }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden border border-white/40 bg-white/15 text-[11px] font-bold",
        square ? "rounded-md" : "rounded-full",
      )}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="size-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}
