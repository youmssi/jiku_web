"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

/**
 * Time left before an unpaid order gives its places back. When it runs out the
 * page reloads, so the buyer sees the order expired rather than a stale timer.
 */
export function HoldCountdown({ expiresAt }: { expiresAt: string }) {
  const t = useTranslations("guest.order");
  const router = useRouter();
  const deadline = new Date(expiresAt).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // The clock starts once mounted: the server's time would not match the browser's.
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (now !== null && now >= deadline) router.refresh();
  }, [now, deadline, router]);

  if (now === null) return null;
  const seconds = Math.max(0, Math.floor((deadline - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const clock = hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
    : `${minutes}:${String(rest).padStart(2, "0")}`;

  return (
    <p className="rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200" role="timer">
      {t.rich("holdLeft", { time: () => <strong className="tabular-nums">{clock}</strong> })}
    </p>
  );
}
