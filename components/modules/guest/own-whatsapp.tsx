"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { whatsappChatLink } from "@/components/shared";
import { trackEvent } from "@/lib/analytics";
import { billingRoute } from "@/lib/constants";
import { markOwnWhatsAppSentAction, prepareOwnWhatsAppAction } from "@/components/modules/guest/guest.service";
import type { OwnWhatsAppGuest } from "@/components/modules/guest/schema";

/**
 * "Send from my WhatsApp" (JIKU-281): Jikū prepares each guest's personal link,
 * and the organizer sends it from their own WhatsApp, one chat at a time. The
 * message comes from someone the guest knows and costs nothing at Meta. Opening
 * a guest's chat marks the invitation sent; the next guest to send comes first.
 */
export function OwnWhatsAppDialog({
  eventId,
  eventName,
  eventWhen,
}: {
  eventId: string;
  eventName: string;
  /** The event's date, already written for people; null when it has none yet. */
  eventWhen: string | null;
}) {
  const t = useTranslations("guests.ownWhatsApp");
  const [open, setOpen] = useState(false);
  const [guests, setGuests] = useState<OwnWhatsAppGuest[] | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function prepare() {
    setRefusal(null);
    startTransition(async () => {
      const outcome = await prepareOwnWhatsAppAction(eventId);
      if (outcome.ok) {
        setGuests(outcome.data);
      } else if (outcome.reason === "paywall") {
        setRefusal(outcome.error);
      } else {
        toast.error(outcome.error);
      }
    });
  }

  function opened(guest: OwnWhatsAppGuest) {
    const sentAt = new Date().toISOString();
    setGuests((current) =>
      current?.map((row) => (row.guestId === guest.guestId ? { ...row, sentAt, sentByOrganizer: true } : row)) ?? null,
    );
    trackEvent("invitation_sent", { channel: "OWN_WHATSAPP", count: 1 });
    void markOwnWhatsAppSentAction(eventId, guest.guestId).then((outcome) => {
      if (!outcome.ok) toast.error(outcome.error);
    });
  }

  const toSend = guests?.filter((guest) => guest.link !== null) ?? [];
  const sent = toSend.filter((guest) => guest.sentAt !== null).length;
  // Unsent first, so the next chat to open is always at the top.
  const ordered = [...toSend].sort((a, b) => Number(a.sentAt !== null) - Number(b.sentAt !== null));
  const byJiku = (guests?.length ?? 0) - toSend.length;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && guests === null) prepare();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <MessageCircle data-icon="inline-start" />
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] flex-col">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {refusal ? (
          <Alert>
            <AlertTitle>{t("allowanceTitle")}</AlertTitle>
            <AlertDescription>
              {refusal}
              <Button asChild variant="outline" size="sm" className="mt-2 w-fit">
                <Link href={billingRoute(eventId)}>{t("allowanceCta")}</Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {guests === null && !refusal ? (
          <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground" role="status">
            <Loader2 aria-hidden className="size-4 animate-spin" />
            {t("preparing")}
          </p>
        ) : null}

        {guests !== null && toSend.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">{t(byJiku > 0 ? "allByJiku" : "noNumber")}</p>
        ) : null}

        {toSend.length > 0 ? (
          <>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium" aria-live="polite">
                {t("progress", { sent, total: toSend.length })}
              </p>
              <Progress value={(sent / toSend.length) * 100} aria-hidden />
            </div>
            <ul className="-mx-1 flex flex-col divide-y overflow-y-auto px-1">
              {ordered.map((guest) => {
                const message = t("message", {
                  firstName: guest.firstName,
                  event: eventName,
                  when: eventWhen ? `, ${eventWhen}` : "",
                  link: guest.link ?? "",
                });
                const done = guest.sentAt !== null;
                return (
                  <li key={guest.guestId} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {guest.firstName} {guest.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">{guest.phone}</p>
                    </div>
                    <Button asChild size="sm" variant={done ? "ghost" : "default"} className="shrink-0 max-md:h-11">
                      <a
                        href={whatsappChatLink(guest.phone, message)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => opened(guest)}
                        aria-label={t(done ? "sendAgainTo" : "sendTo", { name: `${guest.firstName} ${guest.lastName}` })}
                      >
                        {done ? <Check aria-hidden /> : <MessageCircle aria-hidden />}
                        {t(done ? "sent" : "send")}
                      </a>
                    </Button>
                  </li>
                );
              })}
            </ul>
            {byJiku > 0 ? <p className="text-xs text-muted-foreground">{t("byJiku", { count: byJiku })}</p> : null}
          </>
        ) : null}
        {isPending && guests !== null ? <span className="sr-only">{t("preparing")}</span> : null}
      </DialogContent>
    </Dialog>
  );
}
