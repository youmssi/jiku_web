import type { RatingMoment } from "./schema";

const EVENT = "jiku:rating-moment";

/**
 * Tells the rating prompt that a key action just succeeded. Call it next to the
 * success toast; the prompt decides, with the backend, whether to ask. A no-op
 * outside the browser.
 */
export function askRating(moment: RatingMoment): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<RatingMoment>(EVENT, { detail: moment }));
}

export function onRatingMoment(listener: (moment: RatingMoment) => void): () => void {
  const handler = (event: Event) => listener((event as CustomEvent<RatingMoment>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
