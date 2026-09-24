"use client";

import { useTranslations } from "next-intl";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ValidatorLinks } from "@/components/modules/checkin/validator-links";

/**
 * Door links live in a Dialog on the event overview: create and revoke
 * entrance links without leaving it.
 */
export function DoorLinksDialog({ eventId }: { eventId: string }) {
  const t = useTranslations("events.overview.doorLinks");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <KeyRound data-icon="inline-start" />
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <ValidatorLinks eventId={eventId} />
      </DialogContent>
    </Dialog>
  );
}
