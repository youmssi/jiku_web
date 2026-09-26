"use client";

import { useEffect, useState } from "react";
import { loadLineTicket, type AppointmentLinkRef } from "@/components/modules/appointment/appointment.service";
import type { ClientLineTicketView } from "@/components/modules/appointment/schema";

const POLL_INTERVAL_MS = 15_000;

/** Statuses after which the ticket no longer moves: polling stops there. */
const SETTLED = new Set(["DONE", "NO_SHOW"]);

/**
 * Cache/polling layer of a client's ticket page (JIKU-113). Seeded from the
 * server-rendered snapshot, then refreshed every 15 s so the client sees their
 * place move and learns when they are called without reloading. Polling pauses
 * while the tab is hidden, resumes on return, and stops once the ticket is
 * settled or has left the day's line.
 */
export function useLineTicket(link: AppointmentLinkRef, ticketCode: string, initial: ClientLineTicketView | null) {
  const [ticket, setTicket] = useState<ClientLineTicketView | null>(initial);
  const settled = ticket === null || SETTLED.has(ticket.status);

  useEffect(() => {
    if (settled) return;
    let active = true;

    async function poll() {
      if (document.visibilityState === "hidden") return;
      const next = await loadLineTicket(link, ticketCode);
      if (active) setTicket(next);
    }

    const timer = setInterval(poll, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [link, ticketCode, settled]);

  return ticket;
}
