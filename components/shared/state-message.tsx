import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Full-screen centered message for error / unavailable / empty states. Consolidates
 * the near-identical "centered title + description (+ optional action)" blocks that
 * were re-authored across the guest, dashboard and error-boundary screens.
 */
export function StateMessage({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-1 items-center justify-center px-4 py-16", className)}>
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">{title}</h1>
        {description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
