"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { trackEvent } from "@/lib/analytics";
import { sendInvitationsAction } from "@/components/modules/guest/guest.service";
import { INVITATION_CHANNEL_LABELS, type InvitationChannel } from "@/lib/channels";
import { billingRoute, eventEditRoute } from "@/lib/constants";

export function SendInvitations({
  eventId,
  enabledChannels,
}: {
  eventId: string;
  /** Channels enabled in the event's settings (Event edit → Invitation channels). */
  enabledChannels: InvitationChannel[];
}) {
  const [channels, setChannels] = useState<string[]>(enabledChannels);
  const [paywallMessage, setPaywallMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (enabledChannels.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        No invitation channel is enabled for this event yet.{" "}
        <Link
          href={eventEditRoute(eventId)}
          className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
        >
          Enable Email or WhatsApp in event settings
        </Link>{" "}
        before sending invitations.
      </div>
    );
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
      toast.success(`Queued ${outcome.data.queued} invitation(s).`);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="sm"
          value={channels}
          onValueChange={(value) => setChannels(value as string[])}
        >
          {enabledChannels.map((channel) => (
            <ToggleGroupItem key={channel} value={channel}>
              {INVITATION_CHANNEL_LABELS[channel]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button onClick={onSend} disabled={isPending || channels.length === 0}>
          {isPending ? "Sending\u2026" : "Send invitations"}
        </Button>
      </div>
      {paywallMessage ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-medium">Guest allowance reached</p>
          <p className="mt-1">{paywallMessage}</p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href={billingRoute(eventId)}>Request more capacity</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
