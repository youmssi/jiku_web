"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEventColumns } from "./columns";
import type { EventListItem } from "./schema";

const STATUSES = ["PUBLISHED", "DRAFT", "CANCELLED"] as const;
const ALL = "ALL";

function EventsToolbar({ table }: { table: Table<DataTableFeatures, EventListItem> }) {
  const t = useTranslations("events");
  const status = (table.getColumn("status")?.getFilterValue() as string | undefined) ?? ALL;

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      <InputGroup className="max-w-sm flex-1">
        <InputGroupInput
          placeholder={t("list.search")}
          aria-label={t("list.search")}
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
      <Select
        value={status}
        onValueChange={(value) => table.getColumn("status")?.setFilterValue(value === ALL ? undefined : value)}
      >
        <SelectTrigger className="w-44" aria-label={t("list.columns.status")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("list.allStatuses")}</SelectItem>
          {STATUSES.map((value) => (
            <SelectItem key={value} value={value}>
              {t(`status.${value}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** The events list: searchable by name, filterable by status, sortable and paginated. */
export function EventsTable({ events }: { events: EventListItem[] }) {
  const columns = useEventColumns();
  return <DataTable columns={columns} data={events} toolbar={(table) => <EventsToolbar table={table} />} />;
}
