"use client";

import { useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { FormFieldError } from "@/components/shared";
import { formatAmount } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { confirmOrderAction, rejectOrderAction } from "./sale.service";
import { rejectSchema, type OrderStatus, type OrganizerOrder, type RejectInput } from "./schema";

const FILTERS = ["DECLARED", "AWAITING_PAYMENT", "PAID", "ALL"] as const;
type Filter = (typeof FILTERS)[number];

const STATUS_CLASSES: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  DECLARED: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  PAID: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  EXPIRED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  REJECTED: "bg-destructive/10 text-destructive",
};

/**
 * The event's orders (JIKU-177). Declared payments come first: each one holds
 * places until the organizer checks its account and confirms or refuses.
 */
export function OrdersBoard({ eventId, orders }: { eventId: string; orders: OrganizerOrder[] }) {
  const t = useTranslations("events.orders");
  const locale = useLocale();
  const declared = orders.filter((order) => order.status === "DECLARED").length;
  const [filter, setFilter] = useState<Filter>(declared > 0 ? "DECLARED" : "ALL");
  const paid = orders.filter((order) => order.status === "PAID");
  const currency = orders[0]?.currency ?? "";
  const shown = filter === "ALL" ? orders : orders.filter((order) => order.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-3 gap-3">
        <Stat label={t("stats.toConfirm")} value={String(declared)} />
        <Stat label={t("stats.ticketsSold")} value={String(paid.reduce((sum, order) => sum + order.ticketCount, 0))} />
        <Stat
          label={t("stats.collected")}
          value={currency ? formatAmount(paid.reduce((sum, order) => sum + order.totalMinor, 0), currency, locale) : "—"}
        />
      </dl>

      <div className="flex flex-wrap gap-2" role="group" aria-label={t("filterLabel")}>
        {FILTERS.map((value) => (
          <Button key={value} size="sm" variant={filter === value ? "default" : "outline"} onClick={() => setFilter(value)}>
            {t(`filters.${value}`)}
          </Button>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty className="mt-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBag />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyText")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((order) => (
            <OrderCard key={order.id} eventId={eventId} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function OrderCard({ eventId, order }: { eventId: string; order: OrganizerOrder }) {
  const t = useTranslations("events.orders");
  const locale = useLocale();
  const format = useFormatter();
  const decidable = order.status === "AWAITING_PAYMENT" || order.status === "DECLARED";

  return (
    <li className="rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{order.buyerName}</p>
          <p className="text-sm text-muted-foreground">
            {order.buyerPhone}
            {order.buyerEmail ? ` · ${order.buyerEmail}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{order.reference}</span>
          <Badge className={cn(STATUS_CLASSES[order.status])}>{t(`status.${order.status}`)}</Badge>
        </div>
      </div>

      <p className="mt-2 text-sm">
        {order.lines.map((line) => `${line.quantity} × ${line.label}`).join(" · ")}
        <span className="ml-2 font-semibold tabular-nums">{formatAmount(order.totalMinor, order.currency, locale)}</span>
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {order.status === "DECLARED" && order.paymentReference
          ? t("declaredWith", {
              reference: order.paymentReference,
              when: format.dateTime(new Date(order.declaredAt ?? order.createdAt), { dateStyle: "medium", timeStyle: "short" }),
            })
          : order.status === "AWAITING_PAYMENT"
            ? t("expiresAt", { when: format.dateTime(new Date(order.expiresAt), { timeStyle: "short" }) })
            : order.status === "REJECTED" && order.rejectionReason
              ? t("refusedBecause", { reason: order.rejectionReason })
              : t("placedAt", { when: format.dateTime(new Date(order.createdAt), { dateStyle: "medium", timeStyle: "short" }) })}
      </p>

      {decidable ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <ConfirmButton eventId={eventId} order={order} />
          <RejectButton eventId={eventId} order={order} />
        </div>
      ) : null}
    </li>
  );
}

function ConfirmButton({ eventId, order }: { eventId: string; order: OrganizerOrder }) {
  const t = useTranslations("events.orders");
  const locale = useLocale();
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    const result = await confirmOrderAction(eventId, order.id);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("confirmed", { count: order.ticketCount }));
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" disabled={busy}>
          {t("confirm")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("confirmText", {
              amount: formatAmount(order.totalMinor, order.currency, locale),
              reference: order.paymentReference ?? order.reference,
              count: order.ticketCount,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={confirm}>{t("confirm")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RejectButton({ eventId, order }: { eventId: string; order: OrganizerOrder }) {
  const t = useTranslations("events.orders");
  const [open, setOpen] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<RejectInput>({ resolver: zodResolver(rejectSchema), defaultValues: { reason: "" } });

  async function onSubmit(values: RejectInput) {
    const result = await rejectOrderAction(eventId, order.id, values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("refused"));
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {t("refuse")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("refuseTitle")}</DialogTitle>
          <DialogDescription>{t("refuseText")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Controller
            control={control}
            name="reason"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`reason-${order.id}`}>{t("reason")}</FieldLabel>
                <Textarea {...field} id={`reason-${order.id}`} rows={3} aria-invalid={fieldState.invalid} />
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? t("working") : t("refuse")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
