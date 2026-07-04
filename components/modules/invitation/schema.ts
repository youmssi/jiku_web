import type { Schema } from "@/lib/api-contract";

/**
 * Guest-facing RSVP view. Aliases the backend RsvpView and adds `erased`: the spec
 * snapshot was generated from a docs branch that predates guest self-erasure, so
 * that field is not yet in the schema. Once the API docs include it, regenerate
 * api-types.ts and drop the intersection.
 */
export type RsvpView = Schema<"RsvpView"> & { erased: boolean };
