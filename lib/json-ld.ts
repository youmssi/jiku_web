/**
 * A schema.org object serialized for an inline `<script type="application/ld+json">`.
 * `<` is escaped so no value, even one an organizer typed, can close the
 * script tag and inject markup.
 */
export function jsonLd(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
