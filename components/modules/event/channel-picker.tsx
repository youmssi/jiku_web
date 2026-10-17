"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { setInvitationChannelsAction } from "./event.service";
import { INVITATION_CHANNEL_LABELS, INVITATION_CHANNELS, type InvitationChannel } from "./schema";

/**
 * The channels a draft invites on, chosen where the organizer already is
 * (JIKU-251): each tap is saved at once, so there is no form to leave
 * unsaved. At least one channel stays selected once one is chosen.
 */
export function ChannelPicker({ eventId, initial }: { eventId: string; initial: InvitationChannel[] }) {
  const t = useTranslations("events.setup");
  const router = useRouter();
  const [channels, setChannels] = useState<InvitationChannel[]>(initial);
  const [pending, startTransition] = useTransition();

  function change(next: InvitationChannel[]) {
    if (next.length === 0) return;
    const previous = channels;
    setChannels(next);
    startTransition(async () => {
      const result = await setInvitationChannelsAction(eventId, next);
      if (!result.ok) {
        setChannels(previous);
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <ToggleGroup
      type="multiple"
      variant="outline"
      value={channels}
      onValueChange={(value) => change(value as InvitationChannel[])}
      disabled={pending}
      aria-label={t("channelsLabel")}
    >
      {INVITATION_CHANNELS.map((channel) => (
        <ToggleGroupItem key={channel} value={channel} className="gap-1.5 px-4 max-md:h-11">
          {channels.includes(channel) ? <Check aria-hidden /> : null}
          {INVITATION_CHANNEL_LABELS[channel]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
