"use server";

import { getTranslations } from "next-intl/server";
import { serverFetch } from "@/lib/api-server";
import { type ActionResult, fail, fromResponse } from "@/lib/action-result";
import type { LiveTicket } from "@/components/shared";
import { noticeIdSchema, type OrganizerNotice, type OrganizerNoticePage, type UnreadNotices } from "./schema";

const PAGE_SIZE = 20;

/** One page of the organization's notices, newest first, with the unread count. */
export async function fetchNoticesAction(page: number): Promise<ActionResult<OrganizerNoticePage>> {
  const safePage = Number.isInteger(page) && page >= 0 ? page : 0;
  const response = await serverFetch(`/notices?page=${safePage}&size=${PAGE_SIZE}`);
  const t = await getTranslations("shell.notices");
  return fromResponse<OrganizerNoticePage>(response, { default: t("loadError") });
}

/** How many notices are still unread; null when the bell cannot be reached. */
export async function fetchUnreadNoticesAction(): Promise<number | null> {
  const response = await serverFetch("/notices/unread-count");
  if (!response.ok) return null;
  return ((await response.json()) as UnreadNotices).unread;
}

export async function markNoticeReadAction(noticeId: string): Promise<ActionResult<OrganizerNotice>> {
  const t = await getTranslations("shell.notices");
  const parsed = noticeIdSchema.safeParse(noticeId);
  if (!parsed.success) return fail(t("loadError"));
  const response = await serverFetch(`/notices/${parsed.data}/read`, { method: "POST" });
  return fromResponse<OrganizerNotice>(response, { default: t("loadError") });
}

export async function markAllNoticesReadAction(): Promise<ActionResult<UnreadNotices>> {
  const response = await serverFetch("/notices/read-all", { method: "POST" });
  const t = await getTranslations("shell.notices");
  return fromResponse<UnreadNotices>(response, { default: t("loadError") });
}

/** A ticket to follow the bell live (JIKU-214); null when it cannot be followed. */
export async function fetchNoticesLiveTicketAction(): Promise<LiveTicket | null> {
  const response = await serverFetch("/notices/live-ticket");
  return response.ok ? ((await response.json()) as LiveTicket) : null;
}
