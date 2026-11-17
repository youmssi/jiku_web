/** How a visitor reached a service's booking page (JIKU-189): the card's QR code, or the shared link. */
export type ServiceCardSource = "card" | "link";

export const SERVICE_CARD_SOURCES: readonly ServiceCardSource[] = ["card", "link"];

/** The booking page of service [code], tagged with the way in it is shared through. */
export function serviceCardLink(base: string, code: string, source: ServiceCardSource): string {
  return `${base}/r/${encodeURIComponent(code)}?src=${source}`;
}

/** The way in named by a `src` parameter, or null for any other visit, which is not counted. */
export function serviceCardSource(value: string | null | undefined): ServiceCardSource | null {
  return SERVICE_CARD_SOURCES.find((source) => source === value) ?? null;
}
