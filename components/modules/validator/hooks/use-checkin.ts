"use client";

import { useCallback, useState } from "react";
import {
  fetchAttendance,
  submitManualCheckIn,
  submitScan,
} from "@/components/modules/validator/services/checkin";
import type {
  AttendanceResponse,
  CheckInResponse,
} from "@/components/modules/validator/checkin-types";

/**
 * Cache/state layer for check-in actions. Holds the latest check-in result, the
 * live attendance counters and a busy flag, and keeps the counters fresh after
 * each successful check-in. Components never call the service directly — they go
 * through this hook (the validator module keeps service and cache separate for the
 * offline work in JIKU-25).
 */
export function useCheckIn(token: string, initial: AttendanceResponse) {
  const [result, setResult] = useState<CheckInResponse | null>(null);
  const [attendance, setAttendance] = useState<AttendanceResponse>(initial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);

  const refreshAttendance = useCallback(async () => {
    const { data } = await fetchAttendance(token);
    if (data) {
      setAttendance(data);
    }
  }, [token]);

  const run = useCallback(
    async (action: () => Promise<Awaited<ReturnType<typeof submitScan>>>) => {
      setIsSubmitting(true);
      try {
        const { data, error, linkInvalid: invalid } = await action();
        if (invalid) {
          setLinkInvalid(true);
        }
        if (data) {
          setResult(data);
          if (data.outcome === "CHECKED_IN") {
            await refreshAttendance();
          }
          return;
        }
        if (error) {
          setResult({
            outcome: "NOT_FOUND",
            guestName: null,
            ticketCode: null,
            checkedInAt: null,
            checkedInBy: null,
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [refreshAttendance],
  );

  const checkInByCode = useCallback(
    (ticketCode: string) => run(() => submitScan(token, ticketCode)),
    [run, token],
  );

  const checkInByGuest = useCallback(
    (guestId: string) => run(() => submitManualCheckIn(token, guestId)),
    [run, token],
  );

  const clearResult = useCallback(() => setResult(null), []);

  return {
    result,
    attendance,
    isSubmitting,
    linkInvalid,
    checkInByCode,
    checkInByGuest,
    clearResult,
  };
}
