"use client";

import { useCallback, useEffect, useState } from "react";
import { useLiveSignal } from "@/components/shared";
import { loadLineLiveTicket, loadLineTicket, type AppointmentLinkRef } from "@/components/modules/appointment/appointment.service";
import type { ClientLineTicketView } from "@/components/modules/appointment/schema";

/** Without the live stream, how often the ticket reloads. */
const POLL_INTERVAL_MS = 15_000;
/** With it, a safety reload for changes the stream cannot see. */
const LIVE_POLL_INTERVAL_MS = 60_000;

/** Statuses after which the ticket no longer moves: reloading stops there. */
const SETTLED = new Set(["DONE", "NO_SHOW"]);

/**
 * Cache layer of a client's ticket page (JIKU-113). Seeded from the
 * server-rendered snapshot, then reloaded as soon as the live stream says the
 * line moved (JIKU-214), so the client sees their place change and learns when
 * they are called; without the stream it polls every 15 s. Nothing reloads while
 * the tab is hidden, and everything stops once the ticket is settled or has
 * left the day's line.
 */
export function useLineTicket(link: AppointmentLinkRef, ticketCode: string, initial: ClientLineTicketView | null) {
  const [ticket, setTicket] = useState<ClientLineTicketView | null>(initial);
  const settled = ticket === null || SETTLED.has(ticket.status);

  const reload = useCallback(async () => {
    if (document.visibilityState === "hidden") return;
    setTicket(await loadLineTicket(link, ticketCode));
  }, [link, ticketCode]);

  const live = useLiveSignal(
    settled ? "" : ticketCode,
    () => (settled ? Promise.resolve(null) : loadLineLiveTicket(link, ticketCode)),
    () => void reload(),
  );

  useEffect(() => {
    if (settled) return;
    const timer = setInterval(() => void reload(), live ? LIVE_POLL_INTERVAL_MS : POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [reload, live, settled]);

  return ticket;
}
