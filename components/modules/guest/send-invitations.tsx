"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { askRating } from "@/components/modules/feedback";
import { ResendVerificationButton } from "@/components/modules/identity";
import { trackEvent } from "@/lib/analytics";
import { effectivePrimaryChannel, INVITATION_CHANNEL_LABELS, type InvitationChannel } from "@/lib/channels";
import { billingRoute, eventSettingsRoute } from "@/lib/constants";
import { sendInvitationsAction } from "@/components/modules/guest/guest.service";

/**
 * Sends the invitations under the event's rule (JIKU-273): one invitation per
 * guest, on the event's primary channel, or on the other one when the guest
 * cannot be reached there and the event allows it. A guest already invited is
 * not sent the link twice, so sending again after adding guests only reaches
 * the new ones. Guests who have not answered can be reminded on a channel the
 * organizer picks.
 */
export function SendInvitations({
  eventId,
  enabledChannels,
  primaryChannel,
  channelFallback,
  reach,
  unanswered,
  onSent,
}: {
  eventId: string;
  enabledChannels: InvitationChannel[];
  primaryChannel: InvitationChannel | null;
  channelFallback: boolean;
  reach: Record<InvitationChannel, number>;
  /** Guests still to answer, who a reminder can reach. */
  unanswered: number;
  onSent?: () => void;
}) {
  const t = useTranslations("guests.send");
  const primary = effectivePrimaryChannel(enabledChannels, primaryChannel);
  const [reminderChannel, setReminderChannel] = useState<InvitationChannel | null>(primary);
  // A refusal the organizer can fix right here gets an inline way out.
  const [refusal, setRefusal] = useState<{ reason: "paywall" | "unverified"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (primary === null) {
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
  const other = enabledChannels.find((channel) => channel !== primary) ?? null;
  const rule =
    other === null
      ? t("rule.single", { channel: INVITATION_CHANNEL_LABELS[primary] })
      : channelFallback
        ? t("rule.fallback", { primary: INVITATION_CHANNEL_LABELS[primary], other: INVITATION_CHANNEL_LABELS[other] })
        : t("rule.noFallback", { primary: INVITATION_CHANNEL_LABELS[primary] });

  function run(reminder?: { channel: InvitationChannel }) {
    setRefusal(null);
    startTransition(async () => {
      const outcome = await sendInvitationsAction(eventId, reminder);
      if (!outcome.ok) {
        if (outcome.reason) {
          setRefusal({ reason: outcome.reason, message: outcome.error });
        } else {
          toast.error(outcome.error);
        }
        return;
      }
      trackEvent(reminder ? "invitation_reminded" : "invitation_sent", {
        channel: reminder?.channel ?? primary ?? "",
        count: outcome.data.queued,
      });
      if (!reminder) askRating("invitations_sent");
      toast.success(t(reminder ? "remind.queued" : "queued", { count: outcome.data.queued }));
      onSent?.();
    });
  }

  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend variant="label">{t("ruleTitle")}</FieldLegend>
        <FieldDescription>{rule}</FieldDescription>
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          {enabledChannels.map((channel) => (
            <li key={channel}>
              {INVITATION_CHANNEL_LABELS[channel]} · {t(`reach.${channel}`, { count: reach[channel] })}
            </li>
          ))}
        </ul>
        <FieldDescription>{t("once")}</FieldDescription>
      </FieldSet>
      {refusal?.reason === "paywall" ? (
        <Alert>
          <AlertTitle>{t("allowanceTitle")}</AlertTitle>
          <AlertDescription>
            {refusal.message}
            <Button asChild variant="outline" size="sm" className="mt-2 w-fit">
              <Link href={billingRoute(eventId)}>{t("allowanceCta")}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      {refusal?.reason === "unverified" ? (
        <Alert>
          <AlertTitle>{t("confirmEmailTitle")}</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            {refusal.message}
            <ResendVerificationButton />
          </AlertDescription>
        </Alert>
      ) : null}
      <Field orientation="horizontal" className="justify-end">
        <Button onClick={() => run()} disabled={isPending}>
          {isPending ? t("sending") : t("submit")}
        </Button>
      </Field>
      {unanswered > 0 ? (
        <FieldSet className="border-t pt-4">
          <FieldLegend variant="label">{t("remind.title")}</FieldLegend>
          <FieldDescription>{t("remind.description", { count: unanswered })}</FieldDescription>
          <RadioGroup
            value={reminderChannel ?? undefined}
            onValueChange={(value) => setReminderChannel(value as InvitationChannel)}
            aria-label={t("remind.channel")}
            className="flex flex-wrap gap-4"
          >
            {enabledChannels.map((channel) => (
              <Field key={channel} orientation="horizontal" className="w-auto">
                <RadioGroupItem value={channel} id={`remind-${channel}`} />
                <FieldLabel htmlFor={`remind-${channel}`} className="font-normal">
                  {INVITATION_CHANNEL_LABELS[channel]}
                </FieldLabel>
              </Field>
            ))}
          </RadioGroup>
          <Field orientation="horizontal" className="justify-end">
            <Button
              variant="outline"
              onClick={() => reminderChannel && run({ channel: reminderChannel })}
              disabled={isPending || reminderChannel === null}
            >
              {t("remind.submit")}
            </Button>
          </Field>
        </FieldSet>
      ) : null}
    </FieldGroup>
  );
}
