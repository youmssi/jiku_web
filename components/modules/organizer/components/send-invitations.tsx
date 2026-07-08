"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { billingRoute } from "@/lib/constants";
import { sendInvitationsAction } from "@/components/modules/organizer/services/guests";

const CHANNELS = [
  { value: "EMAIL", label: "Email" },
  { value: "WHATSAPP", label: "WhatsApp" },
] as const;

export function SendInvitations({ eventId }: { eventId: string }) {
  const [channels, setChannels] = useState<string[]>(["EMAIL"]);
  const [paywallMessage, setPaywallMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(channel: string, checked: boolean) {
    setChannels((previous) =>
      checked
        ? Array.from(new Set([...previous, channel]))
        : previous.filter((value) => value !== channel),
    );
  }

  function onSend() {
    setPaywallMessage(null);
    startTransition(async () => {
      const { queued, error, paywall } = await sendInvitationsAction(eventId, channels);
      if (paywall) {
        setPaywallMessage(error ?? null);
        return;
      }
      if (error) {
        toast.error(error);
        return;
      }
      toast.success(`Queued ${queued} invitation(s).`);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4">
        {CHANNELS.map((channel) => (
          <div key={channel.value} className="flex items-center gap-2">
            <Checkbox
              id={`channel-${channel.value}`}
              checked={channels.includes(channel.value)}
              onCheckedChange={(checked) => toggle(channel.value, checked === true)}
            />
            <Label htmlFor={`channel-${channel.value}`} className="font-normal">
              {channel.label}
            </Label>
          </div>
        ))}
        <Button onClick={onSend} disabled={isPending || channels.length === 0}>
          {isPending ? "Sending…" : "Send invitations"}
        </Button>
      </div>
      {paywallMessage ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-medium">Guest allowance reached</p>
          <p className="mt-1">{paywallMessage}</p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href={billingRoute(eventId)}>Purchase more capacity</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
