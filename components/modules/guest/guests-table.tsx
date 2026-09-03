"use client";

import { useState, useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { attendanceCertificateRoute } from "@/lib/constants";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TicketTypeResponse } from "@/components/modules/event";
import { readableTextColor } from "@/lib/color-contrast";
import { INVITATION_CHANNELS, INVITATION_CHANNEL_LABELS } from "@/lib/channels";
import {
  removeGuestAction,
  setGuestExclusionAction,
  setGuestTicketTypeAction,
} from "@/components/modules/guest/guest.service";

export interface GuestRow {
  id: string;
  name: string;
  contact: string;
  excludedFromInvitations: boolean;
  /** Heure d'entrée, si la personne est venue — décide de l'attestation (JIKU-95). */
  checkedInAt: string | null;
  statuses: Record<string, string | null>;
  /** Catégorie d'accès (JIKU-93), absente si l'événement n'en définit pas. */
  ticketTypeId: string | null;
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

/** Pastille de catégorie d'accès (JIKU-93), lisible sur n'importe quelle couleur. */
function TicketTypeBadge({ type }: { type: TicketTypeResponse }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: type.colorHex, color: readableTextColor(type.colorHex) }}
    >
      {type.label}
    </span>
  );
}

function GuestRowActions({
  eventId,
  guest,
  ticketTypes,
}: {
  eventId: string;
  guest: GuestRow;
  ticketTypes: TicketTypeResponse[];
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function onSetTicketType(ticketTypeId: string | null) {
    startTransition(async () => {
      const result = await setGuestTicketTypeAction(eventId, guest.id, ticketTypeId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const label = ticketTypes.find((type) => type.id === ticketTypeId)?.label;
      toast.success(
        label ? `${guest.name} : catégorie ${label}.` : `${guest.name} n'a plus de catégorie.`,
      );
    });
  }

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
          {ticketTypes.length > 0 ? (
            <>
              <DropdownMenuLabel>Catégorie d&apos;accès</DropdownMenuLabel>
              {ticketTypes.map((type) => (
                <DropdownMenuItem
                  key={type.id}
                  disabled={type.id === guest.ticketTypeId}
                  onClick={() => onSetTicketType(type.id)}
                >
                  <span
                    aria-hidden
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: type.colorHex }}
                  />
                  {type.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                disabled={guest.ticketTypeId === null}
                onClick={() => onSetTicketType(null)}
              >
                Aucune catégorie
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {guest.checkedInAt ? (
            // Une attestation ne s'émet que pour quelqu'un qui est venu : la
            // proposer autrement mènerait à un refus que rien n'annonçait.
            <DropdownMenuItem asChild>
              <a href={attendanceCertificateRoute(eventId, guest.id)} download>
                Attestation de présence
              </a>
            </DropdownMenuItem>
          ) : null}
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

function createColumns(
  eventId: string,
  ticketTypes: TicketTypeResponse[],
): ColumnDef<GuestRow>[] {
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
    // La colonne n'apparaît que si l'événement définit des catégories : la
    // plupart n'en ont pas, et une colonne de tirets n'aide personne.
    ...(ticketTypes.length > 0
      ? [
          {
            id: "ticketType",
            header: "Catégorie",
            enableSorting: false,
            cell: ({ row }) => {
              const type = ticketTypes.find((it) => it.id === row.original.ticketTypeId);
              return type ? (
                <TicketTypeBadge type={type} />
              ) : (
                <span className="text-muted-foreground">—</span>
              );
            },
          } satisfies ColumnDef<GuestRow>,
        ]
      : []),
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
          <GuestRowActions eventId={eventId} guest={row.original} ticketTypes={ticketTypes} />
        </div>
      ),
    },
  ];
}

export function GuestsTable({
  eventId,
  rows,
  ticketTypes = [],
}: {
  eventId: string;
  rows: GuestRow[];
  ticketTypes?: TicketTypeResponse[];
}) {
  return (
    <DataTable
      columns={createColumns(eventId, ticketTypes)}
      data={rows}
      searchColumn="name"
      searchPlaceholder="Search guests by name…"
    />
  );
}
