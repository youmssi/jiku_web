"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { trackEvent } from "@/lib/analytics";
import { INVITATION_CHANNEL_LABELS, type InvitationChannel } from "@/lib/channels";
import { billingRoute, eventSettingsRoute } from "@/lib/constants";
import { sendInvitationsAction } from "@/components/modules/guest/guest.service";

/**
 * Sends the invitations on the channels the organizer picks among those the
 * event allows, saying for each how many guests it can reach. A guest who
 * already received the link on a channel is not sent it twice, so sending
 * again after adding guests only reaches the new ones.
 */
export function SendInvitations({
  eventId,
  enabledChannels,
  reach,
  onSent,
}: {
  eventId: string;
  enabledChannels: InvitationChannel[];
  reach: Record<InvitationChannel, number>;
  onSent?: () => void;
}) {
  const t = useTranslations("guests.send");
  const [channels, setChannels] = useState<InvitationChannel[]>(enabledChannels);
  const [paywallMessage, setPaywallMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (enabledChannels.length === 0) {
    return (
      <Alert>
        <AlertTitle>{t("noChannelTitle")}</AlertTitle>
        <AlertDescription>
          {t("noChannelDescription")}
          <Button asChild size="sm" variant="outline" className="mt-2 w-fit">
            <Link href={`${eventSettingsRoute(eventId)}#invitations`}>{t("openSettings")}</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  function toggle(channel: InvitationChannel, checked: boolean) {
    setChannels((current) => (checked ? [...current, channel] : current.filter((value) => value !== channel)));
  }

  function onSend() {
    setPaywallMessage(null);
    startTransition(async () => {
      const outcome = await sendInvitationsAction(eventId, channels);
      if (!outcome.ok) {
        if (outcome.paywall) {
          setPaywallMessage(outcome.error);
        } else {
          toast.error(outcome.error);
        }
        return;
      }
      trackEvent("invitation_sent", { channel: channels.join(","), count: outcome.data.queued });
      toast.success(t("queued", { count: outcome.data.queued }));
      onSent?.();
    });
  }

  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend variant="label">{t("channels")}</FieldLegend>
        <FieldGroup className="gap-3">
          {enabledChannels.map((channel) => (
            <Field key={channel} orientation="horizontal">
              <Checkbox
                id={`channel-${channel}`}
                checked={channels.includes(channel)}
                onCheckedChange={(checked) => toggle(channel, checked === true)}
              />
              <FieldContent>
                <FieldLabel htmlFor={`channel-${channel}`}>{INVITATION_CHANNEL_LABELS[channel]}</FieldLabel>
                <FieldDescription>{t(`reach.${channel}`, { count: reach[channel] })}</FieldDescription>
              </FieldContent>
            </Field>
          ))}
        </FieldGroup>
        <FieldDescription>{t("once")}</FieldDescription>
      </FieldSet>
      {paywallMessage ? (
        <Alert>
          <AlertTitle>{t("allowanceTitle")}</AlertTitle>
          <AlertDescription>
            {paywallMessage}
            <Button asChild variant="outline" size="sm" className="mt-2 w-fit">
              <Link href={billingRoute(eventId)}>{t("allowanceCta")}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      <Field orientation="horizontal" className="justify-end">
        <Button onClick={onSend} disabled={isPending || channels.length === 0}>
          {isPending ? t("sending") : t("submit")}
        </Button>
      </Field>
    </FieldGroup>
  );
}
