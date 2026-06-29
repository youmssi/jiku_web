"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { sendInvitationsAction } from "@/components/modules/organizer/services/guests";

const CHANNELS = [
  { value: "EMAIL", label: "Email" },
  { value: "WHATSAPP", label: "WhatsApp" },
] as const;

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
      const { queued, error } = await sendInvitationsAction(eventId, channels);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success(`Queued ${queued} invitation(s).`);
    });
  }

  return (
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
  );
}
