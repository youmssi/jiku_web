"use client";

import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useGuestSearch } from "@/components/modules/validator/hooks/use-guest-search";

interface GuestSearchProps {
  token: string;
  onSelect: (guestId: string) => void;
  isSubmitting: boolean;
}

/**
 * Manual check-in fallback for the no-ticket case: search by name, email or phone
 * and tap a guest to check them in. One tap from the scanner view, never buried.
 */
export function GuestSearch({ token, onSelect, isSubmitting }: GuestSearchProps) {
  const { query, setQuery, results, isSearching } = useGuestSearch(token);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name, email or phone"
        className="h-12 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
      />

      {isSearching ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-zinc-400">
          <Spinner className="size-4" /> Searching…
        </div>
      ) : null}

      {!isSearching && query.trim().length >= 2 && results.length === 0 ? (
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
