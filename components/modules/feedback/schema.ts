// CONTRACT — organizer feedback (JIKU-133), mirroring the backend's
// FeedbackRequest / RatingRequest. Zod messages are `common.validation` keys.
import { z } from "zod";
import type { components } from "@/lib/api-types";

export const FEEDBACK_KINDS = ["PROBLEM", "QUESTION", "IDEA", "COMPLAINT"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

/**
 * The actions a rating is asked about. Each is asked once, and the backend
 * never asks one person twice within its prompt interval.
 */
export const RATING_MOMENTS = ["event_published", "invitations_sent", "guests_imported", "service_created"] as const;
export type RatingMoment = (typeof RATING_MOMENTS)[number];

export const feedbackFormSchema = z.object({
  kind: z.enum(FEEDBACK_KINDS),
  message: z.string().trim().min(3, "tooShort").max(4000, "tooLong"),
  contactEmail: z.string().trim().email("email").or(z.literal("")),
});

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export const ratingSchema = z.object({
  moment: z.enum(RATING_MOMENTS),
  score: z.number().int().min(1).max(5).nullable(),
  comment: z.string().trim().max(1000, "tooLong"),
});

export type RatingValues = z.infer<typeof ratingSchema>;

export type PromptDecision = components["schemas"]["PromptDecision"];
