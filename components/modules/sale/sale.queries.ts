import "server-only";

import { publicFetch, serverFetch } from "@/lib/api-server";
import { reportApiError } from "@/lib/action-result";
import type { Order, OrganizerOrder, PublicSale, SalesSettings } from "./schema";

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

/** The event's orders, newest first, for the organization; empty when the read fails. */
export async function loadEventOrders(eventId: string): Promise<OrganizerOrder[]> {
  const response = await serverFetch(`/events/${encodeURIComponent(eventId)}/orders`);
  if (!response.ok) {
    reportApiError(response, "sale");
    return [];
  }
  return (await response.json()) as OrganizerOrder[];
}

/** The organization's public username, which the sale link is built on; null until it picks one. */
export async function loadOrgUsername(): Promise<string | null> {
  const response = await serverFetch("/orgs/profile");
  if (!response.ok) {
    reportApiError(response, "sale");
    return null;
  }
  return ((await response.json()) as { username?: string | null }).username ?? null;
}

/** The organization's ticket-sale settings; null when the read fails. */
export async function loadSalesSettings(): Promise<SalesSettings | null> {
  const response = await serverFetch("/settings/sales");
  if (!response.ok) {
    reportApiError(response, "sale");
    return null;
  }
  return (await response.json()) as SalesSettings;
}
