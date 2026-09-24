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
import { searchTenantEventsAction } from "@/components/modules/admin/admin.service";
import type { AdminEventSummary } from "@/components/modules/admin/schema";

/** Debounce delay for the event search-as-you-type request. */
const SEARCH_DELAY_MS = 250;

/**
 * Search-as-you-type event picker scoped to one organization, replacing raw
 * event-id entry in the trial grant form. Disabled until a tenant is chosen —
 * an event only makes sense once its organization is known. The caller is
 * responsible for clearing `value` when `tenantId` changes (from the same
 * event handler that changed the tenant), since a picked event never survives
 * a change of organization.
 */
export function EventCombobox({
  tenantId,
  value,
  onChange,
  id,
}: {
  tenantId: string | null;
  value: AdminEventSummary | null;
  onChange: (event: AdminEventSummary | null) => void;
  id?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminEventSummary[]>([]);
  const [isPending, startTransition] = useTransition();
  const requestId = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const items = useMemo(() => {
    if (!value || results.some((event) => event.id === value.id)) {
      return results;
    }
    return [value, ...results];
  }, [results, value]);

  function search(nextQuery: string) {
    setQuery(nextQuery);
    clearTimeout(debounceTimer.current);
    if (!tenantId) {
      setResults([]);
      return;
    }
    const id = ++requestId.current;
    debounceTimer.current = setTimeout(() => {
      startTransition(async () => {
        const events = await searchTenantEventsAction(tenantId, nextQuery.trim());
        if (id === requestId.current) {
          setResults(events);
        }
      });
    }, SEARCH_DELAY_MS);
  }

  return (
    <Combobox<AdminEventSummary>
      items={items}
      filter={null}
      value={value}
      onValueChange={onChange}
      onInputValueChange={search}
      itemToStringLabel={(event) => event.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
      disabled={!tenantId}
    >
      <ComboboxInput
        id={id}
        placeholder={tenantId ? "Search this organization's events…" : "Pick an organization first"}
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>
            {isPending
              ? "Searching…"
              : query.trim()
                ? "No matching event."
                : "Type to search, or leave blank to see recent events."}
          </ComboboxEmpty>
          {items.map((event) => (
            <ComboboxItem key={event.id} value={event}>
              {event.name}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
