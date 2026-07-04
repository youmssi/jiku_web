import type { components } from "@/lib/api-types";

/**
 * Recursively strips the optionality springdoc omits from response schemas — it
 * does not emit `required`, so every field is generated as `field?` — while keeping
 * genuine `| null` unions intact. Backend response DTOs are always fully populated,
 * so treating their fields as present is both correct and far more ergonomic than
 * scattering `?.`/`??` across the UI.
 *
 * Regenerate the underlying types whenever the backend contract changes:
 *   see openapi/README.md
 */
export type DeepRequired<T> = T extends (infer U)[]
  ? DeepRequired<U>[]
  : T extends object
    ? { [K in keyof T]-?: DeepRequired<T[K]> }
    : T;

/** A fully-populated backend response schema, referenced by its OpenAPI name. */
export type Schema<K extends keyof components["schemas"]> = DeepRequired<
  components["schemas"][K]
>;
