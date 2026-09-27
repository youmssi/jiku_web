"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { openInvitationAction } from "./open-invitation.service";

/** Opens the event's open invitation with the default settings, changeable afterwards. */
export function OpenInvitationStart({ eventId, published }: { eventId: string; published: boolean }) {
  const t = useTranslations("events.openInvitation.start");
  const [isPending, startTransition] = useTransition();

  function open() {
    startTransition(async () => {
      const result = await openInvitationAction(eventId);
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border p-6">
      <p className="font-medium">{t("title")}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li>{t("pointShare")}</li>
        <li>{t("pointAnswer")}</li>
        <li>{t("pointTicket")}</li>
        <li>{t("pointCount")}</li>
      </ul>
      {published ? null : <p className="text-sm text-muted-foreground">{t("publishFirst")}</p>}
      <Button type="button" onClick={open} disabled={isPending}>
        <Share2 aria-hidden />
        {t("open")}
      </Button>
    </div>
  );
}
