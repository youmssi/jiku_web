// CONTRACT — the organizer's notification bell (JIKU-314), mirroring the
// backend's OrganizerNoticeView / OrganizerNoticePage / UnreadNotices.
import { z } from "zod";
import type { Schema } from "@/lib/api-contract";

export type OrganizerNotice = Schema<"OrganizerNoticeView">;
export type OrganizerNoticePage = Schema<"OrganizerNoticePage">;
export type UnreadNotices = Schema<"UnreadNotices">;

/** A notice id as the bell sends it back; anything else is refused before any request. */
export const noticeIdSchema = z.string().uuid();

/** The kinds the bell knows how to word, keyed by the message they read as. */
export const NOTICE_MESSAGES = {
  "trial.GRANTED": "trialGranted",
  "trial.EXPIRING": "trialExpiring",
  "trial.EXPIRED": "trialExpired",
  "trial.ENDED": "trialEnded",
  "payment.CONFIRMED": "paymentConfirmed",
  "payment.REJECTED": "paymentRejected",
  "subscription.REACTIVATED": "subscriptionReactivated",
  "subscription.EXPIRING": "subscriptionExpiring",
  "subscription.GRACE_STARTED": "subscriptionGraceStarted",
  "subscription.EXPIRED": "subscriptionExpired",
  "payment-request.EXPIRED": "paymentRequestExpired",
  "invoice.ISSUED": "invoiceIssued",
  "gift.OFFERED": "giftOffered",
  "gift.APPLIED": "giftApplied",
  "gift.EXPIRING": "giftExpiring",
  "gift.EXPIRED": "giftExpired",
  "gift.REVOKED": "giftRevoked",
} as const;

export type NoticeMessage = (typeof NOTICE_MESSAGES)[keyof typeof NOTICE_MESSAGES];

export function noticeMessage(kind: string): NoticeMessage | null {
  return Object.hasOwn(NOTICE_MESSAGES, kind) ? NOTICE_MESSAGES[kind as keyof typeof NOTICE_MESSAGES] : null;
}

/** An organizer-space path the notice may open; external or protocol-relative links are dropped. */
export function safeNoticeLink(link: string | null): string | null {
  if (!link || !link.startsWith("/") || link.startsWith("//") || link.includes("\\")) return null;
  return link;
}
