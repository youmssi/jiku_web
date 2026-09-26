"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export { formatAmount } from "@/lib/currency";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  SUCCEEDED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  CONVERTED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  EXPIRING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  INTERRUPTED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  EXPIRED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  ENDED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  RENEWED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  VERIFIED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  REFUNDED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  FULLY_PAID: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  DEPOSIT_PAID: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  AWAITING_DEPOSIT: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  // Reused-screenshot fraud pattern (JIKU-55) — deliberately the loudest color
  // in the palette so it can never be mistaken for an ordinary pending state.
  DUPLICATE: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300",
};

export function StatusBadge({ status }: { status: string }) {
  const style =
    STATUS_STYLES[status] ??
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {status}
    </span>
  );
}

/**
 * Trial status coloring, kept separate from the shared STATUS_STYLES above:
 * ACTIVE reads as "in progress" (blue) rather than sharing green with
 * CONVERTED — an active trial isn't a win yet, and the shared map's green
 * ACTIVE is correct for other domains (e.g. an active tenant) where it is.
 */
const TRIAL_STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  CONVERTED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  EXPIRED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  ENDED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};
const TRIAL_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  CONVERTED: "Converted",
  EXPIRED: "Expired",
  ENDED: "Ended",
};

export function TrialStatusBadge({ status }: { status: string }) {
  const style =
    TRIAL_STATUS_STYLES[status] ??
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {TRIAL_STATUS_LABELS[status] ?? status}
    </span>
  );
}

/**
 * A resolved name with its full id one hover away, copy button included.
 * Replaces a bare sliced UUID in back-office tables — legible at a glance,
 * with the id still reachable for support/debugging.
 */
export function IdentityCell({
  name,
  id,
  fallbackLabel,
}: {
  name: string | null;
  id: string;
  /** Shown instead of the id-prefix fallback when `name` is null (e.g. "Unknown event"). */
  fallbackLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser; the id is still visible below.
    }
  }

  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger asChild>
        <span className="w-fit cursor-help border-b border-dotted border-muted-foreground/50 text-sm">
          {name ?? fallbackLabel}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{id}</span>
          <Button variant="ghost" size="icon-sm" onClick={copyId} className="shrink-0">
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            <span className="sr-only">Copy id</span>
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
