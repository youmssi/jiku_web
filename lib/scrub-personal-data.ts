/**
 * Redacts personal data from text before it leaves the browser or the server for a
 * third-party error tracker. Mirrors the backend's `PersonalDataScrubber` — the two
 * must stay in step, because the same guest email can reach the provider from
 * either side of the stack.
 *
 * Deliberately over-redacts: a bare numeric string that merely looks like a phone
 * number is redacted whether or not it is one. Losing a little debuggability is an
 * acceptable cost; leaking a guest's contact details is not.
 */

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

/**
 * The leading guard rejects a preceding `-` or `.` as well as a word character,
 * because a UUID's trailing group (`…-446655440000`) is otherwise a twelve-digit
 * run that matches — which would redact the correlation id this scrubber exists to
 * preserve.
 */
const PHONE = /(?<![\w.-])\+?\d[\d\s().-]{6,}\d(?!\w)/g;

export function scrubPersonalData(text: string): string {
    return text.replace(EMAIL, '[redacted-email]').replace(PHONE, '[redacted-phone]');
}
