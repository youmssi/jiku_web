"use client";

import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormFieldError } from "@/components/shared";
import { formatAmount } from "@/lib/currency";
import { orderRoute } from "@/lib/constants";
import { placeOrderAction } from "./sale.service";
import { checkoutSchema, type CheckoutInput, type PublicSale } from "./schema";

/**
 * Picks the tickets and who buys them (JIKU-177). The quantities never go past
 * the places left nor the per-order limit, so the order the buyer sends is one
 * the server can accept; the server still decides, and a lost race comes back
 * as a message rather than a half order.
 */
export function CheckoutForm({ sale, username }: { sale: PublicSale; username: string }) {
  const t = useTranslations("guest.sale");
  const locale = useLocale();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: {
      quantities: Object.fromEntries(sale.categories.map((category) => [category.id, 0])),
      buyerName: "",
      buyerPhone: "",
      buyerEmail: "",
    },
  });
  const quantities = useWatch({ control, name: "quantities" });
  const count = Object.values(quantities).reduce((sum, value) => sum + value, 0);
  const currency = sale.categories[0]?.currency ?? "";
  const total = sale.categories.reduce((sum, category) => sum + category.priceMinor * (quantities[category.id] ?? 0), 0);

  function change(id: string, delta: number) {
    const category = sale.categories.find((candidate) => candidate.id === id);
    if (!category) return;
    const current = quantities[id] ?? 0;
    const roomInOrder = sale.maxTicketsPerOrder - count + current;
    const ceiling = Math.min(roomInOrder, category.available ?? roomInOrder);
    setValue(`quantities.${id}`, Math.max(0, Math.min(ceiling, current + delta)), { shouldDirty: true });
  }

  async function onSubmit(values: CheckoutInput) {
    const result = await placeOrderAction(username, sale.eventId, values);
    if (!result.ok) {
      toast.error(result.error);
      router.refresh();
      return;
    }
    router.push(orderRoute(result.data.token));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <ul className="flex flex-col divide-y rounded-xl border">
        {sale.categories.map((category) => {
          const quantity = quantities[category.id] ?? 0;
          const soldOut = category.available === 0;
          return (
            <li key={category.id} className="flex items-center gap-3 p-4">
              <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: category.colorHex }} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{category.label}</p>
                <p className="text-sm text-muted-foreground">
                  {formatAmount(category.priceMinor, category.currency, locale)}
                  {soldOut
                    ? ` · ${t("soldOutLabel")}`
                    : category.available !== null && category.available <= 20
                      ? ` · ${t("left", { count: category.available })}`
                      : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label={t("less", { label: category.label })}
                  disabled={quantity === 0}
                  onClick={() => change(category.id, -1)}
                >
                  <Minus aria-hidden />
                </Button>
                <span className="w-6 text-center font-medium tabular-nums" aria-live="polite">
                  {quantity}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label={t("more", { label: category.label })}
                  disabled={soldOut || count >= sale.maxTicketsPerOrder || (category.available !== null && quantity >= category.available)}
                  onClick={() => change(category.id, 1)}
                >
                  <Plus aria-hidden />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">{t("ticketCount", { count })}</span>
        <span className="text-lg font-semibold">{formatAmount(total, currency, locale)}</span>
      </div>

      <FieldGroup>
        <Controller
          control={control}
          name="buyerName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="buyer-name">{t("buyerName")}</FieldLabel>
              <Input {...field} id="buyer-name" autoComplete="name" aria-invalid={fieldState.invalid} />
              <FieldDescription>{t("buyerNameHelp")}</FieldDescription>
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="buyerPhone"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="buyer-phone">{t("buyerPhone")}</FieldLabel>
              <Input
                {...field}
                id="buyer-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+224 6XX XX XX XX"
                aria-invalid={fieldState.invalid}
              />
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="buyerEmail"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="buyer-email">{t("buyerEmail")}</FieldLabel>
              <Input {...field} id="buyer-email" type="email" autoComplete="email" aria-invalid={fieldState.invalid} />
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex flex-col gap-2">
        <Button type="submit" size="lg" disabled={isSubmitting || count === 0}>
          {isSubmitting ? t("ordering") : t("order")}
        </Button>
        <p className="text-center text-xs text-muted-foreground">{t("holdNotice", { minutes: sale.holdMinutes })}</p>
      </div>
    </form>
  );
}
