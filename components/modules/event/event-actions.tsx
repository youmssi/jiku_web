"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Circle, MoreHorizontal, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { askRating } from "@/components/modules/feedback";
import { sendInvitationsAction } from "@/components/modules/guest";
import { ResendVerificationButton } from "@/components/modules/identity";
import { trackEvent } from "@/lib/analytics";
import { billingRoute, eventGuestsRoute } from "@/lib/constants";
import { publishEventAction } from "./event.service";
import { EventLifecycleDialog, type EventLifecycleAction } from "./event-lifecycle-dialog";
import { publishCheckHref } from "./publish-checks";
import { ChannelPicker } from "./channel-picker";
import type { InvitationChannel } from "./schema";
import type { PublishChecklist } from "./event.queries";

/**
 * The event header's actions. A draft gets a Publish button that opens the
 * checklist: every missing requirement links to the tab that fixes it, and the
 * event goes live from the same dialog once nothing required is missing. A
 * published event can be cancelled; a draft or a cancelled one deleted.
 */
export function EventActions({
  eventId,
  status,
  checklist,
  channels,
  canSend,
}: {
  eventId: string;
  status: string;
  checklist: PublishChecklist | null;
  channels: InvitationChannel[];
  /** False until the organizer confirms their email: invitations wait for it (JIKU-253). */
  canSend: boolean;
}) {
  const t = useTranslations("events");
  const [action, setAction] = useState<EventLifecycleAction | null>(null);

  return (
    <div className="flex items-center gap-2">
      {status === "DRAFT" && checklist ? <PublishDialog eventId={eventId} checklist={checklist} channels={channels} canSend={canSend} /> : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label={t("actions.more")}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status === "PUBLISHED" ? (
            <DropdownMenuItem variant="destructive" onSelect={() => setAction("cancel")}>
              {t("actions.cancel")}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem variant="destructive" onSelect={() => setAction("delete")}>
              {t("actions.delete")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <EventLifecycleDialog eventId={eventId} action={action} onOpenChange={(open) => !open && setAction(null)} />
    </div>
  );
}

function PublishDialog({
  eventId,
  checklist,
  channels,
  canSend,
}: {
  eventId: string;
  checklist: PublishChecklist;
  channels: InvitationChannel[];
  canSend: boolean;
}) {
  const t = useTranslations("events");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  // Publishing is done to invite: with guests on the list, both happen in one
  // confirmation, and publishing alone stays one quieter button away.
  const hasGuests = checklist.checks.some((check) => check.key === "guests" && check.done);
  // Before the address is confirmed, the event still goes live; the
  // invitations follow from the guests tab once it is.
  const sendNow = hasGuests && canSend;

  function publish(andSend: boolean) {
    startTransition(async () => {
      const result = await publishEventAction(eventId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      trackEvent("event_published");
      setOpen(false);
      if (!andSend) {
        toast.success(t("lifecycle.publish.done"));
        router.refresh();
        return;
      }
      const sent = await sendInvitationsAction(eventId);
      if (!sent.ok) {
        // The guests tab carries the fix for every refusal but the paywall:
        // its send panel offers to resend the confirmation link in place.
        const paywall = sent.reason === "paywall";
        toast.error(t("publish.publishedNotSent"), {
          description: sent.error,
          action: {
            label: paywall ? t("publish.openBilling") : t("publish.openGuests"),
            onClick: () => router.push(paywall ? billingRoute(eventId) : eventGuestsRoute(eventId)),
          },
        });
        router.refresh();
        return;
      }
      trackEvent("invitation_sent", { channel: channels.join(","), count: sent.data.queued });
      askRating("invitations_sent");
      toast.success(t("publish.publishedAndSent", { count: sent.data.queued }));
      router.push(eventGuestsRoute(eventId));
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Rocket data-icon="inline-start" />
          {t("actions.publish")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("publish.title")}</DialogTitle>
          <DialogDescription>
            {checklist.ready ? t("publish.ready") : t("publish.notReady")}
          </DialogDescription>
        </DialogHeader>
        <ItemGroup className="gap-2">
          {checklist.checks.map((check) => (
            <Item key={check.key} variant="outline" size="sm">
              <ItemMedia>
                {check.done ? (
                  <CheckCircle2 className="size-5 text-primary" aria-label={t("publish.done")} />
                ) : (
                  <Circle className="size-5 text-muted-foreground" aria-label={t("publish.todo")} />
                )}
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {t(`publish.checks.${check.key}.title`)}
                  {check.required ? null : <Badge variant="outline">{t("publish.recommended")}</Badge>}
                </ItemTitle>
                {check.done ? null : <ItemDescription>{t(`publish.checks.${check.key}.description`)}</ItemDescription>}
                {check.key === "channels" && !check.done ? (
                  <div className="pt-2">
                    <ChannelPicker eventId={eventId} initial={channels} />
                  </div>
                ) : null}
              </ItemContent>
              {check.done || check.key === "channels" ? null : (
                <ItemActions>
                  <Button asChild variant="outline" onClick={() => setOpen(false)}>
                    <Link href={publishCheckHref(check.key, eventId)}>{t("publish.fix")}</Link>
                  </Button>
                </ItemActions>
              )}
            </Item>
          ))}
        </ItemGroup>
        {hasGuests && !canSend ? (
          <Alert>
            <AlertTitle>{t("publish.confirmEmailTitle")}</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              {t("publish.confirmEmailDescription")}
              <ResendVerificationButton />
            </AlertDescription>
          </Alert>
        ) : null}
        <p className="text-sm text-muted-foreground">{t("publish.consequence")}</p>
        <DialogFooter>
          {sendNow ? (
            <>
              <Button variant="ghost" onClick={() => publish(false)} disabled={!checklist.ready || pending}>
                {t("publish.withoutSending")}
              </Button>
              <Button onClick={() => publish(true)} disabled={!checklist.ready || pending}>
                {pending ? t("lifecycle.working") : t("publish.andSend")}
              </Button>
            </>
          ) : (
            <Button onClick={() => publish(false)} disabled={!checklist.ready || pending}>
              {pending ? t("lifecycle.working") : t("lifecycle.publish.confirm")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
