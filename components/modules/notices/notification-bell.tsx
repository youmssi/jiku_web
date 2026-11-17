"use client";

import { useState } from "react";
import { BellIcon } from "lucide-react";
import { useFormatter, useLocale, useNow, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useGiftText } from "@/components/modules/billing";
import { formatAmount } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { noticeMessage, safeNoticeLink, type OrganizerNotice } from "./schema";
import { useNotices } from "./useNotices";

/** Above this, the badge reads "9+". */
const BADGE_CAP = 9;

/**
 * The notification bell of the organizer header (JIKU-314): how many notices
 * are unread, and a panel listing what happened, each opening the screen it is
 * about.
 */
export function NotificationBell() {
  const t = useTranslations("shell.notices");
  const [open, setOpen] = useState(false);
  const notices = useNotices(open);
  const badge = notices.unread > BADGE_CAP ? `${BADGE_CAP}+` : String(notices.unread);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative max-md:size-11"
          aria-label={notices.unread > 0 ? t("openUnread", { count: notices.unread }) : t("open")}
        >
          <BellIcon aria-hidden />
          {notices.unread > 0 ? (
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] leading-none font-semibold text-white"
            >
              {badge}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] gap-0 p-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="text-sm font-semibold">{t("title")}</h2>
          {notices.unread > 0 ? (
            <Button variant="link" size="sm" className="h-auto p-0" onClick={() => void notices.markAllRead()}>
              {t("markAllRead")}
            </Button>
          ) : null}
        </div>
        <NoticeList notices={notices} onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

function NoticeList({
  notices,
  onNavigate,
}: {
  notices: ReturnType<typeof useNotices>;
  onNavigate: () => void;
}) {
  const t = useTranslations("shell.notices");

  if (notices.state === "idle" || notices.state === "loading") {
    return (
      <div className="flex flex-col gap-3 p-4" aria-busy="true" aria-label={t("loading")}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </div>
    );
  }

  if (notices.state === "error") {
    return (
      <div className="flex flex-col items-start gap-2 p-4" role="alert">
        <p className="text-sm text-muted-foreground">{notices.error}</p>
        <Button variant="outline" size="sm" onClick={() => void notices.retry()}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (notices.items.length === 0) {
    return (
      <Empty className="border-0 py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BellIcon aria-hidden />
          </EmptyMedia>
          <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ScrollArea className="max-h-[min(28rem,70dvh)]">
      <ul className="flex flex-col">
        {notices.items.map((notice) => (
          <li key={notice.id} className="border-b last:border-b-0">
            <NoticeItem
              notice={notice}
              onOpen={() => {
                void notices.markRead(notice.id);
                onNavigate();
              }}
              onRead={() => void notices.markRead(notice.id)}
            />
          </li>
        ))}
      </ul>
      {notices.hasMore ? (
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full" onClick={() => void notices.loadMore()}>
            {t("more")}
          </Button>
        </div>
      ) : null}
    </ScrollArea>
  );
}

function NoticeItem({
  notice,
  onOpen,
  onRead,
}: {
  notice: OrganizerNotice;
  onOpen: () => void;
  onRead: () => void;
}) {
  const t = useTranslations("shell.notices");
  const format = useFormatter();
  const text = useNoticeText(notice);
  const link = safeNoticeLink(notice.link);
  const now = useNow({ updateInterval: 60_000 });
  const unread = notice.readAt === null;
  const when = format.relativeTime(new Date(notice.createdAt), now);

  const body = (
    <>
      <span
        aria-hidden
        className={cn("mt-1.5 size-2 shrink-0 rounded-full", unread ? "bg-primary" : "bg-transparent")}
      />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={cn("text-sm", unread && "font-medium")}>{text}</span>
        <span className="text-xs text-muted-foreground">
          {unread ? <span className="sr-only">{t("unread")} · </span> : null}
          <time dateTime={notice.createdAt}>{when}</time>
        </span>
      </span>
    </>
  );

  const className = "flex w-full items-start gap-3 px-4 py-3 text-start hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none";

  if (link) {
    return (
      <Link href={link} className={className} onClick={onOpen}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={onRead}>
      {body}
    </button>
  );
}

/** What happened, in the organizer's language, from the notice's kind and parameters. */
function useNoticeText(notice: OrganizerNotice): string {
  const t = useTranslations("shell.notices.kinds");
  const format = useFormatter();
  const locale = useLocale();
  const giftText = useGiftText();
  const params = notice.params;
  const message = noticeMessage(notice.kind);
  if (!message) return t("other");

  const date = (value: string | undefined) => (value ? format.dateTime(new Date(value), { dateStyle: "long" }) : "");
  const amount =
    params.amountMinor && params.currency ? formatAmount(Number(params.amountMinor), params.currency, locale) : "";

  return t(message, {
    guests: Number(params.guests ?? 0),
    until: date(params.expiresAt),
    suspension: date(params.suspensionAt),
    amount,
    reference: params.reference ?? "",
    plan: params.plan ?? "",
    months: Number(params.months ?? 0),
    number: params.number ?? "",
    note: params.note ?? "",
    gift: params.giftKind
      ? giftText({
          kind: params.giftKind,
          guests: Number(params.guests ?? 0),
          days: Number(params.days ?? 0),
          plan: params.plan ?? "",
          months: Number(params.months ?? 0),
        })
      : "",
    claimBy: date(params.claimBy),
  });
}
