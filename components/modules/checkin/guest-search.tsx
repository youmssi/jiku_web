"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useGuestSearch } from "@/components/modules/checkin/useGuestSearch";
import type { RosterEntry } from "@/components/modules/checkin/schema";

interface GuestSearchProps {
  token: string;
  onSelect: (guestId: string) => void;
  isSubmitting: boolean;
  /** When offline, search filters the pre-synced roster locally instead of the server. */
  offline: boolean;
  roster: RosterEntry[];
}

interface Row {
  guestId: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  ticketStatus: string | null;
}

const MIN_QUERY = 2;

/**
 * Manual check-in fallback for the no-ticket case: search by name, email or phone
 * and tap a guest to check them in. One tap from the scanner view. Offline, it
 * filters the locally cached roster for instant results with no network (JIKU-25).
 */
export function GuestSearch({ token, onSelect, isSubmitting, offline, roster }: GuestSearchProps) {
  const search = useGuestSearch(token, !offline);

  const localResults = useMemo<Row[]>(() => {
    const term = search.query.trim().toLowerCase();
    if (!offline || term.length < MIN_QUERY) return [];
    return roster.filter((entry) =>
      [entry.name, entry.email ?? "", entry.phoneNumber ?? ""].some((field) =>
        field.toLowerCase().includes(term),
      ),
    );
  }, [offline, roster, search.query]);

  const results: Row[] = offline ? localResults : search.results;
  const isSearching = offline ? false : search.isSearching;
  const hasQuery = search.query.trim().length >= MIN_QUERY;

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input
        autoFocus
        value={search.query}
        onChange={(event) => search.setQuery(event.target.value)}
        placeholder="Search by name, email or phone"
        className="h-12 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
      />

      {isSearching ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-zinc-400">
          <Spinner className="size-4" /> Searching…
        </div>
      ) : null}

      {!isSearching && hasQuery && results.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">No matching guests.</p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {results.map((guest) => {
          const checkedIn = guest.ticketStatus === "CHECKED_IN";
          return (
            <li key={guest.guestId}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onSelect(guest.guestId)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left disabled:opacity-60"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-zinc-100">
                    {guest.name}
                  </span>
                  <span className="block truncate text-xs text-zinc-500">
                    {guest.email ?? guest.phoneNumber ?? ""}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    checkedIn
                      ? "bg-green-500/15 text-green-400"
                      : "bg-zinc-100 text-zinc-900"
                  }`}
                >
                  {checkedIn ? "Checked in" : "Check in"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
