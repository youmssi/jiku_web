"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { searchTenantsAction } from "@/components/modules/admin/admin.service";
import type { TenantDirectoryEntry } from "@/components/modules/admin/schema";

/** Debounce delay for the tenant search-as-you-type request. */
const SEARCH_DELAY_MS = 250;

/**
 * Search-as-you-type organization picker backed by `GET /admin/tenants?query=`,
 * replacing raw tenant-id entry in admin forms (Grant Trial, agreements).
 */
export function TenantCombobox({
  value,
  onChange,
  placeholder = "Search organizations by name…",
  id,
}: {
  value: TenantDirectoryEntry | null;
  onChange: (tenant: TenantDirectoryEntry | null) => void;
  placeholder?: string;
  id?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TenantDirectoryEntry[]>([]);
  const [isPending, startTransition] = useTransition();
  const requestId = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Keep the current selection visible in the list while new results stream in.
  const items = useMemo(() => {
    if (!value || results.some((tenant) => tenant.id === value.id)) {
      return results;
    }
    return [value, ...results];
  }, [results, value]);

  function search(nextQuery: string) {
    setQuery(nextQuery);
    clearTimeout(debounceTimer.current);
    const trimmed = nextQuery.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    const id = ++requestId.current;
    debounceTimer.current = setTimeout(() => {
      startTransition(async () => {
        const tenants = await searchTenantsAction(trimmed);
        if (id === requestId.current) {
          setResults(tenants);
        }
      });
    }, SEARCH_DELAY_MS);
  }

  return (
    <Combobox<TenantDirectoryEntry>
      items={items}
      filter={null}
      value={value}
      onValueChange={onChange}
      onInputValueChange={search}
      itemToStringLabel={(tenant) => tenant.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
    >
      <ComboboxInput id={id} placeholder={placeholder} />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>
            {isPending ? "Searching…" : query.trim() ? "No matching organization." : "Type to search."}
          </ComboboxEmpty>
          {items.map((tenant) => (
            <ComboboxItem key={tenant.id} value={tenant}>
              {tenant.name}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
