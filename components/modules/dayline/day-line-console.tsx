"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { FormFieldError } from "@/components/shared";
import {
  markPaidAction,
  nextAction,
  transitionAction,
  walkInAction,
} from "@/components/modules/dayline/dayline.service";
import type {
  CollectedPaymentMethod,
  DayLineAuth,
  DayLineView,
  LineStatus,
  LineTicket,
  LineTransition,
  WalkInInput,
} from "@/components/modules/dayline/schema";
import { walkInSchema } from "@/components/modules/dayline/schema";
import { useDayLine } from "@/components/modules/dayline/useDayLine";
import { formatAmount } from "@/lib/currency";
import { cn } from "@/lib/utils";

/** The camera loads lazily: scanning is only a second way to record an arrival. */
const QrScanner = dynamic(
  () => import("@/components/shared/qr-scanner").then((mod) => mod.QrScanner),
  { ssr: false },
);

function dotClass(status: LineStatus): string {
  switch (status) {
    case "IN_SERVICE":
      return "bg-emerald-500";
    case "CALLED":
      return "bg-amber-500";
    case "WAITING":
      return "bg-sky-500";
    case "NO_SHOW":
      return "bg-zinc-400";
    case "ISSUED":
      return "bg-zinc-300";
    case "DONE":
      return "bg-zinc-400";
  }
}

/** The main action an entry's state offers (none once it is over). */
function rowAction(status: LineStatus): LineTransition | null {
  switch (status) {
    case "ISSUED":
      return "arrive";
    case "WAITING":
      return "call";
    case "CALLED":
      return "present";
    case "IN_SERVICE":
      return "finish";
    default:
      return null;
  }
}

/** The message key of each transition's button. */
const ACTION_KEY = {
  arrive: "arrive",
  call: "call",
  present: "present",
  finish: "finish",
  "no-show": "noShow",
} as const satisfies Record<LineTransition, string>;

interface DayLineConsoleProps {
  auth: DayLineAuth;
  initial: DayLineView;
}

/**
 * The day-line console (JIKU-88), the counter's main screen. One list mixes
 * appointments and walk-ins, the single NEXT gesture calls the next person by
 * the rule, each row offers the transition its state allows, and scanning the
 * QR is a second way to record an arrival. Usable one-handed on a phone.
 */
