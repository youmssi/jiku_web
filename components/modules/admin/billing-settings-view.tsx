"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm, type Control, type FieldPath } from "react-hook-form";
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
      tiers: initial.tiers.map((tier) => ({ name: tier.name, maxGuests: tier.maxGuests, price: tier.price })),
      subscriptionPlans: initial.subscriptionPlans.map((plan) => ({
        name: plan.name,
        includedPeople: plan.includedPeople,
        maxPeople: plan.maxPeople === null ? "" : String(plan.maxPeople),
        monthly: plan.monthly,
        extraPerson: plan.extraPerson ?? { gnf: 0, fcfa: 0, usdCents: 0 },
      })),
    },
  });

  const tiers = useFieldArray({ control, name: "tiers" });
  const plans = useFieldArray({ control, name: "subscriptionPlans" });

  function onSubmit(values: AdminBillingSettingsFormValues) {
    startTransition(async () => {
      const result = await updateBillingSettingsAction(values);
      if (!result.ok) {
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
          <CardTitle>Event tiers</CardTitle>
          <CardDescription>
            The capacity tiers an organizer can request for an event, ascending by guests. Each
            price is set by hand in GNF, FCFA (XOF and XAF) and US cents (ADR 105).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {tiers.fields.map((tier, index) => (
            <div key={tier.id} className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="grid grid-cols-[1fr_8rem_auto] items-end gap-2">
                <NumberField control={control} name={`tiers.${index}.name`} label="Tier name" text />
                <NumberField control={control} name={`tiers.${index}.maxGuests`} label="Max guests" />
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
              <PriceFields control={control} prefix={`tiers.${index}.price`} />
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => tiers.append({ name: "", maxGuests: 0, price: { gnf: 0, fcfa: 0, usdCents: 0 } })}
            >
              <Plus className="size-3.5" />
              Add tier
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services plans (per month)</CardTitle>
          <CardDescription>
            Priced for the team: the monthly price covers the included people, then each extra
            person costs the extra price. Leave the cap empty for no limit, and the extra price at
            zero for a plan that takes no one more. Yearly payment charges ten months.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {plans.fields.map((plan, index) => (
            <div key={plan.id} className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="grid grid-cols-[1fr_8rem_8rem_auto] items-end gap-2">
                <NumberField control={control} name={`subscriptionPlans.${index}.name`} label="Plan name" text />
                <NumberField control={control} name={`subscriptionPlans.${index}.includedPeople`} label="Included people" />
                <NumberField control={control} name={`subscriptionPlans.${index}.maxPeople`} label="People cap" text />
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
              <p className="text-xs font-medium text-muted-foreground">Monthly price</p>
              <PriceFields control={control} prefix={`subscriptionPlans.${index}.monthly`} />
              <p className="text-xs font-medium text-muted-foreground">Each extra person</p>
              <PriceFields control={control} prefix={`subscriptionPlans.${index}.extraPerson`} />
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                plans.append({
                  name: "",
                  includedPeople: 1,
                  maxPeople: "",
                  monthly: { gnf: 0, fcfa: 0, usdCents: 0 },
                  extraPerson: { gnf: 0, fcfa: 0, usdCents: 0 },
                })
              }
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

type FormControl = Control<AdminBillingSettingsFormValues>;
type FormPath = FieldPath<AdminBillingSettingsFormValues>;

/** One labelled input bound to the settings form; numeric unless [text]. */
function NumberField({
  control,
  name,
  label,
  text,
}: {
  control: FormControl;
  name: FormPath;
  label: string;
  text?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name} className="text-xs">
            {label}
          </FieldLabel>
          <Input
            {...field}
            value={field.value as string | number}
            id={field.name}
            type={text ? "text" : "number"}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
        </Field>
      )}
    />
  );
}

/** The three hand-set amounts of one price: GNF, FCFA (XOF and XAF) and US cents. */
function PriceFields({ control, prefix }: { control: FormControl; prefix: string }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <NumberField control={control} name={`${prefix}.gnf` as FormPath} label="GNF" />
      <NumberField control={control} name={`${prefix}.fcfa` as FormPath} label="FCFA" />
      <NumberField control={control} name={`${prefix}.usdCents` as FormPath} label="USD (cents)" />
    </div>
  );
}
