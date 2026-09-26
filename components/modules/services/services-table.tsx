"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useServiceColumns } from "./services-columns";
import type { ServiceSummary } from "./schema";

/** Same toolbar shape as the events table: search plus a column-visibility toggle. */
function ServicesToolbar({
  table,
}: {
  table: Table<DataTableFeatures, ServiceSummary>;
}) {
  const t = useTranslations("services");
  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      <div className="relative max-w-sm flex-1">
        <Input
          placeholder={t("list.filter")}
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="pr-8"
        />
        <Search className="absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" className="ml-auto">
            <SlidersHorizontal className="size-3.5" />
            <span className="sr-only">{t("list.visibleColumns")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id === "timezone" ? t("columns.timezone") : t("columns.name")}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * The services list as a shadcn data-table, the same shape as the events
 * table: searchable, sortable, with hideable columns and concrete row actions
 * (consoles, rename, delete).
 */
export function ServicesTable({ services }: { services: ServiceSummary[] }) {
  const columns = useServiceColumns();
  return (
    <DataTable
      columns={columns}
      data={services}
      toolbar={(table) => <ServicesToolbar table={table} />}
    />
  );
}
