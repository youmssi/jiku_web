"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { INVITATION_CHANNELS, INVITATION_CHANNEL_LABELS } from "@/lib/channels";

export interface GuestRow {
  id: string;
  name: string;
  contact: string;
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

const COLUMNS: ColumnDef<GuestRow>[] = [
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
];

export function GuestsTable({ rows }: { rows: GuestRow[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      data={rows}
      searchColumn="name"
      searchPlaceholder="Search guests by name…"
    />
  );
}
