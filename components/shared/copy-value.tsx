"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RESET_AFTER_MS = 2000;

interface CopyValueProps {
  value: string;
  /** Accessible name of the button, e.g. "Copy the number". */
  label: string;
  /** Announced once the value is on the clipboard. */
  copiedLabel: string;
  className?: string;
}

/**
 * A value a client retypes elsewhere (a Mobile Money number, an order
 * reference), with a one-tap copy so nothing is mistyped in the payment app.
 */
export function CopyValue({ value, label, copiedLabel, className }: CopyValueProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), RESET_AFTER_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="font-mono">{value}</span>
      <Button type="button" variant="ghost" size="icon" aria-label={copied ? copiedLabel : label} onClick={copy}>
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </span>
  );
}
