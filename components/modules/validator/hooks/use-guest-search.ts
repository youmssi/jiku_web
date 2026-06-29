"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchGuests } from "@/components/modules/validator/services/checkin";
import type { GuestMatch } from "@/components/modules/validator/checkin-types";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

/**
 * Cache/state layer for the manual guest search fallback. Debounces input and
 * holds the latest matches; only queries of at least two characters hit the
 * backend. A stale-response guard discards results from a superseded query.
 */
export function useGuestSearch(token: string, enabled = true) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GuestMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const latestQuery = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const trimmed = query.trim();
    const requestId = ++latestQuery.current;

    // A short query clears results (done asynchronously so the effect body never
    // updates state synchronously).
    if (trimmed.length < MIN_QUERY_LENGTH) {
      const clear = setTimeout(() => {
        if (requestId !== latestQuery.current) return;
        setResults([]);
        setIsSearching(false);
      }, 0);
      return () => clearTimeout(clear);
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const { data } = await searchGuests(token, trimmed);
      if (requestId !== latestQuery.current) {
        return; // a newer query has superseded this one
      }
      setResults(data ?? []);
      setIsSearching(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, token, enabled]);

  const reset = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return { query, setQuery, results, isSearching, reset };
}
