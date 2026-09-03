import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

interface JikūLogoProps extends Omit<ComponentPropsWithoutRef<"img">, "src" | "alt" | "width" | "height"> {
  /**
   * `full` shows both the mark and the wordmark.
   * `mark` shows only the mark (favicon / badge / small spaces).
   */
  variant?: "full" | "mark";
}

/**
 * Jikū brand logo — the canonical mark (`public/jiku-logo-mark.png`, cropped
 * and centred from `public/jiku-logo-1024.png`) plus, for the full variant, the
 * "Jikū" wordmark. The mark is the single source of truth so the favicon, the
 * navigation and every page carry the same symbol.
 */
export function JikūLogo({ variant = "full", className, ...props }: JikūLogoProps) {
  if (variant === "mark") {
    return (
      <Image
        src="/jiku-logo-mark.png"
        alt="Jikū"
        width={512}
        height={512}
        className={cn("shrink-0 object-contain", className)}
        {...props}
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/jiku-logo-mark.png"
        alt=""
        aria-hidden="true"
        width={512}
        height={512}
        className="h-[1.15em] w-auto shrink-0 object-contain"
      />
      <span className="font-semibold tracking-tight">Jikū</span>
    </span>
  );
}
