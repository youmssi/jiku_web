import "server-only";

import { randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import QRCode from "qrcode";
import type { TwoStepEnrollment } from "@/components/shared/two-step";
import { COOKIES } from "@/lib/constants";

/** The surface a two-step sign-in belongs to: organizer space or platform desk. */
export type TwoStepSurface = "organizer" | "admin";

const CHALLENGE_COOKIE = { organizer: COOKIES.MFA_CHALLENGE, admin: COOKIES.ADMIN_MFA_CHALLENGE } as const;
const TRUSTED_COOKIE = { organizer: COOKIES.TRUSTED_DEVICE, admin: COOKIES.ADMIN_TRUSTED_DEVICE } as const;
/** Browsers cap a cookie's lifetime at 400 days; the browser id needs no less. */
const DEVICE_ID_MAX_AGE = 60 * 60 * 24 * 400;

/**
 * Seconds until a backend token expires, from its `exp` claim. The backend signs
 * and checks the token; this only lets the cookie holding it live as long as it
 * is valid, so lifetimes are configured once, on the backend (JIKU-317).
 */
function secondsLeft(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8")) as { exp?: unknown };
    if (typeof payload.exp !== "number") return 0;
    return Math.max(0, Math.floor(payload.exp - Date.now() / 1000));
  } catch {
    return 0;
  }
}

async function setTokenCookie(name: string, token: string): Promise<void> {
  const maxAge = secondsLeft(token);
  if (maxAge === 0) return;
  (await cookies()).set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

/** Keeps the step token between the password and the code, out of the page's reach. */
export async function setChallenge(surface: TwoStepSurface, token: string): Promise<void> {
  await setTokenCookie(CHALLENGE_COOKIE[surface], token);
}

export async function readChallenge(surface: TwoStepSurface): Promise<string | undefined> {
  return (await cookies()).get(CHALLENGE_COOKIE[surface])?.value;
}

export async function clearChallenge(surface: TwoStepSurface): Promise<void> {
  (await cookies()).delete(CHALLENGE_COOKIE[surface]);
}

/**
 * Holds the desk session a first setup opened (JIKU-317) until its backup codes
 * have been shown: opening it at once would send the page to the desk first.
 */
export async function holdAdminSession(accessToken: string): Promise<void> {
  await setTokenCookie(COOKIES.ADMIN_PENDING_SESSION, accessToken);
}

export async function takeAdminSession(): Promise<string | undefined> {
  const store = await cookies();
  const token = store.get(COOKIES.ADMIN_PENDING_SESSION)?.value;
  store.delete(COOKIES.ADMIN_PENDING_SESSION);
  return token;
}

/** "Don't ask again on this device": the backend's token, valid for as long as it says. */
export async function rememberDevice(surface: TwoStepSurface, token: string | null | undefined): Promise<void> {
  if (token) await setTokenCookie(TRUSTED_COOKIE[surface], token);
}

export async function trustedDeviceToken(surface: TwoStepSurface): Promise<string | undefined> {
  return (await cookies()).get(TRUSTED_COOKIE[surface])?.value;
}

/**
 * What the backend needs to tell this browser from another (JIKU-317): a random
 * id kept in a cookie of its own, and a short label from the user agent such as
 * "Chrome · Windows", shown in the list of sessions and in new-device emails.
 */
export async function deviceInfo(): Promise<{ deviceId: string; device: string }> {
  const store = await cookies();
  let deviceId = store.get(COOKIES.DEVICE_ID)?.value;
  if (!deviceId || !/^[A-Za-z0-9_-]{16,64}$/.test(deviceId)) {
    deviceId = randomBytes(18).toString("base64url");
    store.set(COOKIES.DEVICE_ID, deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DEVICE_ID_MAX_AGE,
    });
  }
  return { deviceId, device: deviceLabel((await headers()).get("user-agent") ?? "") };
}

const BROWSERS: ReadonlyArray<readonly [RegExp, string]> = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/SamsungBrowser/, "Samsung Internet"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const SYSTEMS: ReadonlyArray<readonly [RegExp, string]> = [
  [/Android/, "Android"],
  [/iPhone|iPad|iPod/, "iOS"],
  [/Windows/, "Windows"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

/** "Chrome · Android", or an empty string when the user agent says nothing usable. */
export function deviceLabel(userAgent: string): string {
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1];
  const system = SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1];
  return [browser, system].filter(Boolean).join(" · ");
}

/**
 * Draws the authentication app's QR code on the server as an SVG document, so the
 * secret it carries never travels through a third-party image service.
 */
export async function enrollmentFrom(start: { secret?: string; otpauthUri?: string }): Promise<TwoStepEnrollment | null> {
  if (!start.secret || !start.otpauthUri?.startsWith("otpauth://totp/")) return null;
  const qrSvg = await QRCode.toString(start.otpauthUri, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
  return { qrSvg, secret: start.secret };
}
