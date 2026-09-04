"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  nextAction,
  transitionAction,
  walkInAction,
} from "@/components/modules/dayline/dayline.service";
import type {
  DayLineAuth,
  DayLineView,
  LineStatus,
  LineTicket,
  LineTransition,
  TicketKind,
  WalkInInput,
} from "@/components/modules/dayline/schema";
import { useDayLine } from "@/components/modules/dayline/useDayLine";
import { cn } from "@/lib/utils";

/** Caméra chargée paresseusement : le scan n'est qu'une façon secondaire de servir. */
const QrScanner = dynamic(
  () => import("@/components/shared/qr-scanner").then((mod) => mod.QrScanner),
  { ssr: false },
);

function formatTime(iso: string | null, zone: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", { timeZone: zone, hour: "2-digit", minute: "2-digit" }).format(d);
}

function formatDateLabel(date: string, zone: string): string {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: zone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

const STATUS_TEXT: Record<LineStatus, string> = {
  ISSUED: "pas encore arrivé",
  WAITING: "en attente",
  CALLED: "appelé",
  IN_SERVICE: "en cours",
  DONE: "terminé",
  NO_SHOW: "absent",
};

const KIND_TEXT: Record<TicketKind, string> = {
  APPOINTMENT: "RDV",
  WALK_IN: "sans RDV",
};

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

/** Action principale offerte par l'état de l'entrée (rien si déjà terminée). */
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

function rowActionLabel(transition: LineTransition): string {
  switch (transition) {
    case "arrive":
      return "Arrivée";
    case "call":
      return "Appeler";
    case "present":
      return "Prendre en charge";
    case "finish":
      return "Terminer";
    case "no-show":
      return "Absent";
  }
}

interface DayLineConsoleProps {
  auth: DayLineAuth;
  initial: DayLineView;
}

/**
 * Console de ligne du jour (JIKU-88) : l'écran central du comptoir. Une seule
 * liste mêle rendez-vous et sans-rendez-vous, le geste unique SUIVANT appelle la
 * personne selon la règle, chaque ligne offre la transition correspondant à son
 * état, et le scan du QR est une seconde façon d'enregistrer l'arrivée. Utilisable
 * d'une main au comptoir, sur téléphone.
 */
export function DayLineConsole({ auth, initial }: DayLineConsoleProps) {
  const { view, refresh } = useDayLine(auth, initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);

  async function act(ticket: LineTicket, transition: LineTransition) {
    const key = `${ticket.ticketCode}:${transition}`;
    setBusy(key);
    const result = await transitionAction(auth, ticket.ticketCode, transition);
    setBusy(null);
    if (!result.ok) {
      toast.error(result.error ?? "L'action a échoué.");
      return;
    }
    await refresh();
  }

  async function onNext() {
    setBusy("next");
    const result = await nextAction(auth);
    setBusy(null);
    if (!result.ok) {
      toast.error(result.error ?? "Impossible d'appeler la personne suivante.");
      return;
    }
    if (!result.data.ticket) {
      toast("Personne en attente pour l'instant.");
      return;
    }
    toast.success(`${result.data.ticket.clientName ?? "La personne suivante"} est appelé(e).`);
    await refresh();
  }

  async function onWalkIn(input: WalkInInput) {
    const result = await walkInAction(auth, input);
    if (!result.ok) {
      toast.error(result.error ?? "L'inscription a échoué.");
      return false;
    }
    setWalkInOpen(false);
    toast.success(`${input.clientName} a rejoint la file.`);
    await refresh();
    return true;
  }

  function onScanned(code: string) {
    if (scanLocked) return;
    setScanLocked(true);
    transitionAction(auth, code, "arrive")
      .then(async (result) => {
        if (!result.ok) {
          toast.error(result.error ?? "Ce ticket n'a pas pu être pris en charge.");
        } else {
          toast.success("Arrivée enregistrée.");
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
          <h1 className="text-xl font-semibold tracking-tight">Ligne du jour</h1>
          <p className="text-sm text-muted-foreground">{view.serviceName}</p>
          <p className="text-xs capitalize text-muted-foreground">{formatDateLabel(view.date, view.timezone)}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
            Scanner
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setWalkInOpen(true)}>
            + Sans RDV
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 pb-32 pt-4">
        {view.entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Personne sur la ligne pour l&apos;instant.
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
                    {formatTime(entry.startsAt ?? entry.arrivedAt, view.timezone)}
                  </div>
                  {entry.dayRank != null ? (
                    <div className="text-[11px] text-muted-foreground">n°{entry.dayRank}</div>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", dotClass(entry.status))} />
                    <p className="truncate font-medium">{entry.clientName ?? "Client"}</p>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={entry.kind === "APPOINTMENT" ? "default" : "secondary"}>
                      {KIND_TEXT[entry.kind]}
                    </Badge>
                    <span>{STATUS_TEXT[entry.status]}</span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2 pl-14 sm:pl-0">
                {entry.status === "CALLED" ? (
                  <Button size="sm" variant="outline" onClick={() => act(entry, "no-show")} disabled={busy !== null}>
                    Absent
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
                      rowActionLabel(rowAction(entry.status) as LineTransition)
                    )}
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </main>

      {/* SUIVANT : le geste unique, gros, en bas, atteignable au pouce. */}
      <div className="fixed inset-x-0 bottom-16 z-40 px-4 pb-4 md:bottom-6">
        <div className="mx-auto max-w-2xl">
          <Button
            size="lg"
            className="h-14 w-full text-base font-semibold shadow-lg"
            onClick={() => void onNext()}
            disabled={busy !== null}
          >
            {busy === "next" ? <Spinner className="h-5 w-5" /> : "SUIVANT"}
          </Button>
        </div>
      </div>

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
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (clientName.trim().length < 2 || clientPhone.trim().length < 6) return;
    setSubmitting(true);
    const ok = await onSubmit({ clientName: clientName.trim(), clientPhone: clientPhone.trim() });
    setSubmitting(false);
    if (ok) {
      setClientName("");
      setClientPhone("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un sans-rendez-vous</DialogTitle>
          <DialogDescription>Le client est au comptoir : il rejoint la file immédiatement.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="walkin-name">Nom du client</FieldLabel>
            <Input
              id="walkin-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              autoFocus
              placeholder="Prénom et nom"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="walkin-phone">Téléphone</FieldLabel>
            <Input
              id="walkin-phone"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              type="tel"
              placeholder="+224 6XX XX XX XX"
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={submitting || clientName.trim().length < 2 || clientPhone.trim().length < 6}
          >
            {submitting ? <Spinner className="h-4 w-4" /> : "Ajouter à la file"}
          </Button>
        </DialogFooter>
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Scanner le ticket du client</DialogTitle>
          <DialogDescription>L&apos;arrivée est enregistrée, comme le bouton « Arrivée ».</DialogDescription>
        </DialogHeader>
        {open ? <QrScanner active={!locked} onDetect={onDetect} /> : null}
        {locked ? <p className="text-center text-sm text-muted-foreground">Arrivée enregistrée…</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
