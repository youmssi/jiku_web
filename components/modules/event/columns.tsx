"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTimeInZone } from "@/lib/datetime";
import { eventDashboardRoute } from "@/lib/constants";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import { EventRowActions } from "./event-row-actions";
import type { EventListItem } from "./schema";

const columnHelper = createColumnHelper<DataTableFeatures, EventListItem>();

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  CANCELLED: "destructive",
};

function statusLabel(status?: string): string {
  if (!status) {
    return "None";
  }
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: "includesString",
    cell: ({ row }) => {
      const event = row.original;
      return (
        <Link
          href={eventDashboardRoute(event.id ?? "")}
          className="font-medium hover:underline"
        >
          {event.name}
        </Link>
      );
    },
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: "includesString",
    cell: ({ row }) => {
      const status = row.original.status ?? "";
      return (
        <Badge variant={STATUS_VARIANTS[status] ?? "outline"}>
          {statusLabel(status)}
        </Badge>
      );
    },
  }),
  columnHelper.accessor("startDateTime", {
    id: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const event = row.original;
      return event.startDateTime
        ? formatDateTimeInZone(event.startDateTime, event.timezone ?? "UTC")
        : "No date set";
    },
  }),
  columnHelper.accessor("location", {
    header: "Location",
    enableHiding: true,
    cell: ({ row }) => row.original.location ?? "Not set",
  }),
  columnHelper.display({
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <EventRowActions event={row.original} />,
  }),
]);
