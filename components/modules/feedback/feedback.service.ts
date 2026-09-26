"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { serverFetch } from "@/lib/api-server";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import {
  feedbackFormSchema,
  ratingSchema,
  RATING_MOMENTS,
  type FeedbackFormValues,
  type PromptDecision,
  type RatingMoment,
  type RatingValues,
} from "@/components/modules/feedback/schema";

/** Sends a message to the platform team; the page it came from travels with it. */
export async function sendFeedbackAction(values: FeedbackFormValues, page: string): Promise<ActionResult> {
  const t = await getTranslations("feedback.form");
  const parsed = feedbackFormSchema.safeParse(values);
  if (!parsed.success) return fail(t("invalid"));
  const response = await serverFetch("/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: parsed.data.kind,
      message: parsed.data.message,
      contactEmail: parsed.data.contactEmail || null,
      page: page.slice(0, 255),
      language: await getLocale(),
    }),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail(response.status === 429 ? t("tooMany") : t("failed"));
  }
  return ok(null);
}

/** Whether to ask for a rating of [moment] now. Never throws: no answer means "don't ask". */
export async function shouldAskRatingAction(moment: RatingMoment): Promise<boolean> {
  if (!RATING_MOMENTS.includes(moment)) return false;
  const response = await serverFetch(`/feedback/prompt?moment=${moment}`);
  if (!response.ok) return false;
  const decision = (await response.json().catch(() => null)) as PromptDecision | null;
  return decision?.show === true;
}

/** Records a rating, or a dismissed prompt when the score is null. */
export async function sendRatingAction(values: RatingValues, page: string): Promise<ActionResult> {
  const t = await getTranslations("feedback.rating");
  const parsed = ratingSchema.safeParse(values);
  if (!parsed.success) return fail(t("failed"));
  const response = await serverFetch("/feedback/ratings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      moment: parsed.data.moment,
      score: parsed.data.score,
      comment: parsed.data.comment || null,
      page: page.slice(0, 255),
    }),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail(t("failed"));
  }
  return ok(null);
}
