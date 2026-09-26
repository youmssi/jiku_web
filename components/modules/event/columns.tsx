"use client";

import { useMemo } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import { eventRoute } from "@/lib/constants";
import { EventRowActions } from "./event-row-actions";
import { EventStatusBadge } from "./event-status-badge";
import type { EventListItem } from "./schema";

const columnHelper = createColumnHelper<DataTableFeatures, EventListItem>();

/** The events table's columns, labelled in the visitor's language and dated in each event's timezone. */
export function useEventColumns() {
  const t = useTranslations("events.list.columns");
  const format = useFormatter();

  return useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("name", {
          header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              {t("name")}
              <ArrowUpDown data-icon="inline-end" />
            </Button>
          ),
          filterFn: "includesString",
          cell: ({ row }) => (
            <Link href={eventRoute(row.original.id ?? "")} className="font-medium hover:underline">
              {row.original.name}
            </Link>
          ),
        }),
        columnHelper.accessor("status", {
          header: t("status"),
          filterFn: "includesString",
          cell: ({ row }) => <EventStatusBadge status={row.original.status ?? ""} />,
        }),
        columnHelper.accessor("startDateTime", {
          id: "date",
          header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              {t("date")}
              <ArrowUpDown data-icon="inline-end" />
            </Button>
          ),
          cell: ({ row }) => {
            const event = row.original;
            return event.startDateTime
              ? format.dateTime(new Date(event.startDateTime), {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: event.timezone,
                })
              : t("undated");
          },
        }),
        columnHelper.accessor("location", {
          header: t("location"),
          cell: ({ row }) => row.original.location ?? "—",
        }),
        columnHelper.display({
          id: "actions",
          enableSorting: false,
          cell: ({ row }) => <EventRowActions event={row.original} />,
        }),
      ]),
    [t, format],
  );
}
