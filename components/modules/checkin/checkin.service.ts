"use server";

import { getTranslations } from "next-intl/server";
import { publicFetch } from "@/lib/api-server";
import { reportApiError } from "@/lib/action-result";
import type {
  AttendanceResponse,
  CheckInResponse,
  GuestMatch,
  QueuedCheckIn,
  RosterEntry,
  SyncResultEntry,
} from "@/components/modules/checkin/schema";

/**
 * Validator check-in service layer. Each call reaches the public, link-scoped
 * backend endpoints under the console's door: `checkin/{token}` for an event's
 * door link, or `operator/{token}/events/{eventId}` for an operator working on
 * that event (JIKU-116). The link token in the path is the credential, so no
 * Authorization header is attached. A revoked or expired link surfaces as
 * `linkInvalid`, which the UI uses to lock the screen.
 */

/** The only two shapes a door can take; anything else never reaches the API. */
const DOOR = /^(checkin\/[A-Za-z0-9._-]+|operator\/[A-Za-z0-9._-]+\/events\/[0-9a-f-]{36})$/;

interface ServiceResult<T> {
  data?: T;
  error?: string;
  linkInvalid?: boolean;
}

async function call<T>(
  door: string,
  path: string,
  init: RequestInit,
): Promise<ServiceResult<T>> {
  const t = await getTranslations("operator.door.errors");
  if (!DOOR.test(door)) {
    return { linkInvalid: true, error: t("linkInvalid") };
  }
  let response: Response;
  try {
    response = await publicFetch(`/${door}${path}`, init);
  } catch {
    return { error: t("network") };
  }
  if (response.status === 403 || response.status === 404) {
    return { linkInvalid: true, error: t("linkInvalid") };
  }
  if (!response.ok) {
    reportApiError(response);
    return { error: t("generic") };
  }
  return { data: (await response.json()) as T };
}

export async function submitScan(
  door: string,
  ticketCode: string,
): Promise<ServiceResult<CheckInResponse>> {
  return call<CheckInResponse>(door, `/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticketCode }),
  });
}

/** Records that the guest paid the organization at the door (JIKU-110). */
export async function markTicketPaid(
  door: string,
  ticketCode: string,
  method: "MOBILE_MONEY" | "PAYMENT_LINK" | "CASH",
): Promise<ServiceResult<unknown>> {
  return call<unknown>(door, `/tickets/${encodeURIComponent(ticketCode)}/paid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method }),
  });
}

export async function submitManualCheckIn(
  door: string,
  guestId: string,
): Promise<ServiceResult<CheckInResponse>> {
  return call<CheckInResponse>(door, `/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guestId }),
  });
}

export async function searchGuests(
  door: string,
  query: string,
): Promise<ServiceResult<GuestMatch[]>> {
  const params = new URLSearchParams({ q: query });
  return call<GuestMatch[]>(door, `/search?${params.toString()}`, {
    method: "GET",
  });
}

export async function fetchAttendance(
  door: string,
): Promise<ServiceResult<AttendanceResponse>> {
  return call<AttendanceResponse>(door, `/stats`, { method: "GET" });
}

export async function fetchRoster(
  door: string,
): Promise<ServiceResult<RosterEntry[]>> {
  return call<RosterEntry[]>(door, `/roster`, { method: "GET" });
}

export async function submitSync(
  door: string,
  items: QueuedCheckIn[],
): Promise<ServiceResult<SyncResultEntry[]>> {
  const payload = items.map((item) => ({
    ticketCode: item.ticketCode,
    scannedAt: item.scannedAt,
  }));
  return call<SyncResultEntry[]>(door, `/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: payload }),
  });
}
