"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Plus, Send, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { InvitationChannel } from "@/lib/channels";
import { AddGuest } from "./add-guest";
import { GuestImport } from "./guest-import";
import { SendInvitations } from "./send-invitations";

/**
 * The guest list's toolbar actions, each in its own dialog: add a guest by
 * hand, import a file, or send the invitations. Row-level actions and their
 * confirmations live in the table.
 */
export function AddGuestDialog({ eventId }: { eventId: string }) {
  const t = useTranslations("guests.add");
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus data-icon="inline-start" />
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <AddGuest eventId={eventId} onAdded={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function ImportGuestsDialog({ eventId }: { eventId: string }) {
  const t = useTranslations("guests.import");
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload data-icon="inline-start" />
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <GuestImport eventId={eventId} onImported={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function SendInvitationsDialog({
  eventId,
  enabledChannels,
  reach,
}: {
  eventId: string;
  enabledChannels: InvitationChannel[];
  /** How many guests each channel can reach: an address for email, a number for WhatsApp. */
  reach: Record<InvitationChannel, number>;
}) {
  const t = useTranslations("guests.send");
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send data-icon="inline-start" />
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <SendInvitations
          eventId={eventId}
          enabledChannels={enabledChannels}
          reach={reach}
          onSent={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function ExportGuestsButton({ href }: { href: string }) {
  const t = useTranslations("guests");
  return (
    <Button variant="ghost" asChild>
      <a href={href} download>
        <Download data-icon="inline-start" />
        {t("export")}
      </a>
    </Button>
  );
}
