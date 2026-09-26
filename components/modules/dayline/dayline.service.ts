"use server";

import { getTranslations } from "next-intl/server";
import { serverFetch, publicFetch } from "@/lib/api-server";
import { fail, ok, reportApiError, type ActionResult, fromResponse } from "@/lib/action-result";
import type {
  DayLineAuth,
  DayLineView,
  LineActionResult,
  LineTicket,
  LineTransition,
  CollectedPaymentMethod,
  PendingAppointmentRequest,
  WalkInInput,
} from "@/components/modules/dayline/schema";

/**
 * Day-line console service layer (JIKU-88). The same operations serve the two
 * entrances of the console: the organizer (authenticated, `/services/{id}/day-line`)
 * and the counter staff (signed link in the path, `/line/{token}`, or an operator's
 * `/operator/{token}/services/{serviceId}`). Which surface
 * is used is carried by [DayLineAuth]; the backend endpoints are otherwise identical.
 */

/** The only two shapes a staff link can take; anything else never reaches the API. */
const STAFF_BASE = /^(line\/[A-Za-z0-9._-]+|operator\/[A-Za-z0-9._-]+\/services\/[0-9a-f-]{36})$/;

function basePath(auth: DayLineAuth): string {
  if (auth.kind === "organizer") return `/services/${auth.serviceId}/day-line`;
  if (!STAFF_BASE.test(auth.base)) throw new Error("Not a staff link");
  return `/${auth.base}`;
}

function fetchFor(auth: DayLineAuth, path: string, init: RequestInit = {}): Promise<Response> {
  return auth.kind === "organizer" ? serverFetch(path, init) : publicFetch(path, init);
}

async function lineMessages(staff: boolean): Promise<Partial<Record<number, string>> & { default?: string }> {
  const t = await getTranslations("operator.line.errors");
  return {
    409: t("conflict"),
    402: t("unpaid"),
    404: staff ? t("linkGone") : t("notFound"),
    default: t("failed"),
  };
}

/**
 * Resolves a counter link into the signed link the console works with. A short
 * code (JIKU-88) never contains a dot, a signed link always does; the code is
 * exchanged server-side, once, so the console never sees it. A revoked or unknown
 * code is an expected outcome, not an error worth reporting.
 */
export async function resolveCounterLinkAction(link: string): Promise<ActionResult<string>> {
  if (link.includes(".")) return ok(link);
  const response = await publicFetch(`/line-codes/${encodeURIComponent(link)}`);
  if (!response.ok) return fail((await getTranslations("operator.line.errors"))("counterLinkGone"));
  const { token } = (await response.json()) as { token: string };
  return ok(token);
}

/** The service's line for today (first list and refreshes). */
export async function fetchDayLineAction(
  auth: DayLineAuth,
): Promise<ActionResult<DayLineView>> {
  const response = await fetchFor(auth, basePath(auth));
  const t = await getTranslations("operator.line.errors");
  return fromResponse<DayLineView>(response, {
    404: auth.kind === "staff" ? t("counterLinkGone") : t("serviceNotFound"),
    default: t("loadFailed"),
  });
}

/** Calls the next person; a null ticket when nobody is waiting. */
export async function nextAction(auth: DayLineAuth): Promise<ActionResult<{ ticket: LineTicket | null }>> {
  const response = await fetchFor(auth, `${basePath(auth)}/next`, {
    method: "POST",
  });
  return fromResponse<{ ticket: LineTicket | null }>(response, await lineMessages(auth.kind === "staff"));
}

/** Adds a walk-in at the counter; returns the updated line. */
export async function walkInAction(
  auth: DayLineAuth,
  input: WalkInInput,
): Promise<ActionResult<DayLineView>> {
  const response = await fetchFor(auth, `${basePath(auth)}/walk-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const t = await getTranslations("operator.line.errors");
  return fromResponse<DayLineView>(response, {
    409: t("walkInClosed"),
    default: t("walkInFailed"),
  });
}

/** Moves a line entry on: arrived, called, being served, done, no-show. */
export async function transitionAction(
  auth: DayLineAuth,
  ticketCode: string,
  transition: LineTransition,
): Promise<ActionResult<LineActionResult>> {
  const response = await fetchFor(auth, `${basePath(auth)}/tickets/${ticketCode}/${transition}`, {
    method: "POST",
  });
  return fromResponse<LineActionResult>(response, await lineMessages(auth.kind === "staff"));
}

/** Records that the client paid the organization (JIKU-110), by [method]. */
export async function markPaidAction(
  auth: DayLineAuth,
  ticketCode: string,
  method: CollectedPaymentMethod,
): Promise<ActionResult<LineTicket>> {
  const response = await fetchFor(auth, `${basePath(auth)}/tickets/${ticketCode}/paid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method }),
  });
  return fromResponse<LineTicket>(response, await lineMessages(auth.kind === "staff"));
}

/** Appointment requests waiting for a decision (on-request mode). */
export async function fetchPendingRequestsAction(
  auth: DayLineAuth,
): Promise<ActionResult<PendingAppointmentRequest[]>> {
  const response = await fetchFor(auth, `${basePath(auth)}/requests`);
  const t = await getTranslations("operator.line.errors");
  return fromResponse<PendingAppointmentRequest[]>(response, {
    404: t("requestsNotFound"),
    default: t("requestsFailed"),
  });
}

/** Confirms a request: the appointment and its ticket are issued. */
export async function acceptPendingRequestAction(
  auth: DayLineAuth,
  requestId: string,
): Promise<ActionResult<null>> {
  return decidePendingRequest(auth, requestId, "accept");
}

/** Declines a request: the time is freed. */
export async function rejectPendingRequestAction(
  auth: DayLineAuth,
  requestId: string,
): Promise<ActionResult<null>> {
  return decidePendingRequest(auth, requestId, "reject");
}

/** The decision endpoints return no body. */
async function decidePendingRequest(
  auth: DayLineAuth,
  requestId: string,
  verb: "accept" | "reject",
): Promise<ActionResult<null>> {
  const response = await fetchFor(auth, `${basePath(auth)}/requests/${requestId}/${verb}`, {
    method: "POST",
  });
  if (response.ok) return ok(null);
  const t = await getTranslations("operator.line.errors");
  if (response.status === 409) return fail(t("requestConflict"));
  reportApiError(response);
  return fail(t("failed"));
}
