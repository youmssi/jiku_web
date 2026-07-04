"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchAttendance,
  fetchRoster,
  submitManualCheckIn,
  submitScan,
  submitSync,
} from "@/components/modules/checkin/checkin.service";
import {
  enqueueCheckIn,
  loadQueue,
  loadRoster,
  removeQueued,
  saveRoster,
} from "@/components/modules/checkin/offline-db";
import type {
  AttendanceResponse,
  CheckInResponse,
  RosterEntry,
} from "@/components/modules/checkin/schema";

interface Initial {
  checkedIn: number;
  confirmed: number;
}

/**
 * Cache/state layer for offline-capable check-in (JIKU-25). Holds the pre-synced
 * roster and the offline queue (both persisted in IndexedDB), resolves scans and
 * searches against the local roster for instant feedback, queues check-ins while
 * offline, and flushes the queue automatically when connectivity returns —
 * reconciling each result against the server's first-timestamp-wins decision.
 */
export function useOfflineCheckIn(token: string, initial: Initial) {
  const [result, setResult] = useState<CheckInResponse | null>(null);
  const [attendance, setAttendance] = useState<AttendanceResponse>(initial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [roster, setRoster] = useState<RosterEntry[]>([]);

  const rosterRef = useRef<RosterEntry[]>([]);
  const flushingRef = useRef(false);

  const commitRoster = useCallback((entries: RosterEntry[]) => {
    rosterRef.current = entries;
    setRoster(entries);
  }, []);

  const patchLocal = useCallback(
    (ticketCode: string, by: string, at: string) => {
      const next = rosterRef.current.map((entry) =>
        entry.ticketCode === ticketCode && entry.ticketStatus !== "CHECKED_IN"
          ? { ...entry, ticketStatus: "CHECKED_IN", checkedInAt: at, checkedInBy: by }
          : entry,
      );
      commitRoster(next);
    },
    [commitRoster],
  );

  const refreshAttendance = useCallback(async () => {
    try {
      const { data } = await fetchAttendance(token);
      if (data) setAttendance(data);
    } catch {
      /* offline — counters stay as last known */
    }
  }, [token]);

  // Load any persisted roster + queue for this link on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      const cached = await loadRoster(token);
      if (active && cached) {
        commitRoster(cached.entries);
        setLastSyncedAt(cached.syncedAt);
      }
      const queue = await loadQueue(token);
      if (active) setPendingCount(queue.length);
    })();
    return () => {
      active = false;
    };
  }, [token, commitRoster]);

  const flushQueue = useCallback(async () => {
    if (flushingRef.current) return;
    flushingRef.current = true;
    try {
      const queue = await loadQueue(token);
      if (queue.length === 0) return;
      const { data, linkInvalid: invalid } = await submitSync(token, queue);
      if (invalid) setLinkInvalid(true);
      if (!data) return;
      await removeQueued(queue.map((item) => item.id));
      data.forEach((entry) => {
        if (entry.checkedInBy && entry.checkedInAt) {
          patchLocal(entry.ticketCode, entry.checkedInBy, entry.checkedInAt);
        }
      });
      setPendingCount((await loadQueue(token)).length);
      await refreshAttendance();
    } catch {
      /* still offline — keep the queue for the next attempt */
    } finally {
      flushingRef.current = false;
    }
  }, [token, patchLocal, refreshAttendance]);

  // Track connectivity; flush whatever queued the moment we come back online.
  useEffect(() => {
    const update = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) flushQueue();
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [flushQueue]);

  const localByCode = useCallback(
    (ticketCode: string) => rosterRef.current.find((e) => e.ticketCode === ticketCode) ?? null,
    [],
  );

  const queueOffline = useCallback(
    async (ticketCode: string, guestName: string | null): Promise<CheckInResponse> => {
      const local = localByCode(ticketCode);
      if (local && local.ticketStatus === "CHECKED_IN") {
        return {
          outcome: "ALREADY_CHECKED_IN",
          guestName: local.name,
          ticketCode,
          checkedInAt: local.checkedInAt,
          checkedInBy: local.checkedInBy,
        };
      }
      const scannedAt = new Date().toISOString();
      await enqueueCheckIn(token, {
        id: crypto.randomUUID(),
        ticketCode,
        scannedAt,
        guestName,
      });
      patchLocal(ticketCode, "You (offline)", scannedAt);
      setPendingCount((count) => count + 1);
      return {
        outcome: "CHECKED_IN",
        guestName: guestName ?? local?.name ?? null,
        ticketCode,
        checkedInAt: scannedAt,
        checkedInBy: "You (offline)",
      };
    },
    [token, localByCode, patchLocal],
  );

  const runOnline = useCallback(
    async (
      online: () => Promise<Awaited<ReturnType<typeof submitScan>>>,
      ticketCode: string | null,
      fallbackName: string | null,
    ): Promise<CheckInResponse | null> => {
      try {
        const { data, linkInvalid: invalid } = await online();
        if (invalid) setLinkInvalid(true);
        if (data) {
          if (data.outcome === "CHECKED_IN" && data.checkedInBy && data.checkedInAt) {
            patchLocal(data.ticketCode ?? ticketCode ?? "", data.checkedInBy, data.checkedInAt);
            await refreshAttendance();
          }
          return data;
        }
      } catch {
        /* the device dropped offline mid-request — fall through to queueing */
      }
      if (ticketCode) {
        setIsOnline(false);
        return queueOffline(ticketCode, fallbackName);
      }
      return null;
    },
    [patchLocal, refreshAttendance, queueOffline],
  );

  const checkInByCode = useCallback(
    async (ticketCode: string) => {
      setIsSubmitting(true);
      try {
        const local = localByCode(ticketCode);
        const next = navigator.onLine
          ? await runOnline(() => submitScan(token, ticketCode), ticketCode, local?.name ?? null)
          : await queueOffline(ticketCode, local?.name ?? null);
        if (next) setResult(next);
      } finally {
        setIsSubmitting(false);
      }
    },
    [token, localByCode, runOnline, queueOffline],
  );

  const checkInByGuest = useCallback(
    async (guestId: string) => {
      setIsSubmitting(true);
      try {
        if (navigator.onLine) {
          const next = await runOnline(
            () => submitManualCheckIn(token, guestId),
            rosterRef.current.find((e) => e.guestId === guestId)?.ticketCode ?? null,
            rosterRef.current.find((e) => e.guestId === guestId)?.name ?? null,
          );
          if (next) setResult(next);
          return;
        }
        const local = rosterRef.current.find((e) => e.guestId === guestId);
        if (!local?.ticketCode) {
          setResult({
            outcome: "NOT_FOUND",
            guestName: local?.name ?? null,
            ticketCode: null,
            checkedInAt: null,
            checkedInBy: null,
          });
          return;
        }
        setResult(await queueOffline(local.ticketCode, local.name));
      } finally {
        setIsSubmitting(false);
      }
    },
    [token, runOnline, queueOffline],
  );

  const syncForOffline = useCallback(async () => {
    const { data, linkInvalid: invalid } = await fetchRoster(token);
    if (invalid) setLinkInvalid(true);
    if (!data) return false;
    const syncedAt = await saveRoster(token, data);
    commitRoster(data);
    setLastSyncedAt(syncedAt);
    return true;
  }, [token, commitRoster]);

  const clearResult = useCallback(() => setResult(null), []);

  return {
    result,
    attendance,
    isSubmitting,
    linkInvalid,
    isOnline,
    lastSyncedAt,
    pendingCount,
    roster,
    checkInByCode,
    checkInByGuest,
    syncForOffline,
    clearResult,
  };
}
