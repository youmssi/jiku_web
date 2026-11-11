// The answer to a card and its rules, without zod (JIKU-287): the card page's
// form checks them in the browser, and `respondSchema` (schema.ts) applies the
// same rules on the server, so the guest's page never downloads the zod library.

export const OPEN_ANSWERS = ["YES", "MAYBE", "NO"] as const;

export const NAME_MIN = 2;
export const NAME_MAX = 120;

/** A number with its country code, spaces removed: "+224620000000". */
export const PHONE_PATTERN = /^\+[1-9][0-9]{7,14}$/;

export function compactPhone(value: string): string {
  return value.replace(/\s+/g, "");
}
