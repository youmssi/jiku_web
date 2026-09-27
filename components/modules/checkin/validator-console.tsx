"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useOfflineCheckIn } from "@/components/modules/checkin/useOfflineCheckin";
import { CheckInResult } from "@/components/modules/checkin/checkin-result";
import { markTicketPaid } from "@/components/modules/checkin/checkin.service";
import { GuestSearch } from "@/components/modules/checkin/guest-search";
import type { ValidatorContext } from "@/components/modules/checkin/schema";

// Loaded on demand so the camera + QR decoder stay out of the initial payload.
const QrScanner = dynamic(
  () =>
    import("@/components/shared/qr-scanner").then(
      (mod) => mod.QrScanner,
    ),
  {
    ssr: false,
    loading: () => <CameraLoading />,
  },
);

type Mode = "scan" | "search";

interface ValidatorConsoleProps {
  door: string;
  context: ValidatorContext;
}

/**
 * Validator check-in console: a camera QR scanner as the primary action with a
 * one-tap search fallback, a live attendance counter, and large glanceable
 * feedback after each check-in. Pre-sync the roster to keep checking guests in
 * offline (JIKU-25); queued check-ins flush automatically on reconnection.
 */
export function ValidatorConsole({ door, context }: ValidatorConsoleProps) {
  const t = useTranslations("operator.door");
  const format = useFormatter();
  const [mode, setMode] = useState<Mode>("scan");
  const eventCancelled = context.eventStatus === "CANCELLED";
  const [isSyncing, setIsSyncing] = useState(false);
  const {
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
  } = useOfflineCheckIn(door, { checkedIn: context.checkedIn, confirmed: context.confirmed }, t("youOffline"));
  const lockRef = useRef(false);

  const handleDetect = useCallback(
    (code: string) => {
      if (lockRef.current) return;
      lockRef.current = true;
      checkInByCode(code);
    },
    [checkInByCode],
  );

  const handleSelect = useCallback(
    (guestId: string) => {
      if (lockRef.current) return;
      lockRef.current = true;
      checkInByGuest(guestId);
    },
    [checkInByGuest],
  );

  const collect = useTranslations("operator.collect");
  const collectPayment = useCallback(
    async (method: "MOBILE_MONEY" | "CASH") => {
      const ticketCode = result?.ticketCode;
      if (!ticketCode) return;
      const paid = await markTicketPaid(door, ticketCode, method);
      if (paid.error) {
        toast.error(paid.error);
        return;
      }
      toast.success(collect("done"));
      await checkInByCode(ticketCode);
    },
    [result, door, checkInByCode, collect],
  );

  const dismiss = useCallback(() => {
    lockRef.current = false;
    clearResult();
  }, [clearResult]);

  const onSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await syncForOffline();
    } finally {
      setIsSyncing(false);
    }
  }, [syncForOffline]);

  const eventWhen = context.startDateTime
    ? format.dateTime(new Date(context.startDateTime), {
        timeZone: context.timezone,
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="flex flex-1 flex-col text-zinc-100">
      <header className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{context.eventName}</h1>
            <p className="truncate text-xs text-zinc-500">
              {context.organizerName}
              {eventWhen ? ` · ${eventWhen}` : ""}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium">
            {context.validatorLabel}
          </span>
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          {t.rich("attendance", {
            checkedIn: attendance.checkedIn,
            confirmed: attendance.confirmed,
            b: (chunks) => <span className="font-semibold text-zinc-100">{chunks}</span>,
          })}
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 px-5 py-2 text-xs">
        <span className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isOnline ? "bg-green-500" : "bg-amber-500"
            }`}
          />
          <span className="text-zinc-400">
            {isOnline ? t("online") : t("offline")}
            {pendingCount > 0 ? ` · ${t("queued", { count: pendingCount })}` : ""}
          </span>
        </span>
        <button
          type="button"
          onClick={onSync}
          disabled={isSyncing || !isOnline}
          className="rounded-md bg-zinc-800 px-3 py-1.5 font-medium text-zinc-200 disabled:opacity-50"
        >
          {isSyncing
            ? t("syncing")
            : lastSyncedAt
              ? t("synced", {
                  time: format.dateTime(new Date(lastSyncedAt), {
                    timeZone: context.timezone,
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                })
              : t("sync")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1 px-5 pt-4">
        <ModeButton active={mode === "scan"} onClick={() => setMode("scan")}>
          {t("scan")}
        </ModeButton>
        <ModeButton active={mode === "search"} onClick={() => setMode("search")}>
          {t("search")}
        </ModeButton>
      </div>

      <main className="flex flex-1 flex-col items-center gap-4 px-5 py-6">
        {mode === "scan" ? (
          <>
            <QrScanner onDetect={handleDetect} active={!result && !isSubmitting} />
            <p className="text-center text-sm text-zinc-500">{t("pointCamera")}</p>
          </>
        ) : (
          <GuestSearch
            door={door}
            onSelect={handleSelect}
            isSubmitting={isSubmitting}
            offline={!isOnline}
            roster={roster}
          />
        )}
      </main>

      {result ? (
        <CheckInResult result={result} timezone={context.timezone} onDismiss={dismiss} onCollect={collectPayment} />
      ) : null}

      {linkInvalid ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 px-6 text-center">
          <h2 className="text-2xl font-semibold">{t("linkInvalidTitle")}</h2>
          <p className="mt-2 max-w-xs text-zinc-400">{t("linkInvalidText")}</p>
        </div>
      ) : null}

      {eventCancelled ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 px-6 text-center">
          <h2 className="text-2xl font-semibold">{t("eventCancelledTitle", { name: context.eventName })}</h2>
          <p className="mt-2 max-w-xs text-zinc-400">{t("eventCancelledText")}</p>
        </div>
      ) : null}
    </div>
  );
}

function CameraLoading() {
  const t = useTranslations("operator.door");
  return (
    <div className="flex aspect-square w-full max-w-sm items-center justify-center rounded-2xl bg-zinc-900 text-sm text-zinc-500">
      {t("startingCamera")}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg py-2.5 text-sm font-medium transition-colors ${
        active ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-zinc-400"
      }`}
    >
      {children}
    </button>
  );
}
