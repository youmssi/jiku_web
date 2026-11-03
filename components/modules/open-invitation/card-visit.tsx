"use client";

import { useEffect } from "react";
import { recordVisitAction } from "./open-invitation.service";
import type { CardSource } from "./share";

/**
 * Counts one visit of the card page (JIKU-282), once per browser session, from
 * the browser only: link previews drawn by WhatsApp or Facebook run no script
 * and never count. Nothing about the visitor is sent, only the network.
 */
export function CardVisit({ code, source }: { code: string; source: CardSource | null }) {
  useEffect(() => {
    const key = `jiku-card-visit:${code}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private browsing may refuse storage: the visit still counts, once per page load.
    }
    void recordVisitAction(code, source);
  }, [code, source]);
  return null;
}
