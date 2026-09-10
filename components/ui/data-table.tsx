"use client";

import * as React from "react";
import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowData,
  type SortingState,
  type Table,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import {
  Table as TablePrimitive,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dataTableFeatures, type DataTableFeatures } from "./data-table-features";

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  /** Column id to wire a search box to; omit for no built-in filtering. */
  searchColumn?: string;
  searchPlaceholder?: string;
  /** Optional toolbar rendered above the table, receiving the table instance. */
  toolbar?: (table: Table<DataTableFeatures, TData>) => React.ReactNode;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  searchColumn,
  searchPlaceholder = "Search…",
  toolbar,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({});

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const filterColumn = searchColumn ? table.getColumn(searchColumn) : undefined;

  return (
    <div className="flex flex-col gap-3">
      {toolbar ? toolbar(table) : null}

      {filterColumn ? (
        <Input
          placeholder={searchPlaceholder}
          value={(filterColumn.getFilterValue() as string) ?? ""}
          onChange={(event) => filterColumn.setFilterValue(event.target.value)}
          className="max-w-xs"
        />
      ) : null}

      <div className="overflow-hidden rounded-lg border">
        <TablePrimitive>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TablePrimitive>
      </div>

      {table.getPageCount() > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <span className="mr-auto text-xs text-muted-foreground">
            Page {(table.atoms.pagination?.get()?.pageIndex ?? 0) + 1} of{" "}
            {table.getPageCount()}
          </span>
          <ButtonGroup>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </ButtonGroup>
        </div>
      ) : null}
    </div>
  );
}
