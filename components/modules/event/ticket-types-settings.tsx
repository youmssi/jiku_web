"use client";

import { useState, useTransition } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { MoreHorizontal, Plus, Ticket } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormFieldError } from "@/components/shared";
import { trackEvent } from "@/lib/analytics";
import { currencyDecimals, formatAmount, toMajorUnits } from "@/lib/currency";
import { deleteTicketTypeAction, saveTicketTypeAction } from "./event.service";
import {
  TICKET_TYPE_COLORS,
  ticketTypeFormSchema,
  type TicketTypeFormValues,
  type TicketTypeResponse,
} from "./schema";

const EMPTY: TicketTypeFormValues = {
  label: "",
  colorHex: TICKET_TYPE_COLORS[0],
  maxCapacity: null,
  price: null,
};

/**
 * The event's ticket categories (JIKU-93): VIP, press, standard… each with a
 * colour the door staff recognise at a glance, an optional cap, and an optional
 * price. A priced ticket is paid to the organizer directly and only lets its
 * holder in once marked paid. None of this is required: an event without
 * categories issues one kind of free ticket.
 */
export function TicketTypesSettings({
  eventId,
  ticketTypes,
  currency,
  editable,
}: {
  eventId: string;
  ticketTypes: TicketTypeResponse[];
  /** The organization's currency; null when it could not be read, which hides pricing. */
  currency: string | null;
  editable: boolean;
}) {
  const t = useTranslations("events.tickets");
  const locale = useLocale();
  const format = useFormatter();
  const router = useRouter();
  const [editing, setEditing] = useState<TicketTypeResponse | "new" | null>(null);
  const [pending, startTransition] = useTransition();

  function remove(type: TicketTypeResponse) {
    startTransition(async () => {
      const result = await deleteTicketTypeAction(eventId, type.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("deleted"));
      router.refresh();
    });
  }

  const addButton = editable ? (
    <Button onClick={() => setEditing("new")}>
      <Plus data-icon="inline-start" />
      {t("add")}
    </Button>
  ) : null;

  return (
    <section aria-labelledby="tickets-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="tickets-title" className="text-lg font-medium">{t("title")}</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">{t("description")}</p>
        </div>
        {ticketTypes.length > 0 ? addButton : null}
      </div>

      {ticketTypes.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Ticket />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
          </EmptyHeader>
          {addButton ? <EmptyContent>{addButton}</EmptyContent> : null}
        </Empty>
      ) : (
        <ItemGroup className="gap-2">
          {ticketTypes.map((type) => {
            const full = type.maxCapacity !== null && type.confirmedCount >= type.maxCapacity;
            return (
              <Item key={type.id} variant="outline">
                <ItemMedia>
                  <span aria-hidden className="size-4 rounded-full" style={{ backgroundColor: type.colorHex }} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {type.label}
                    {full ? <Badge variant="secondary">{t("full")}</Badge> : null}
                  </ItemTitle>
                  <ItemDescription>
                    {type.priceMinor && type.currency
                      ? formatAmount(type.priceMinor, type.currency, locale)
                      : t("free")}
                    {" · "}
                    {type.maxCapacity === null
                      ? t("confirmedUncapped", { count: type.confirmedCount })
                      : t("confirmedOf", {
                          count: type.confirmedCount,
                          cap: format.number(type.maxCapacity),
                        })}
                  </ItemDescription>
                  {type.maxCapacity ? (
                    <Progress
                      value={Math.min(100, (type.confirmedCount / type.maxCapacity) * 100)}
                      className="mt-2 max-w-xs"
                      aria-label={t("confirmedOf", { count: type.confirmedCount, cap: format.number(type.maxCapacity) })}
                    />
                  ) : null}
                </ItemContent>
                {editable ? (
                  <ItemActions>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={t("actions", { label: type.label })} disabled={pending}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditing(type)}>{t("edit")}</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onSelect={() => remove(type)}>
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </ItemActions>
                ) : null}
              </Item>
            );
          })}
        </ItemGroup>
      )}

      <TicketTypeDialog
        key={editing === null ? "closed" : editing === "new" ? "new" : editing.id}
        eventId={eventId}
        editing={editing}
        currency={currency}
        position={editing && editing !== "new" ? editing.position : ticketTypes.length}
        onClose={() => setEditing(null)}
      />
    </section>
  );
}

