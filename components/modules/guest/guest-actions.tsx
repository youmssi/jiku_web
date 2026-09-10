"use client";

import * as React from "react";
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
import { AddGuest } from "./add-guest";
import { GuestImport } from "./guest-import";
import { SendInvitations } from "./send-invitations";
import type { InvitationChannel } from "@/lib/channels";

/**
 * Toolbar actions of the guest list, each opening a Dialog: add a guest by hand,
 * import a CSV, or send invitations. Destructive confirmations stay in the table
 * rows; this file only hosts the creation/sending flows.
 */
export function AddGuestDialog({ eventId }: { eventId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="size-3.5" data-icon="inline-start" />
          Add guest
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a guest</DialogTitle>
          <DialogDescription>
            Add one person to the list. They can be invited later with everyone else.
          </DialogDescription>
        </DialogHeader>
        <AddGuest eventId={eventId} />
      </DialogContent>
    </Dialog>
  );
}

export function ImportGuestsDialog({ eventId }: { eventId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="size-3.5" data-icon="inline-start" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import guests from a CSV file</DialogTitle>
          <DialogDescription>
            Columns needed: first name, last name, email, phone. Every row is checked
            before anything is imported.
          </DialogDescription>
        </DialogHeader>
        <GuestImport eventId={eventId} />
      </DialogContent>
    </Dialog>
  );
}

export function SendInvitationsDialog({
  eventId,
  enabledChannels,
  guestCount,
}: {
  eventId: string;
  enabledChannels: InvitationChannel[];
  guestCount: number;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Send className="size-3.5" data-icon="inline-start" />
          Send invitations
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send invitations</DialogTitle>
          <DialogDescription>
            {guestCount} guest{guestCount === 1 ? "" : "s"} on the list. Choose the
            channels and send — guests who already received a link on a channel
            won&apos;t get it twice.
          </DialogDescription>
        </DialogHeader>
        <SendInvitations eventId={eventId} enabledChannels={enabledChannels} />
      </DialogContent>
    </Dialog>
  );
}

export function ExportGuestsButton({ href }: { href: string }) {
  return (
    <Button variant="ghost" asChild>
      <a href={href} download>
        <Download className="size-3.5" data-icon="inline-start" />
        Export
      </a>
    </Button>
  );
}
