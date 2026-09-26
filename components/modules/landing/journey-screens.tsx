import { BellRing, Check, CheckCircle2, FileSpreadsheet, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { QrPattern } from "./product-visuals";
import type { JourneyScreen } from "./use-case-journeys";

/**
 * What one person's phone shows at one step of a journey, drawn from the
 * step's data. Decorative: the step's title and text carry the meaning for
 * assistive technology.
 */
export function JourneyPhone({ screen }: { screen: JourneyScreen }) {
  return (
    <div aria-hidden className="mx-auto w-full max-w-[18rem]">
      <div className="rounded-[2.4rem] border border-border/70 bg-foreground/90 p-2 shadow-2xl shadow-primary/15">
        <div className="relative flex min-h-[26rem] flex-col overflow-hidden rounded-[1.9rem] bg-background">
          <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-foreground/90" />
          <div className="flex flex-1 flex-col px-4 pt-4 pb-5">
            <Screen screen={screen} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Screen({ screen }: { screen: JourneyScreen }) {
  switch (screen.kind) {
    case "import":
      return (
        <>
          <Header title={screen.title} />
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-[0.7rem] text-primary">
            <FileSpreadsheet className="size-4" />
            invites.xlsx
          </div>
          <Rows lines={screen.lines} check />
          <Action label={screen.action} />
        </>
      );
    case "message":
      return (
        <>
          <Header title={screen.title} subtitle="WhatsApp" />
          <div className="mt-4 flex-1 rounded-2xl bg-[#efe7dc] p-3 dark:bg-muted">
            <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-background p-3 text-[0.72rem] leading-relaxed shadow-sm">
              {screen.lines.join(" ")}
              {screen.action ? (
                <span className="mt-3 block rounded-lg border-t border-border/60 pt-2 text-center font-semibold text-primary">
                  {screen.action}
                </span>
              ) : null}
            </div>
          </div>
        </>
      );
    case "ticket":
      return (
        <div className="flex flex-1 flex-col justify-center">
          <div className="overflow-hidden rounded-2xl border border-border/70 shadow-lg">
            <div className="h-1.5 bg-primary" />
            <div className="p-4">
              <p className="font-serif text-lg leading-tight">{screen.title}</p>
              <p className="mt-3 text-xs font-medium">{screen.lines[0]}</p>
              <p className="text-[0.7rem] text-muted-foreground">{screen.lines[1]}</p>
              {screen.highlight ? <Pill tone="success">{screen.highlight}</Pill> : null}
            </div>
            <div className="flex justify-center border-t border-dashed border-border/80 p-4">
              <QrPattern className="size-20" />
            </div>
          </div>
        </div>
      );
    case "scan":
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl bg-emerald-500/10 text-center">
          <CheckCircle2 className="size-14 text-emerald-600" strokeWidth={1.5} />
          <p className="text-base font-semibold">{screen.title}</p>
          <div className="text-xs text-muted-foreground">
            {screen.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {screen.highlight ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-[0.65rem] font-medium">
              <WifiOff className="size-3" />
              {screen.highlight}
            </span>
          ) : null}
        </div>
      );
    case "list":
      return (
        <>
          <Header title={screen.title} />
          <Rows lines={screen.lines} highlight={screen.highlight} />
          <Action label={screen.action} />
        </>
      );
    case "slots":
      return (
        <>
          <Header title={screen.title} />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {screen.lines.map((slot) => (
              <span
                key={slot}
                className={cn(
                  "rounded-xl border px-2 py-2 text-center text-xs font-medium",
                  slot === screen.highlight ? "border-primary bg-primary text-primary-foreground" : "border-border/70",
                )}
              >
                {slot}
              </span>
            ))}
          </div>
          <Action label={screen.action} />
        </>
      );
    case "call":
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl bg-primary text-center text-primary-foreground">
          <BellRing className="size-8 opacity-80" />
          <p className="text-sm font-medium opacity-80">{screen.title}</p>
          <p className="text-5xl font-bold tracking-tight">{screen.highlight}</p>
          <p className="rounded-full bg-primary-foreground/15 px-3 py-1 text-sm font-semibold">{screen.lines[0]}</p>
        </div>
      );
    case "stats":
      return (
        <>
          <Header title={screen.title} />
          <div className="mt-4 flex flex-col gap-2">
            {screen.lines.map((line, index) => {
              const [label, value] = line.split("|");
              return (
                <div
                  key={line}
                  className={cn("rounded-2xl border p-3", index === 0 ? "border-primary/30 bg-primary/5" : "border-border/70")}
                >
                  <p className="text-[0.65rem] text-muted-foreground uppercase">{label}</p>
                  <p className="text-2xl font-bold tracking-tight">{value}</p>
                </div>
              );
            })}
          </div>
        </>
      );
  }
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-border/60 pb-3">
      <p className="text-sm font-semibold">{title}</p>
      {subtitle ? <p className="text-[0.65rem] text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

function Rows({ lines, highlight, check = false }: { lines: string[]; highlight?: string; check?: boolean }) {
  return (
    <ul className="mt-3 flex flex-col gap-1.5">
      {lines.map((line) => {
        const active = highlight !== undefined && line.startsWith(highlight);
        return (
          <li
            key={line}
            className={cn(
              "flex items-center justify-between rounded-xl px-3 py-2 text-xs",
              active ? "bg-primary font-semibold text-primary-foreground" : "border border-border/60",
            )}
          >
            {line}
            {check ? <Check className="size-3.5 text-emerald-600" /> : null}
          </li>
        );
      })}
    </ul>
  );
}

function Action({ label }: { label?: string }) {
  if (!label) return null;
  return (
    <span className="mt-auto block rounded-full bg-primary px-4 py-2.5 text-center text-xs font-semibold text-primary-foreground">
      {label}
    </span>
  );
}

function Pill({ tone, children }: { tone: "success"; children: string }) {
  return (
    <span
      className={cn(
        "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold",
        tone === "success" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      )}
    >
      <Check className="size-3" />
      {children}
    </span>
  );
}
