"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { eventDashboardRoute } from "@/lib/constants";
import {
  cancelEventAction,
  deleteEventAction,
  publishEventAction,
} from "./event.service";
import type { EventListItem } from "./schema";

type ActionKind = "publish" | "cancel" | "delete";

const ACTION_COPY: Record<
  ActionKind,
  { title: string; description: string; confirm: string; toast: string }
> = {
  publish: {
    title: "Publish this event?",
    description:
      "Publishing makes the event live and locks its details. Guests can start receiving invitations.",
    confirm: "Publish event",
    toast: "Event published.",
  },
  cancel: {
    title: "Cancel this event?",
    description:
      "Every issued ticket becomes invalid and no more RSVPs are accepted.",
    confirm: "Cancel the event",
    toast: "Event cancelled.",
  },
  delete: {
    title: "Delete this event?",
    description:
      "This permanently removes the event and all of its data. This cannot be undone.",
    confirm: "Delete event",
    toast: "Event deleted.",
  },
};

/**
 * Row actions for the events table: view the event's details, publish a draft,
 * cancel a published event, or delete a draft/cancelled event. Destructive
 * actions ask for confirmation in an AlertDialog, and cancelling offers an
 * opt-out for guest notifications.
 */
export function EventRowActions({ event }: { event: EventListItem }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [action, setAction] = React.useState<ActionKind | null>(null);
  const [notifyGuests, setNotifyGuests] = React.useState(true);
  const status = event.status ?? "DRAFT";
  const id = event.id ?? "";

  function run() {
    if (!action) {
      return;
    }
    const kind = action;
    startTransition(async () => {
      const result =
        kind === "publish"
          ? await publishEventAction(id)
          : kind === "cancel"
            ? await cancelEventAction(id, notifyGuests)
            : await deleteEventAction(id);
      setAction(null);
      setNotifyGuests(true);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(ACTION_COPY[kind].toast);
      router.refresh();
    });
  }

  const copy = action ? ACTION_COPY[action] : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={eventDashboardRoute(id)}>View details</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {status === "DRAFT" ? (
            <>
              <DropdownMenuItem onSelect={() => setAction("publish")}>
                Publish
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setAction("delete")}
              >
                Delete event
              </DropdownMenuItem>
            </>
          ) : null}
          {status === "PUBLISHED" ? (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setAction("cancel")}
            >
              Cancel event
            </DropdownMenuItem>
          ) : null}
          {status === "CANCELLED" ? (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setAction("delete")}
            >
              Delete event
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAction(null);
            setNotifyGuests(true);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy?.title}</AlertDialogTitle>
            <AlertDialogDescription>{copy?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          {action === "cancel" ? (
            <div className="flex items-center gap-2">
              <Checkbox
                id="notify-guests"
                checked={notifyGuests}
                onCheckedChange={(checked) => setNotifyGuests(checked === true)}
              />
              <label htmlFor="notify-guests" className="text-sm">
                Notify guests by email or WhatsApp
              </label>
            </div>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={
                action === "delete" || action === "cancel" ? "destructive" : "default"
              }
              onClick={run}
              disabled={pending}
            >
              {pending ? "Working…" : copy?.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