export function DayLineConsole({ auth, initial }: DayLineConsoleProps) {
  const { view, refresh } = useDayLine(auth, initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const t = useTranslations("operator.line");
  const c = useTranslations("operator.collect");
  const locale = useLocale();
  const format = useFormatter();
  const time = (iso: string | null) =>
    iso ? format.dateTime(new Date(iso), { timeZone: view.timezone, hour: "2-digit", minute: "2-digit" }) : "—";

  async function act(ticket: LineTicket, transition: LineTransition) {
    const key = `${ticket.ticketCode}:${transition}`;
    setBusy(key);
    const result = await transitionAction(auth, ticket.ticketCode, transition);
    setBusy(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    await refresh();
  }

  async function collect(ticket: LineTicket, method: CollectedPaymentMethod) {
    setBusy(`${ticket.ticketCode}:paid`);
    const result = await markPaidAction(auth, ticket.ticketCode, method);
    setBusy(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(c("done"));
    await refresh();
  }

  async function onNext() {
    setBusy("next");
    const result = await nextAction(auth);
    setBusy(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (!result.data.ticket) {
      toast(t("toasts.nobody"));
      return;
    }
    const name = result.data.ticket.clientName;
    toast.success(name ? t("toasts.called", { name }) : t("toasts.calledNext"));
    await refresh();
  }

  async function onWalkIn(input: WalkInInput) {
    const result = await walkInAction(auth, input);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    setWalkInOpen(false);
    toast.success(t("toasts.joined", { name: input.clientName }));
    await refresh();
    return true;
  }

  function onScanned(code: string) {
    if (scanLocked) return;
    setScanLocked(true);
    transitionAction(auth, code, "arrive")
      .then(async (result) => {
        if (!result.ok) {
          toast.error(result.error);
        } else {
          toast.success(t("toasts.arrived"));
        }
        await refresh();
      })
      .finally(() => {
        setScanLocked(false);
        setScannerOpen(false);
      });
  }

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950">
      <header className="mx-auto flex w-full max-w-2xl items-start justify-between gap-3 px-4 pt-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{view.serviceName}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {format.dateTime(new Date(`${view.date}T12:00:00Z`), {
              timeZone: "UTC",
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
            {t("scan")}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setWalkInOpen(true)}>
            {t("walkIn")}
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 pb-8 pt-4">
        {view.entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            {t("empty")}
          </div>
        ) : (
          view.entries.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "flex flex-col gap-2 rounded-2xl border bg-card p-3 sm:flex-row sm:items-center",
                entry.status === "IN_SERVICE" && "border-emerald-400/60 bg-emerald-50/40 dark:bg-emerald-950/20",
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="w-14 shrink-0 text-center">
                  <div className="text-lg font-semibold tabular-nums">
                    {time(entry.startsAt ?? entry.arrivedAt)}
                  </div>
                  {entry.dayRank != null ? (
                    <div className="text-[11px] text-muted-foreground">{t("rank", { rank: entry.dayRank })}</div>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", dotClass(entry.status))} />
                    <p className="truncate font-medium">{entry.clientName ?? t("client")}</p>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={entry.kind === "APPOINTMENT" ? "default" : "secondary"}>
                      {t(`kind.${entry.kind}`)}
                    </Badge>
                    <span>{t(`status.${entry.status}`)}</span>
                    {entry.paymentStatus === "PAID" ? <Badge variant="outline">{c("paid")}</Badge> : null}
                    {entry.paymentStatus === "DUE" || entry.paymentStatus === "DUE_AFTER_SERVICE" ? (
                      <span className="font-medium text-orange-700 dark:text-orange-400">
                        {entry.amountDueMinor != null && entry.amountDueCurrency
                          ? c(entry.paymentStatus === "DUE" ? "due" : "dueAfter", {
                              amount: formatAmount(entry.amountDueMinor, entry.amountDueCurrency, locale),
                            })
                          : null}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2 pl-14 sm:pl-0">
                {(entry.paymentStatus === "DUE" || entry.paymentStatus === "DUE_AFTER_SERVICE") &&
                entry.status !== "NO_SHOW" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" disabled={busy !== null}>
                        {busy === `${entry.ticketCode}:paid` ? <Spinner className="h-4 w-4" /> : c("collect")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => void collect(entry, "MOBILE_MONEY")}>{c("mobileMoney")}</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => void collect(entry, "CASH")}>{c("cash")}</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => void collect(entry, "PAYMENT_LINK")}>{c("link")}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
                {entry.status === "CALLED" ? (
                  <Button size="sm" variant="outline" onClick={() => act(entry, "no-show")} disabled={busy !== null}>
                    {t("actions.noShow")}
                  </Button>
                ) : null}
                {rowAction(entry.status) ? (
                  <Button
                    size="sm"
                    onClick={() => void act(entry, rowAction(entry.status) as LineTransition)}
                    disabled={busy !== null}
                  >
                    {busy === `${entry.ticketCode}:${rowAction(entry.status)}` ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      t(`actions.${ACTION_KEY[rowAction(entry.status) as LineTransition]}`)
                    )}
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}

        {/* NEXT, the single gesture: sticks to the bottom of the column without
            covering the sidebar or the content that follows. */}
        <div className="sticky bottom-4 z-40 mt-2">
          <Button
            className="h-12 w-full text-sm font-semibold shadow-lg"
            onClick={() => void onNext()}
            disabled={busy !== null}
          >
            {busy === "next" ? <Spinner className="h-5 w-5" /> : t("next")}
          </Button>
        </div>
      </main>

      <WalkInDialog open={walkInOpen} onOpenChange={setWalkInOpen} onSubmit={onWalkIn} />
      <ScannerDialog
        open={scannerOpen}
        onOpenChange={(open) => {
          setScannerOpen(open);
          setScanLocked(false);
        }}
        locked={scanLocked}
        onDetect={onScanned}
      />
    </div>
  );
}

function WalkInDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: WalkInInput) => Promise<boolean>;
}) {
  const t = useTranslations("operator.line.walkInDialog");
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<WalkInInput>({
    resolver: zodResolver(walkInSchema),
    mode: "onTouched",
    defaultValues: { clientName: "", clientPhone: "" },
  });

  async function submit(values: WalkInInput) {
    if (await onSubmit(values)) reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("text")}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              control={control}
              name="clientName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="walkin-name">{t("name")}</FieldLabel>
                  <Input
                    {...field}
                    id="walkin-name"
                    autoFocus
                    placeholder={t("namePlaceholder")}
                    aria-invalid={fieldState.invalid}
                  />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="clientPhone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="walkin-phone">{t("phone")}</FieldLabel>
                  <Input
                    {...field}
                    id="walkin-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="+224 6XX XX XX XX"
                    aria-invalid={fieldState.invalid}
                  />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="h-4 w-4" /> : t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ScannerDialog({
  open,
  onOpenChange,
  locked,
  onDetect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locked: boolean;
  onDetect: (code: string) => void;
}) {
  const t = useTranslations("operator.line.scanner");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("text")}</DialogDescription>
        </DialogHeader>
        {open ? <QrScanner active={!locked} onDetect={onDetect} /> : null}
        {locked ? <p className="text-center text-sm text-muted-foreground">{t("saving")}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
