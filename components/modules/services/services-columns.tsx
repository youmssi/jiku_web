"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { serviceManageRoute } from "@/lib/constants";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import { ServiceRowActions } from "./service-row-actions";
import type { ServiceSummary } from "./schema";

const columnHelper = createColumnHelper<DataTableFeatures, ServiceSummary>();

export const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nom
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: "includesString",
    cell: ({ row }) => (
      <Link
        href={serviceManageRoute(row.original.id)}
        className="font-medium hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  }),
  columnHelper.accessor("timezone", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fuseau horaire
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.timezone}</span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <ServiceRowActions service={row.original} />,
  }),
]);
