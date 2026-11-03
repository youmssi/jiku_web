/**
 * The Jikū symbol as inline SVG (JIKU-287): a few hundred bytes where the PNG
 * mark weighed 23 KB, for the small signatures on guest pages.
 */
export function JikuSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className={className}>
      <g transform="translate(1, 2)">
        <path
          d="M 13 16 C 13 22 18 24 22 22 C 26 20 26 14 22 10 C 18 6 10 6 6 10 C 2 14 2 20 6 24"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M 13 4 L 13 16 C 13 20 11 22 8 22 C 5 22 3 20 3 17"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="13" cy="4" r="2" fill="currentColor" />
      </g>
    </svg>
  );
}
