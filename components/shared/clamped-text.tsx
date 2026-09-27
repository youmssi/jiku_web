"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Text written by a person (a welcome message), cut after [lines] lines with a
 * "more" link (JIKU-188), so it never pushes the answer below the fold.
 */
export function ClampedText({
  text,
  more,
  lines = 3,
  className,
}: {
  text: string;
  more: string;
  lines?: 2 | 3 | 4;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const long = text.length > lines * 60 || text.split("\n").length > lines;
  const clamp = { 2: "line-clamp-2", 3: "line-clamp-3", 4: "line-clamp-4" }[lines];
  return (
    <div className={className}>
      <p className={cn("whitespace-pre-line text-pretty", !open && long && clamp)}>{text}</p>
      {long && !open ? (
        <button type="button" onClick={() => setOpen(true)} className="mt-1 text-xs font-medium underline underline-offset-4">
          {more}
        </button>
      ) : null}
    </div>
  );
}
