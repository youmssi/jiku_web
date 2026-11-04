"use client";

import { useState, useTransition } from "react";
import { useFormatter, useNow, useTranslations } from "next-intl";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { whatsappChatLink } from "@/components/shared";
import { outgoingTranslator, type OutgoingWords } from "@/components/shared/outgoing-words";
import { trackEvent } from "@/lib/analytics";
import { billingRoute } from "@/lib/constants";
import {
  markOwnWhatsAppRemindedAction,
  markOwnWhatsAppSentAction,
  ownWhatsAppRemindersAction,
  prepareOwnWhatsAppAction,
} from "@/components/modules/guest/guest.service";
import type { OwnWhatsAppGuest, OwnWhatsAppReminder } from "@/components/modules/guest/schema";

type Tab = "invite" | "remind";

/**
 * "Send from my WhatsApp" (JIKU-281, JIKU-290): Jikū prepares each guest's
 * personal link, and the organizer sends it from their own WhatsApp, one chat
 * at a time; the same window reminds the invited guests who have not answered.
 * The message comes from someone the guest knows and costs nothing at Meta.
 * The window opens on the tab with something to do.
 */
export function OwnWhatsAppDialog({
  eventId,
  eventName,
  eventWhen,
  words,
}: {
  eventId: string;
  eventName: string;
  /** The event's date, already written for its guests; null when it has none yet. */
  eventWhen: string | null;
  /** The messages' words, in the event's guest language (JIKU-293). */
  words: OutgoingWords;
}) {
  const t = useTranslations("guests.ownWhatsApp");
  const [open, setOpen] = useState(false);
  const [guests, setGuests] = useState<OwnWhatsAppGuest[] | null>(null);
  const [reminders, setReminders] = useState<OwnWhatsAppReminder[] | null>(null);
  const [tab, setTab] = useState<Tab>("invite");
  const [refusal, setRefusal] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const when = eventWhen ? `, ${eventWhen}` : "";

  function load() {
    setRefusal(null);
    startTransition(async () => {
      const [prepared, toRemind] = await Promise.all([prepareOwnWhatsAppAction(eventId), ownWhatsAppRemindersAction(eventId)]);
      if (prepared.ok) {
        setGuests(prepared.data);
      } else if (prepared.reason === "paywall") {
        setRefusal(prepared.error);
        setGuests([]);
      } else {
        toast.error(prepared.error);
        setGuests([]);
      }
      if (toRemind.ok) setReminders(toRemind.data);
      else {
        toast.error(toRemind.error);
        setReminders([]);
      }
      const nothingToSend = prepared.ok && prepared.data.every((guest) => guest.link === null || guest.sentAt !== null);
      setTab(nothingToSend && toRemind.ok && toRemind.data.length > 0 ? "remind" : "invite");
    });
  }

  function sent(guest: OwnWhatsAppGuest) {
    const sentAt = new Date().toISOString();
    setGuests((current) =>
      current?.map((row) => (row.guestId === guest.guestId ? { ...row, sentAt, sentByOrganizer: true } : row)) ?? null,
    );
    trackEvent("invitation_sent", { channel: "OWN_WHATSAPP", count: 1 });
    void markOwnWhatsAppSentAction(eventId, guest.guestId).then((outcome) => {
      if (!outcome.ok) toast.error(outcome.error);
    });
  }

  function reminded(guest: OwnWhatsAppReminder) {
    const remindedAt = new Date().toISOString();
    setReminders((current) => current?.map((row) => (row.guestId === guest.guestId ? { ...row, remindedAt } : row)) ?? null);
    trackEvent("invitation_reminded", { channel: "OWN_WHATSAPP", count: 1 });
    void markOwnWhatsAppRemindedAction(eventId, guest.guestId).then((outcome) => {
      if (!outcome.ok) toast.error(outcome.error);
    });
  }

  const loading = guests === null || reminders === null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Reopening reloads: answers that came in meanwhile leave the reminders.
        if (next) load();
        else {
          setGuests(null);
          setReminders(null);
        }
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

        {loading ? (
          <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground" role="status">
            <Loader2 aria-hidden className="size-4 animate-spin" />
            {t("preparing")}
          </p>
        ) : (
          <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="flex min-h-0 flex-col gap-3">
            <TabsList className="w-full">
              <TabsTrigger value="invite" className="max-md:h-10">
                {t("tabs.invite", { count: guests.filter((guest) => guest.link !== null && guest.sentAt === null).length })}
              </TabsTrigger>
              <TabsTrigger value="remind" className="max-md:h-10">
                {t("tabs.remind", { count: reminders.filter((guest) => guest.remindedAt === null).length })}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="invite" className="flex min-h-0 flex-col gap-3">
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
              ) : (
                <InviteList guests={guests} eventName={eventName} when={when} words={words} onOpened={sent} />
              )}
            </TabsContent>
            <TabsContent value="remind" className="flex min-h-0 flex-col gap-3">
              <RemindList reminders={reminders} eventName={eventName} when={when} words={words} onOpened={reminded} />
            </TabsContent>
          </Tabs>
        )}
        {isPending && !loading ? <span className="sr-only">{t("preparing")}</span> : null}
      </DialogContent>
    </Dialog>
  );
}

