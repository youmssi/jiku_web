"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateBillingSettingsAction } from "./admin.service";
import type { AdminBillingSettingsView } from "./schema";
import {
  adminBillingSettingsSchema,
  type AdminBillingSettingsFormValues,
} from "./schema";

/**
 * Le bureau admin pilote les réglages de facturation qui apparaissent dans les
 * instructions de paiement des organisateurs : le bénéficiaire des virements
 * (Mobile Money ou banque) et les grilles de prix. Une soumission remplace tout ;
 * tant que rien n'est enregistré, la configuration d'environnement reste en
 * vigueur.
 */
export function BillingSettingsView({ initial }: { initial: AdminBillingSettingsView }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AdminBillingSettingsFormValues>({
    resolver: zodResolver(adminBillingSettingsSchema),
    defaultValues: {
      payee: {
        payeeName: initial.payee.payeeName ?? "",
        contactEmail: initial.payee.contactEmail ?? "",
        contactPhone: initial.payee.contactPhone ?? "",
        mobileMoneyNumber: initial.payee.mobileMoneyNumber ?? "",
        mobileMoneyOperator: initial.payee.mobileMoneyOperator ?? "",
        bankDetails: initial.payee.bankDetails ?? "",
      },
      tiers: initial.tiers,
      subscriptionPlans: initial.subscriptionPlans,
    },
  });

  const tiers = useFieldArray({ control, name: "tiers" });
  const plans = useFieldArray({ control, name: "subscriptionPlans" });

  function onSubmit(values: AdminBillingSettingsFormValues) {
    startTransition(async () => {
      const result = await updateBillingSettingsAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Réglages de facturation enregistrés.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {!initial.managedInDatabase ? (
        <Alert>
          <AlertTitle>Defaults from configuration</AlertTitle>
          <AlertDescription>
            Nothing has been saved yet, so the values below come from the platform
            configuration. Saving here takes over and becomes the source of truth.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Payee</CardTitle>
          <CardDescription>
            Where organizers send their Mobile Money or bank transfers. Shown
            verbatim in every payment instruction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="payee.payeeName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Account holder name</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="payee.mobileMoneyNumber"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Mobile Money number</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="payee.mobileMoneyOperator"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Mobile Money operator</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="payee.contactEmail"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Contact email</FieldLabel>
                  <Input {...field} id={field.name} type="email" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="payee.contactPhone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Contact phone</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="payee.bankDetails"
              render={({ field, fieldState }) => (
                <Field className="sm:col-span-2" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Bank transfer details</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    rows={3}
                    aria-invalid={fieldState.invalid}
                    placeholder="Bank, branch, account number, account name…"
                  />
                  <FieldDescription>
                    Free text shown to the organizer. Leave empty to hide the bank option.
                  </FieldDescription>
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event tiers ({initial.currency})</CardTitle>
          <CardDescription>
            The capacity tiers an organizer can request for an event. Ascending by
            guests, each with its price in {initial.currency}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {tiers.fields.map((tier, index) => (
            <div key={tier.id} className="grid grid-cols-[1fr_7rem_9rem_auto] items-end gap-2">
              <Controller
                control={control}
                name={`tiers.${index}.name`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="sr-only">
                      Tier name
                    </FieldLabel>
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name={`tiers.${index}.maxGuests`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="sr-only">
                      Max guests
                    </FieldLabel>
                    <Input {...field} id={field.name} type="number" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name={`tiers.${index}.priceMinor`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="sr-only">
                      Price
                    </FieldLabel>
                    <Input {...field} id={field.name} type="number" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={tiers.fields.length <= 1}
                onClick={() => tiers.remove(index)}
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Remove tier</span>
              </Button>
            </div>
          ))}
          <div>
            <Button type="button" variant="outline" size="sm" onClick={() => tiers.append({ name: "", maxGuests: 0, priceMinor: 0 })}>
              <Plus className="size-3.5" />
              Add tier
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription plans ({initial.currency} / month)</CardTitle>
          <CardDescription>
            The prepaid formulas a professional subscribes to, priced per active
            resource. Prepaid periods and discounts stay in platform configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {plans.fields.map((plan, index) => (
            <div key={plan.id} className="grid grid-cols-[1fr_7rem_10rem_auto] items-end gap-2">
              <Controller
                control={control}
                name={`subscriptionPlans.${index}.name`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="sr-only">
                      Plan name
                    </FieldLabel>
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name={`subscriptionPlans.${index}.maxResources`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="sr-only">
                      Max resources
                    </FieldLabel>
                    <Input {...field} id={field.name} type="number" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name={`subscriptionPlans.${index}.priceMinorPerMonth`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="sr-only">
                      Monthly price
                    </FieldLabel>
                    <Input {...field} id={field.name} type="number" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={plans.fields.length <= 1}
                onClick={() => plans.remove(index)}
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Remove plan</span>
              </Button>
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => plans.append({ name: "", maxResources: 1, priceMinorPerMonth: 0 })}
            >
              <Plus className="size-3.5" />
              Add plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <Button type="submit" disabled={isPending || isSubmitting}>
          {(isPending || isSubmitting) ? "Saving…" : "Save billing settings"}
        </Button>
      </div>
    </form>
  );
}
