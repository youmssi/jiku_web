"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

const RESET_AFTER_MS = 2000;

/**
 * Copies one invitation text to the clipboard and confirms it for a moment,
 * on the button and through a live region screen readers announce.
 */
export function CopyTextButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), RESET_AFTER_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <Button type="button" variant="outline" className="h-9 gap-1.5 rounded-full px-4 text-sm" onClick={copy}>
        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        {copied ? done : label}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? done : ""}
      </span>
    </>
  );
}
