"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { attestConsentAction } from "@/components/modules/guest/guest.service";

/**
 * Imported guests the organizer has not yet confirmed agreed to hear from it
 * (JIKU-213): they cannot get a WhatsApp invitation from the Jikū number until
 * the organizer confirms it, once, for the event.
 */
export function ConsentBanner({ eventId, count }: { eventId: string; count: number }) {
  const t = useTranslations("guests.consent");
  const [isPending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const outcome = await attestConsentAction(eventId);
      if (!outcome.ok) {
        toast.error(outcome.error);
        return;
      }
      toast.success(t("done", { count: outcome.data.attestedGuests }));
    });
  }

  return (
    <Alert>
      <ShieldCheck />
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span>{t("description", { count })}</span>
        <Button size="sm" variant="outline" onClick={confirm} disabled={isPending}>
          {t("action")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
