import "server-only";

import { publicFetch } from "@/lib/api-server";
import { reportApiError } from "@/lib/action-result";
import type { Order, PublicSale } from "./schema";

/** The event's sale page; null for an unknown event or organization (a 404, never a degraded page). */
export async function fetchPublicSale(username: string, eventId: string): Promise<PublicSale | null> {
  const response = await publicFetch(`/public/orgs/${encodeURIComponent(username)}/events/${encodeURIComponent(eventId)}`);
  if (!response.ok) {
    if (response.status >= 500) reportApiError(response, "sale");
    return null;
  }
  return (await response.json()) as PublicSale;
}

/** The buyer's order, by its link token; null when the link is invalid. */
export async function fetchOrder(token: string): Promise<Order | null> {
  const response = await publicFetch(`/orders/${encodeURIComponent(token)}`);
  if (!response.ok) {
    if (response.status >= 500) reportApiError(response, "sale");
    return null;
  }
  return (await response.json()) as Order;
}
