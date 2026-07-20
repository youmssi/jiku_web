"use client";

import { useState, useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { INVITATION_CHANNELS, INVITATION_CHANNEL_LABELS } from "@/lib/channels";
import { removeGuestAction, setGuestExclusionAction } from "@/components/modules/guest/guest.service";

export interface GuestRow {
  id: string;
  name: string;
  contact: string;
  excludedFromInvitations: boolean;
  statuses: Record<string, string | null>;
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-muted-foreground">—</span>;
  }
  const variant =
    status === "SENT" ? "default" : status === "FAILED" ? "destructive" : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

function GuestRowActions({ eventId, guest }: { eventId: string; guest: GuestRow }) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function onToggleExclusion() {
    startTransition(async () => {
      const result = await setGuestExclusionAction(eventId, guest.id, !guest.excludedFromInvitations);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        guest.excludedFromInvitations
          ? `${guest.name} will receive future invitations again.`
          : `${guest.name} is excluded from future invitations.`,
      );
    });
  }

  function onRemove() {
    startTransition(async () => {
      const result = await removeGuestAction(eventId, guest.id);
      setConfirmOpen(false);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`${guest.name} was removed.`);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" disabled={isPending}>
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Guest actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onToggleExclusion}>
            {guest.excludedFromInvitations ? "Include in invitations" : "Exclude from invitations"}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              setConfirmOpen(true);
            }}
          >
            Remove guest
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {guest.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes them from the guest list. Guests who have already been invited
              can&apos;t be removed — exclude them instead to stop future invitations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onRemove} disabled={isPending}>
              {isPending ? "Removing…" : "Remove guest"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function createColumns(eventId: string): ColumnDef<GuestRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback className="text-[0.65rem]">{initials(row.original.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.original.name}</span>
          {row.original.excludedFromInvitations ? (
            <Badge variant="outline" className="text-muted-foreground">
              Excluded
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.contact}</span>
      ),
    },
    ...INVITATION_CHANNELS.map<ColumnDef<GuestRow>>((channel) => ({
      id: `channel-${channel}`,
      header: INVITATION_CHANNEL_LABELS[channel],
      enableSorting: false,
      cell: ({ row }) => <StatusBadge status={row.original.statuses[channel] ?? null} />,
    })),
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <GuestRowActions eventId={eventId} guest={row.original} />
        </div>
      ),
    },
  ];
}

export function GuestsTable({ eventId, rows }: { eventId: string; rows: GuestRow[] }) {
  return (
    <DataTable
      columns={createColumns(eventId)}
      data={rows}
      searchColumn="name"
      searchPlaceholder="Search guests by name…"
    />
  );
}
