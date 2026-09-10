"use client";

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
 * Door links live in a Dialog triggered from the dashboard header: create and
 * revoke entrance links without leaving the overview.
 */
export function DoorLinksDialog({ eventId }: { eventId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <KeyRound className="size-3.5" data-icon="inline-start" />
          Door links
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Door links</DialogTitle>
          <DialogDescription>
            One link per entrance, given to the door person. Revoke to cut access
            immediately.
          </DialogDescription>
        </DialogHeader>
        <ValidatorLinks eventId={eventId} />
      </DialogContent>
    </Dialog>
  );
}
