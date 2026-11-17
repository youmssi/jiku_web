"use client";

import { useState } from "react";
import { Gift, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { FormFieldError, useLocalDateTime } from "@/components/shared";
import { ADMIN_ROUTES } from "@/lib/constants";
import { ActionDialog } from "./action-dialog";
import { offerGiftAction, revokeGiftAction } from "./admin.service";
import { IdentityCell } from "./admin-ui";
import { EventCombobox } from "./event-combobox";
import { TenantCombobox } from "./tenant-combobox";
import {
  GIFT_KINDS,
  GIFT_MAX_DAYS,
  GIFT_MAX_MONTHS,
  offerGiftSchema,
  type AdminGift,
  type AdminGiftPage,
  type GiftKind,
  type OfferGiftFormValues,
} from "./schema";

const STATUS_STYLES: Record<string, string> = {
  OFFERED: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  ACTIVATED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  EXPIRED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  REVOKED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

/**
 * The back office's gifts (JIKU-315): every gift offered, newest first, with
 * what it gives and where it stands, the way to offer one, and the way to take
 * one back before it is activated.
 */
export function GiftsView({ giftsPage, plans }: { giftsPage: AdminGiftPage; plans: string[] }) {
  const t = useTranslations("admin.gifts");
  const common = useTranslations("admin.common");
  const formatDate = useLocalDateTime();
  const describe = useGiftDescription();
  const { entries: gifts } = giftsPage;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{t("intro")}</p>
        <OfferGiftDialog plans={plans} />
      </div>
      {gifts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Gift />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyText")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("offered")}</TableHead>
                <TableHead>{t("organization")}</TableHead>
                <TableHead>{t("gift")}</TableHead>
                <TableHead>{t("claimBy")}</TableHead>
                <TableHead>{common("status")}</TableHead>
                <TableHead>{common("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gifts.map((gift) => (
                <TableRow key={gift.id}>
                  <TableCell>{formatDate(gift.createdAt)}</TableCell>
                  <TableCell>
                    <IdentityCell name={gift.tenantName} id={gift.tenantId} fallbackLabel={`${gift.tenantId.slice(0, 8)}…`} />
                  </TableCell>
                  <TableCell className="max-w-64 whitespace-normal">
                    <span>{describe(gift)}</span>
                    {gift.eventName ? <span className="block text-xs text-muted-foreground">{gift.eventName}</span> : null}
                  </TableCell>
                  <TableCell>{gift.status === "OFFERED" ? formatDate(gift.claimBy) : "—"}</TableCell>
                  <TableCell>
                    <GiftStatusBadge status={gift.status} />
                  </TableCell>
                  <TableCell>
                    {gift.status === "OFFERED" ? (
                      <ActionDialog
                        trigger={t("revoke")}
                        title={t("revokeTitle")}
                        description={t("revokeText")}
                        fieldLabel={t("reason")}
                        confirmLabel={t("revokeConfirm")}
                        destructive
                        onConfirm={(reason) => revokeGiftAction(gift.id, reason)}
                      />
                    ) : (
                      <span className="text-muted-foreground">{gift.revokedReason ?? "—"}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <GiftsPager page={giftsPage.page} size={giftsPage.size} total={giftsPage.total} />
        </>
      )}
    </div>
  );
}

function GiftStatusBadge({ status }: { status: string }) {
  const t = useTranslations("admin.gifts.status");
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.EXPIRED}`}>
      {t.has(status as never) ? t(status as never) : status}
    </span>
  );
}

/** What a gift gives, in a few words. */
function useGiftDescription() {
  const t = useTranslations("admin.gifts.what");
  return (gift: Pick<AdminGift, "kind" | "guests" | "days" | "plan" | "months">) => {
    switch (gift.kind) {
      case "EVENT_GUESTS":
        return t("EVENT_GUESTS", { guests: gift.guests ?? 0, days: gift.days ?? 0 });
      case "SERVICES_PLAN":
        return t("SERVICES_PLAN", { plan: gift.plan ?? "", months: gift.months ?? 0 });
      default:
        return t("ORGANIZER_PACK", { months: gift.months ?? 0 });
    }
  };
}

function GiftsPager({ page, size, total }: { page: number; size: number; total: number }) {
  const t = useTranslations("admin.gifts");
  const pageCount = Math.max(1, Math.ceil(total / size));
  if (pageCount <= 1) return <p className="text-xs text-muted-foreground">{t("showingAll", { count: total })}</p>;
  return (
    <nav aria-label={t("pagination")} className="flex items-center justify-end gap-2">
      <Button asChild={page > 0} variant="outline" size="sm" disabled={page === 0}>
        {page > 0 ? <Link href={`${ADMIN_ROUTES.GIFTS}?page=${page - 1}`}>{t("previous")}</Link> : t("previous")}
      </Button>
      <span className="text-xs text-muted-foreground">{t("page", { page: page + 1, count: pageCount })}</span>
      <Button asChild={page + 1 < pageCount} variant="outline" size="sm" disabled={page + 1 >= pageCount}>
        {page + 1 < pageCount ? <Link href={`${ADMIN_ROUTES.GIFTS}?page=${page + 1}`}>{t("next")}</Link> : t("next")}
      </Button>
    </nav>
  );
}

const DEFAULTS: OfferGiftFormValues = {
  tenant: null,
  kind: "EVENT_GUESTS",
  event: null,
  guests: 300,
  days: 14,
  plan: "",
  months: 1,
  message: "",
  applyNow: false,
};

/** Offer-a-gift flow: what, for whom, a word, and a preview of exactly what the organizer will receive. */
function OfferGiftDialog({ plans }: { plans: string[] }) {
  const t = useTranslations("admin.gifts");
  const router = useRouter();
  const describe = useGiftDescription();
  const [open, setOpen] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    register,
    formState: { isSubmitting, errors },
  } = useForm<OfferGiftFormValues>({
    resolver: zodResolver(offerGiftSchema) as Resolver<OfferGiftFormValues>,
    defaultValues: { ...DEFAULTS, plan: plans[0] ?? "" },
  });
  const values = useWatch({ control });
  const kind = (values.kind ?? "EVENT_GUESTS") as GiftKind;

  async function onSubmit(form: OfferGiftFormValues) {
    if (!form.tenant) return;
    const result = await offerGiftAction({
      tenantId: form.tenant.id,
      kind: form.kind,
      ...(form.kind === "EVENT_GUESTS"
        ? { guests: form.guests, days: form.days, eventId: form.event?.id }
        : { months: form.months, plan: form.kind === "SERVICES_PLAN" ? form.plan : undefined }),
      message: form.message || undefined,
      applyNow: form.applyNow,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(form.applyNow ? t("appliedToast") : t("offeredToast"));
    reset({ ...DEFAULTS, plan: plans[0] ?? "" });
    setOpen(false);
    router.refresh();
  }

  const preview = describe({
    kind,
    guests: values.guests ?? 0,
    days: values.days ?? 0,
    plan: values.plan ?? "",
    months: values.months ?? 0,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-3.5" data-icon="inline-start" />
          {t("offer")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("offer")}</DialogTitle>
          <DialogDescription>{t("offerText")}</DialogDescription>
        </DialogHeader>
        <form id="offer-gift-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Controller
            control={control}
            name="tenant"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="gift-tenant">{t("organization")}</FieldLabel>
                <TenantCombobox
                  id="gift-tenant"
                  value={field.value}
                  onChange={(next) => {
                    field.onChange(next);
                    setValue("event", null);
                  }}
                />
                <FormFieldError error={fieldState.error} />
              </Field>
            )}
          />
          <Field>
            <FieldLabel htmlFor="gift-kind">{t("kind")}</FieldLabel>
            <NativeSelect id="gift-kind" {...register("kind")}>
              {GIFT_KINDS.map((option) => (
                <NativeSelectOption key={option} value={option}>
                  {t(`kinds.${option}`)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          {kind === "EVENT_GUESTS" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field data-invalid={Boolean(errors.guests)}>
                  <FieldLabel htmlFor="gift-guests">{t("guests")}</FieldLabel>
                  <Input id="gift-guests" type="number" inputMode="numeric" min={1} {...register("guests", { valueAsNumber: true })} />
                  <FormFieldError error={errors.guests} />
                </Field>
                <Field data-invalid={Boolean(errors.days)}>
                  <FieldLabel htmlFor="gift-days">{t("days")}</FieldLabel>
                  <Input id="gift-days" type="number" inputMode="numeric" min={1} max={GIFT_MAX_DAYS} {...register("days", { valueAsNumber: true })} />
                  <FormFieldError error={errors.days} />
                </Field>
              </div>
              <Controller
                control={control}
                name="event"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="gift-event">{t("event")}</FieldLabel>
                    <EventCombobox id="gift-event" tenantId={values.tenant?.id ?? null} value={field.value} onChange={field.onChange} />
                    <FieldDescription>{t("eventHint")}</FieldDescription>
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {kind === "SERVICES_PLAN" ? (
                <Field data-invalid={Boolean(errors.plan)}>
                  <FieldLabel htmlFor="gift-plan">{t("plan")}</FieldLabel>
                  <NativeSelect id="gift-plan" {...register("plan")}>
                    {plans.map((plan) => (
                      <NativeSelectOption key={plan} value={plan}>
                        {plan}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FormFieldError error={errors.plan} />
                </Field>
              ) : null}
              <Field data-invalid={Boolean(errors.months)}>
                <FieldLabel htmlFor="gift-months">{t("months")}</FieldLabel>
                <Input id="gift-months" type="number" inputMode="numeric" min={1} max={GIFT_MAX_MONTHS} {...register("months", { valueAsNumber: true })} />
                <FormFieldError error={errors.months} />
              </Field>
            </div>
          )}

          <Field data-invalid={Boolean(errors.message)}>
            <FieldLabel htmlFor="gift-message">{t("message")}</FieldLabel>
            <Textarea id="gift-message" rows={3} maxLength={500} {...register("message")} />
            <FieldDescription>{t("messageHint")}</FieldDescription>
            <FormFieldError error={errors.message} />
          </Field>

          <Controller
            control={control}
            name="applyNow"
            render={({ field }) => (
              <div className="flex items-start gap-3">
                <Checkbox id="gift-apply-now" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                <div className="grid gap-1">
                  <label htmlFor="gift-apply-now" className="text-sm font-medium">
                    {t("applyNow")}
                  </label>
                  <p className="text-xs text-muted-foreground">{t("applyNowHint")}</p>
                </div>
              </div>
            )}
          />

          <div className="rounded-lg border bg-muted/40 p-3 text-sm" aria-live="polite">
            <p className="font-medium">{t("previewTitle")}</p>
            <p className="text-muted-foreground">
              {values.applyNow ? t("previewApplied", { gift: preview }) : t("previewOffered", { gift: preview })}
            </p>
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button type="submit" form="offer-gift-form" disabled={isSubmitting}>
            {isSubmitting ? t("offering") : values.applyNow ? t("applyConfirm") : t("offer")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
