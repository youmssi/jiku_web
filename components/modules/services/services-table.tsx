"use client";

import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { columns } from "./services-columns";
import type { ServiceSummary } from "./schema";

/**
 * The services list as a shadcn data-table: searchable and sortable, with
 * concrete row actions (consoles, rename, delete).
 */
export function ServicesTable({ services }: { services: ServiceSummary[] }) {
  return (
    <DataTable
      columns={columns}
      data={services}
      toolbar={(table) => (
        <div className="flex items-center py-4">
          <div className="relative max-w-sm flex-1">
            <Input
              placeholder="Filtrer par nom…"
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pr-8"
            />
            <Search className="absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      )}
    />
  );
}