function InviteList({
  guests,
  eventName,
  when,
  words,
  onOpened,
}: {
  guests: OwnWhatsAppGuest[];
  eventName: string;
  when: string;
  words: OutgoingWords;
  onOpened: (guest: OwnWhatsAppGuest) => void;
}) {
  const t = useTranslations("guests.ownWhatsApp");
  const outgoing = outgoingTranslator(words);
  const toSend = guests.filter((guest) => guest.link !== null);
  const byJiku = guests.length - toSend.length;
  if (toSend.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">{t(byJiku > 0 ? "allByJiku" : "noNumber")}</p>;
  }
  const sent = toSend.filter((guest) => guest.sentAt !== null).length;
  // Unsent first, so the next chat to open is always at the top.
  const ordered = [...toSend].sort((a, b) => Number(a.sentAt !== null) - Number(b.sentAt !== null));
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium" aria-live="polite">
          {t("progress", { sent, total: toSend.length })}
        </p>
        <Progress value={(sent / toSend.length) * 100} aria-hidden />
      </div>
      <ul className="-mx-1 flex flex-col divide-y overflow-y-auto px-1">
        {ordered.map((guest) => {
          const done = guest.sentAt !== null;
          return (
            <ChatRow
              key={guest.guestId}
              name={`${guest.firstName} ${guest.lastName}`}
              phone={guest.phone}
              href={whatsappChatLink(guest.phone, outgoing("invite", { firstName: guest.firstName, event: eventName, when, link: guest.link ?? "" }))}
              done={done}
              label={t(done ? "sent" : "send")}
              ariaLabel={t(done ? "sendAgainTo" : "sendTo", { name: `${guest.firstName} ${guest.lastName}` })}
              onOpened={() => onOpened(guest)}
            />
          );
        })}
      </ul>
      {byJiku > 0 ? <p className="text-xs text-muted-foreground">{t("byJiku", { count: byJiku })}</p> : null}
    </>
  );
}

function RemindList({
  reminders,
  eventName,
  when,
  words,
  onOpened,
}: {
  reminders: OwnWhatsAppReminder[];
  eventName: string;
  when: string;
  words: OutgoingWords;
  onOpened: (guest: OwnWhatsAppReminder) => void;
}) {
  const t = useTranslations("guests.ownWhatsApp");
  const outgoing = outgoingTranslator(words);
  const format = useFormatter();
  const now = useNow({ updateInterval: 60_000 });
  if (reminders.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">{t("allAnswered")}</p>;
  }
  // Never reminded first, then the longest ago: the next chat to open is at the top.
  const ordered = [...reminders].sort((a, b) => (a.remindedAt ?? "").localeCompare(b.remindedAt ?? ""));
  return (
    <>
      <p className="text-sm text-muted-foreground">{t("remindIntro", { count: reminders.length })}</p>
      <ul className="-mx-1 flex flex-col divide-y overflow-y-auto px-1">
        {ordered.map((guest) => (
          <ChatRow
            key={guest.guestId}
            name={`${guest.firstName} ${guest.lastName}`}
            phone={guest.remindedAt ? t("remindedAt", { when: format.relativeTime(new Date(guest.remindedAt), now) }) : guest.phone}
            href={whatsappChatLink(guest.phone, outgoing("reminder", { firstName: guest.firstName, event: eventName, when, link: guest.link }))}
            done={guest.remindedAt !== null}
            label={t(guest.remindedAt ? "remindAgain" : "remind")}
            ariaLabel={t("remindTo", { name: `${guest.firstName} ${guest.lastName}` })}
            onOpened={() => onOpened(guest)}
          />
        ))}
      </ul>
    </>
  );
}

/** One guest and the button that opens their WhatsApp chat with the message written. */
function ChatRow({
  name,
  phone,
  href,
  done,
  label,
  ariaLabel,
  onOpened,
}: {
  name: string;
  phone: string;
  href: string;
  done: boolean;
  label: string;
  ariaLabel: string;
  onOpened: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground tabular-nums">{phone}</p>
      </div>
      <Button asChild size="sm" variant={done ? "ghost" : "default"} className="shrink-0 max-md:h-11">
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onOpened} aria-label={ariaLabel}>
          {done ? <Check aria-hidden /> : <MessageCircle aria-hidden />}
          {label}
        </a>
      </Button>
    </li>
  );
}
