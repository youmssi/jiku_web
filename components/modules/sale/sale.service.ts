"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { publicFetch, serverFetch } from "@/lib/api-server";
import { eventOrdersRoute } from "@/lib/constants";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import {
  checkoutSchema,
  declareSchema,
  rejectSchema,
  type CheckoutInput,
  type DeclareInput,
  type PlacedOrder,
  type RejectInput,
  type SalesSettings,
} from "./schema";

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

async function decide(eventId: string, orderId: string, action: "confirm" | "reject", body: object): Promise<ActionResult> {
  const t = await getTranslations("events.orders.errors");
  const response = await serverFetch(`/events/${encodeURIComponent(eventId)}/orders/${encodeURIComponent(orderId)}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (response.status === 409) return fail(t("alreadyDecided"));
  if (!response.ok) {
    reportApiError(response, "sale");
    return fail(t("failed"));
  }
  revalidatePath(eventOrdersRoute(eventId));
  return ok(null);
}

/** The money arrived: the order is paid and its tickets are issued, already paid. */
export async function confirmOrderAction(eventId: string, orderId: string): Promise<ActionResult> {
  return decide(eventId, orderId, "confirm", {});
}

/** The money did not arrive: the places go back on sale and the client reads [reason]. */
export async function rejectOrderAction(eventId: string, orderId: string, input: RejectInput): Promise<ActionResult> {
  const parsed = rejectSchema.safeParse(input);
  if (!parsed.success) return fail((await getTranslations("events.orders.errors"))("failed"));
  return decide(eventId, orderId, "reject", parsed.data);
}

/** How long an unpaid order keeps its places; null restores the platform default. */
export async function updateOrderHoldAction(orderHoldMinutes: number | null): Promise<ActionResult<SalesSettings>> {
  const t = await getTranslations("settings.sales");
  const response = await serverFetch("/settings/sales", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderHoldMinutes }),
  });
  if (response.status === 400) return fail(t("refused"));
  if (!response.ok) {
    reportApiError(response, "sale");
    return fail(t("failed"));
  }
  return ok((await response.json()) as SalesSettings);
}
