import { BellRing, Check, ScanLine } from "lucide-react";
import type { LandingContent } from "./content";

/**
 * The ticket a guest holds at the door: event, holder, category, payment and the
 * scan that let them in. Decorative, so hidden from assistive technology; the
 * tile's text already says what it shows.
 */
export function TicketVisual({ labels }: { labels: LandingContent["events"]["visual"] }) {
  return (
    <div aria-hidden className="relative w-full">
      <div className="relative mx-auto flex w-full max-w-xl overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl shadow-primary/10">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-primary" />
        <div className="flex-1 p-6 pl-8">
          <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">{labels.date}</p>
          <p className="mt-2 font-serif text-2xl leading-tight tracking-tight sm:text-3xl">{labels.event}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{labels.guest}</span>
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-[0.65rem] font-semibold text-primary-foreground">
              {labels.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[0.65rem] font-semibold text-emerald-700 dark:text-emerald-300">
              <Check className="size-3" />
              {labels.status}
            </span>
          </div>
        </div>
        <div className="relative flex w-32 shrink-0 items-center justify-center border-l border-dashed border-border/80 sm:w-40">
          <span className="absolute -top-3 -left-3 size-6 rounded-full border border-border/60 bg-card" />
          <span className="absolute -bottom-3 -left-3 size-6 rounded-full border border-border/60 bg-card" />
          <QrPattern className="size-20 text-foreground sm:size-24" />
        </div>
      </div>
      <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/90 px-4 py-2 text-xs font-medium shadow-sm">
        <ScanLine className="size-4 text-primary" />
        {labels.scanned}
      </div>
    </div>
  );
}

const QR_SIZE = 21;
const FINDERS = [
  [0, 0],
  [QR_SIZE - 7, 0],
  [0, QR_SIZE - 7],
];

function inFinder(x: number, y: number): boolean {
  return FINDERS.some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7);
}

/** A fixed, QR-looking pattern: three finder squares and a deterministic scatter. It encodes nothing. */
function QrPattern({ className }: { className?: string }) {
  const cells: [number, number][] = [];
  for (let y = 0; y < QR_SIZE; y += 1) {
    for (let x = 0; x < QR_SIZE; x += 1) {
      if (!inFinder(x, y) && (x * 7 + y * 13 + ((x * y) % 5)) % 3 === 0) cells.push([x, y]);
    }
  }
  return (
    <svg viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`} className={className} shapeRendering="crispEdges">
      {FINDERS.map(([x, y]) => (
        <g key={`${x}-${y}`} fill="currentColor">
          <path d={`M${x} ${y}h7v7h-7z M${x + 1} ${y + 1}v5h5v-5z`} fillRule="evenodd" />
          <rect x={x + 2} y={y + 2} width={3} height={3} />
        </g>
      ))}
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />
      ))}
    </svg>
  );
}

const WAITING = ["A-15", "A-16", "B-04"];

/** Today's line as the front desk sees it: who is being served, who is next, the call just sent. Decorative. */
export function DayLineVisual({ labels }: { labels: LandingContent["services"]["visual"] }) {
  return (
    <div aria-hidden className="w-full">
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl shadow-primary/10">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <span className="text-xs font-semibold">{labels.title}</span>
          <span className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            {WAITING.length} {labels.waiting}
          </span>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
            <span className="text-lg font-bold tracking-tight">A-14</span>
            <span className="text-xs opacity-80">
              {labels.serving} · {labels.counter}
            </span>
          </div>
          {WAITING.map((code, index) => (
            <div
              key={code}
              className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-2.5 text-sm"
            >
              <span className="font-semibold">{code}</span>
              {index === 0 ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
                  {labels.next}
                </span>
              ) : (
                <span className="h-1.5 w-14 rounded-full bg-foreground/10" />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/90 px-4 py-2 text-xs font-medium shadow-sm">
        <BellRing className="size-4 text-primary" />
        {labels.notice}
      </div>
    </div>
  );
}
