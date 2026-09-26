"use client";

import { useEffect, useState } from "react";
import { fetchPaymentStatusAction } from "@/components/modules/billing/billing.service";
import type { PaymentStatusView } from "@/components/modules/billing/schema";

const POLL_INTERVAL_MS = 3_000;
/** A provider normally confirms within seconds; past this the page stops asking and says so. */
const GIVE_UP_AFTER_MS = 180_000;

/**
 * Cache/polling layer of the payment return page (JIKU-165). Seeded from the
 * server-rendered status, then re-read every few seconds while the provider has
 * not confirmed the payment, and paused while the tab is hidden. Stops once the
 * payment is settled, or after a few minutes with `timedOut` set.
 */
export function usePaymentStatus(paymentId: string, initial: PaymentStatusView) {
  const [payment, setPayment] = useState(initial);
  const [timedOut, setTimedOut] = useState(false);
  const pending = payment.status === "PENDING";

  useEffect(() => {
    if (!pending) return;
    let active = true;
    const startedAt = Date.now();

    async function poll() {
      if (document.visibilityState === "hidden") return;
      if (Date.now() - startedAt > GIVE_UP_AFTER_MS) {
        clearInterval(timer);
        if (active) setTimedOut(true);
        return;
      }
      const next = await fetchPaymentStatusAction(paymentId);
      if (active && next) setPayment(next);
    }

    const timer = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [paymentId, pending]);

  return { payment, timedOut };
}