function TicketTypeDialog({
  eventId,
  editing,
  currency,
  position,
  onClose,
}: {
  eventId: string;
  editing: TicketTypeResponse | "new" | null;
  currency: string | null;
  position: number;
  onClose: () => void;
}) {
  const t = useTranslations("events.tickets");
  const tCommon = useTranslations("common.actions");
  const router = useRouter();
  const existing = editing && editing !== "new" ? editing : null;
  const priceCurrency = existing?.currency ?? currency;
  // A confirmed ticket's price is part of what its holder agreed to pay.
  const priceLocked = (existing?.confirmedCount ?? 0) > 0;
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<TicketTypeFormValues>({
    resolver: zodResolver(ticketTypeFormSchema),
    mode: "onTouched",
    defaultValues: existing
      ? {
          label: existing.label,
          colorHex: existing.colorHex,
          maxCapacity: existing.maxCapacity,
          price:
            existing.priceMinor && existing.currency ? toMajorUnits(existing.priceMinor, existing.currency) : null,
        }
      : EMPTY,
  });

  async function onSubmit(values: TicketTypeFormValues) {
    const result = await saveTicketTypeAction(eventId, existing?.id ?? null, values, {
      position,
      currency: priceCurrency ?? "",
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    trackEvent("ticket_category_saved", { priced: (values.price ?? 0) > 0 });
    toast.success(existing ? t("updated") : t("added"));
    onClose();
    router.refresh();
  }

  return (
    <Dialog open={editing !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existing ? t("editTitle") : t("addTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>
        <form id="ticket-type-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={control}
              name="label"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("label")}</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    autoFocus
                    placeholder={t("labelPlaceholder")}
                    aria-invalid={fieldState.invalid}
                  />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            {priceCurrency ? (
              <Controller
                control={control}
                name="price"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{t("price")}</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id={field.name}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={currencyDecimals(priceCurrency) === 0 ? 1 : 0.01}
                        placeholder={t("pricePlaceholder")}
                        value={field.value ?? ""}
                        onBlur={field.onBlur}
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? null : Number(event.target.value))
                        }
                        disabled={priceLocked}
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>{priceCurrency}</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>{priceLocked ? t("priceLocked") : t("priceHint")}</FieldDescription>
                    <FormFieldError error={fieldState.error} />
                  </Field>
                )}
              />
            ) : null}
            <Controller
              control={control}
              name="maxCapacity"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("capacity")}</FieldLabel>
                  <Input
                    id={field.name}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder={t("capacityPlaceholder")}
                    value={field.value ?? ""}
                    onBlur={field.onBlur}
                    onChange={(event) =>
                      field.onChange(event.target.value === "" ? null : Number(event.target.value))
                    }
                    aria-invalid={fieldState.invalid}
                    className="max-w-40"
                  />
                  <FieldDescription>{t("capacityHint")}</FieldDescription>
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="colorHex"
              render={({ field }) => (
                <FieldSet>
                  <FieldLegend variant="label">{t("color")}</FieldLegend>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-wrap gap-2">
                    {TICKET_TYPE_COLORS.map((color, index) => (
                      <RadioGroupItem
                        key={color}
                        value={color}
                        aria-label={t("colorOption", { index: index + 1 })}
                        className="size-8 border-2 border-transparent data-[state=checked]:border-foreground [&_svg]:hidden"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </RadioGroup>
                  <FieldDescription>{t("colorHint")}</FieldDescription>
                </FieldSet>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" form="ticket-type-form" disabled={isSubmitting}>
            {isSubmitting ? t("saving") : existing ? t("save") : t("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
