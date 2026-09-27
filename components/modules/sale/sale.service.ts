"use server";

import { getTranslations } from "next-intl/server";
import { publicFetch } from "@/lib/api-server";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import { checkoutSchema, declareSchema, type CheckoutInput, type DeclareInput, type PlacedOrder } from "./schema";

function errors() {
  return getTranslations("guest.sale.errors");
}

/**
 * Places the order: the places are taken at once, or not at all. Returns the
 * order's link token, the buyer's only way back to it.
 */
export async function placeOrderAction(
  username: string,
  eventId: string,
  input: CheckoutInput,
): Promise<ActionResult<{ token: string }>> {
  const t = await errors();
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return fail(t("invalid"));
  const lines = Object.entries(parsed.data.quantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));
  if (lines.length === 0) return fail(t("nothingChosen"));
  const response = await publicFetch(
    `/public/orgs/${encodeURIComponent(username)}/events/${encodeURIComponent(eventId)}/orders`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lines,
        buyerName: parsed.data.buyerName,
        buyerPhone: parsed.data.buyerPhone,
        buyerEmail: parsed.data.buyerEmail || null,
      }),
    },
  );
  if (response.ok) return ok({ token: ((await response.json()) as PlacedOrder).token });
  switch (response.status) {
    case 400:
      return fail(t("invalid"));
    case 409:
      return fail(t("soldOut"));
    case 429:
      return fail(t("tooMany"));
    default:
      reportApiError(response, "sale");
      return fail(t("failed"));
  }
}

/** The buyer says it paid; the order then waits for the organization and no longer expires. */
export async function declarePaymentAction(token: string, input: DeclareInput): Promise<ActionResult> {
  const t = await errors();
  const parsed = declareSchema.safeParse(input);
  if (!parsed.success) return fail(t("invalid"));
  const response = await publicFetch(`/orders/${encodeURIComponent(token)}/declare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (response.ok) return ok(null);
  if (response.status === 409) return fail(t("cannotDeclare"));
  if (response.status >= 500) reportApiError(response, "sale");
  return fail(t("failed"));
}
