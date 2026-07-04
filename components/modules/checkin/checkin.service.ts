"use server";

import { apiBaseUrl } from "@/lib/api";
import type {
  AttendanceResponse,
  CheckInResponse,
  GuestMatch,
  QueuedCheckIn,
  RosterEntry,
  SyncResultEntry,
} from "@/components/modules/checkin/schema";

/**
 * Validator check-in service layer. Each call reaches the public, token-scoped
 * backend endpoints (`/checkin/{token}/...`); the link token in the path is the
 * credential, so no Authorization header is attached. A revoked or expired link
 * surfaces as `linkInvalid`, which the UI uses to lock the screen.
 */

interface ServiceResult<T> {
  data?: T;
  error?: string;
  linkInvalid?: boolean;
}

async function call<T>(
  path: string,
  init: RequestInit,
): Promise<ServiceResult<T>> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}/checkin/${path}`, {
      ...init,
      cache: "no-store",
    });
  } catch {
    return { error: "Network error. Check your connection and try again." };
  }
  if (response.status === 403 || response.status === 404) {
    return { linkInvalid: true, error: "This check-in link is no longer valid." };
  }
  if (!response.ok) {
    return { error: "Something went wrong. Please try again." };
  }
  return { data: (await response.json()) as T };
}

export async function submitScan(
  token: string,
  ticketCode: string,
): Promise<ServiceResult<CheckInResponse>> {
  return call<CheckInResponse>(`${token}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticketCode }),
  });
}

export async function submitManualCheckIn(
  token: string,
  guestId: string,
): Promise<ServiceResult<CheckInResponse>> {
  return call<CheckInResponse>(`${token}/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guestId }),
  });
}

export async function searchGuests(
  token: string,
  query: string,
): Promise<ServiceResult<GuestMatch[]>> {
  const params = new URLSearchParams({ q: query });
  return call<GuestMatch[]>(`${token}/search?${params.toString()}`, {
    method: "GET",
  });
}

export async function fetchAttendance(
  token: string,
): Promise<ServiceResult<AttendanceResponse>> {
  return call<AttendanceResponse>(`${token}/stats`, { method: "GET" });
}

export async function fetchRoster(
  token: string,
): Promise<ServiceResult<RosterEntry[]>> {
  return call<RosterEntry[]>(`${token}/roster`, { method: "GET" });
}

export async function submitSync(
  token: string,
  items: QueuedCheckIn[],
): Promise<ServiceResult<SyncResultEntry[]>> {
  const payload = items.map((item) => ({
    ticketCode: item.ticketCode,
    scannedAt: item.scannedAt,
  }));
  return call<SyncResultEntry[]>(`${token}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: payload }),
  });
}
