import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const TIMEOUT_MS = Number(process.env.CARD_IMAGE_TIMEOUT_MS ?? 5_000);
const MAX_BYTES = Number(process.env.CARD_IMAGE_MAX_BYTES ?? 5_000_000);

/**
 * True for an address the server must never be led to fetch (JIKU-321):
 * loopback, private networks, link-local (cloud metadata), carrier NAT,
 * unspecified and multicast, in IPv4 and IPv6, including IPv4-mapped IPv6.
 */
export function isPrivateAddress(address: string): boolean {
  const mapped = address.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  const ip = mapped?.[1] ?? address;
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  return v6 === "::" || v6 === "::1" || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6) || v6.startsWith("ff");
}

/**
 * An organizer's image (logo, photo, banner) as a data URI, to draw it on a card.
 * Only `https://` on a public address, without redirects, within a time and size
 * limit; anything else gives null and the card is drawn without the image.
 */
export async function fetchPublicImage(link: string | null | undefined): Promise<string | null> {
  if (!link) return null;
  try {
    const url = new URL(link);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = url.hostname.replace(/^\[|\]$/g, "");
    const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
    if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) return null;
    const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(TIMEOUT_MS) });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !type.startsWith("image/") || !response.body) return null;
    if (Number(response.headers.get("content-length") ?? 0) > MAX_BYTES) return null;
    const chunks: Uint8Array[] = [];
    let size = 0;
    const reader = response.body.getReader();
    for (let part = await reader.read(); !part.done; part = await reader.read()) {
      size += part.value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(part.value);
    }
    return `data:${type};base64,${Buffer.concat(chunks).toString("base64")}`;
  } catch {
    return null;
  }
}
