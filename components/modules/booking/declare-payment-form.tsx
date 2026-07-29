"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trackEvent } from "@/lib/analytics";
import { formatAmount } from "@/lib/currency";
import { reservationStatusUrl } from "@/lib/constants";
import { declarePaymentAction } from "@/components/modules/booking/booking.service";
import { declarePaymentSchema, type DeclarePaymentInput } from "@/components/modules/booking/schema";

const OPERATOR_LABELS: Record<string, string> = {
  ORANGE_MONEY: "Orange Money",
  MTN_MOMO: "MTN MoMo",
};

export function DeclarePaymentForm({
  id,
  token,
  kind,
  amountMinor,
  currency,
}: {
  id: string;
  token: string;
  kind: "DEPOSIT" | "BALANCE";
  amountMinor: number;
  currency: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<DeclarePaymentInput>({
    resolver: zodResolver(declarePaymentSchema),
    mode: "onTouched",
    defaultValues: { amountMinor, kind, operator: "ORANGE_MONEY", transactionReference: "" },
  });

  async function onSubmit(values: DeclarePaymentInput) {
    setFormError(null);
    const result = await declarePaymentAction(id, token, values);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    trackEvent("deposit_declared", { amount: values.amountMinor, operator: values.operator });
    router.push(reservationStatusUrl(id, token));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">J&apos;ai déjà payé</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-(--card-spacing)">
        <CardContent>
          <FieldGroup>
            {formError ? (
              <Alert variant="destructive">
                <AlertTitle>Déclaration impossible</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
            <Controller
              control={control}
              name="operator"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Opérateur</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORANGE_MONEY">{OPERATOR_LABELS.ORANGE_MONEY}</SelectItem>
                      <SelectItem value="MTN_MOMO">{OPERATOR_LABELS.MTN_MOMO}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              control={control}
              name="transactionReference"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Identifiant de transaction</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <p className="text-sm text-muted-foreground">
              Montant déclaré : {formatAmount(amountMinor, currency)}
            </p>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Envoi…" : "J'ai payé, valider ma déclaration"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
