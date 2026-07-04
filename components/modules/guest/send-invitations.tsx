"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { sendInvitationsAction } from "@/components/modules/guest/guest.service";
import { INVITATION_CHANNELS, INVITATION_CHANNEL_LABELS } from "@/lib/channels";

export function SendInvitations({ eventId }: { eventId: string }) {
  const [channels, setChannels] = useState<string[]>(["EMAIL"]);
  const [isPending, startTransition] = useTransition();

  function toggle(channel: string, checked: boolean) {
    setChannels((previous) =>
      checked
        ? Array.from(new Set([...previous, channel]))
        : previous.filter((value) => value !== channel),
    );
  }

  function onSend() {
    startTransition(async () => {
      const outcome = await sendInvitationsAction(eventId, channels);
      if (!outcome.ok) {
        toast.error(outcome.error);
        return;
      }
      toast.success(`Queued ${outcome.data.queued} invitation(s).`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {INVITATION_CHANNELS.map((channel) => (
        <div key={channel} className="flex items-center gap-2">
          <Checkbox
            id={`channel-${channel}`}
            checked={channels.includes(channel)}
            onCheckedChange={(checked) => toggle(channel, checked === true)}
          />
          <Label htmlFor={`channel-${channel}`} className="font-normal">
            {INVITATION_CHANNEL_LABELS[channel]}
          </Label>
        </div>
      ))}
      <Button onClick={onSend} disabled={isPending || channels.length === 0}>
        {isPending ? "Sending…" : "Send invitations"}
      </Button>
    </div>
  );
}
