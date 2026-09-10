"use client";

import * as React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { columns } from "./columns";
import type { EventListItem } from "./schema";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "CANCELLED", label: "Cancelled" },
];

function EventsToolbar({
  table,
}: {
  table: Table<DataTableFeatures, EventListItem>;
}) {
  const [status, setStatus] = React.useState("ALL");

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      <div className="relative max-w-sm flex-1">
        <Input
          placeholder="Filter events by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="pr-8"
        />
        <Search className="absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>
      <Combobox
        value={status}
        onValueChange={(value) => {
          const next = typeof value === "string" ? value : "ALL";
          setStatus(next);
          table
            .getColumn("status")
            ?.setFilterValue(next === "ALL" ? "" : next);
        }}
      >
        <ComboboxInput className="w-44" placeholder="Status" />
        <ComboboxContent>
          <ComboboxList>
            {STATUS_OPTIONS.map((option) => (
              <ComboboxItem key={option.value} value={option.value}>
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" className="ml-auto">
            <SlidersHorizontal className="size-3.5" />
            <span className="sr-only">Toggle columns</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * The events list as a shadcn data-table: searchable by name, filterable by
 * status (combobox), sortable columns, hideable columns and pagination.
 */
export function EventsTable({ events }: { events: EventListItem[] }) {
  return (
    <DataTable
      columns={columns}
      data={events}
      toolbar={(table) => <EventsToolbar table={table} />}
    />
  );
}
