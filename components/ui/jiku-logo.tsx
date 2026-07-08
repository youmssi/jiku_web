import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

interface JikūLogoProps extends ComponentPropsWithoutRef<"svg"> {
  /**
   * `full` shows both the mark and the wordmark.
   * `mark` shows only the icon (good for favicon / small spaces).
   */
  variant?: "full" | "mark";
}

/**
 * Jikū brand logo — a premium SVG inspired by the meaning of 時空 (time/space).
 *
 * The mark is a stylised "J" that extends into an orbital arc, suggesting
 * both the flow of time and the expanse of space. The wordmark uses an
 * elegant geometric sans with a macron over the "ū" (long-vowel mark).
 *
 * Responsive: fill="currentColor" so it adapts to any text colour.
 * Inline: designed to sit beside text at `size-5` or larger.
 */
export function JikūLogo({
  variant = "full",
  className,
  ...props
}: JikūLogoProps) {
  return (
    <svg
      viewBox={variant === "full" ? "0 0 100 28" : "0 0 28 28"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Jikū"
      {...props}
    >
      {variant === "full" ? (
        <>
          {/* ---- Mark ---- */}
          <g transform="translate(1, 2)">
            {/* Orbital arc — represents "space" */}
            <path
              d="M 13 16 C 13 22 18 24 22 22 C 26 20 26 14 22 10 C 18 6 10 6 6 10 C 2 14 2 20 6 24"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.3"
            />
            {/* Stylised "J" — represents "time" (vertical stroke with a curved base) */}
            <path
              d="M 13 4 L 13 16 C 13 20 11 22 8 22 C 5 22 3 20 3 17"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Accent dot — the "punctum" (a pin in time/space) */}
            <circle cx="13" cy="4" r="1.8" fill="currentColor" />
          </g>

          {/* ---- Wordmark ---- */}
          <g transform="translate(30, 0)">
            <text
              x="0"
              y="22"
              fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
              fontSize="18"
              fontWeight="600"
              letterSpacing="-0.01em"
              fill="currentColor"
            >
              Jik
              {/* Macron over ū — Unicode combining macron */}
              <tspan textDecoration="underline" fill="currentColor">
                ū
              </tspan>
            </text>
          </g>
        </>
      ) : (
        <>
          {/* ---- Mark only (favicon / small avatar) ---- */}
          <g transform="translate(1, 2)">
            <path
              d="M 13 16 C 13 22 18 24 22 22 C 26 20 26 14 22 10 C 18 6 10 6 6 10 C 2 14 2 20 6 24"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.3"
            />
            <path
              d="M 13 4 L 13 16 C 13 20 11 22 8 22 C 5 22 3 20 3 17"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="13" cy="4" r="1.8" fill="currentColor" />
          </g>
        </>
      )}
    </svg>
  );
}
