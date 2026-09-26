"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormFieldError } from "@/components/shared";
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
  const t = useTranslations("admin.billing");
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
      toast.success(t("saved"));
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {!initial.managedInDatabase ? (
        <Alert>
          <AlertTitle>{t("defaultsTitle")}</AlertTitle>
          <AlertDescription>{t("defaultsText")}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("payeeTitle")}</CardTitle>
          <CardDescription>{t("payeeText")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="payee.payeeName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("payeeName")}</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="payee.mobileMoneyNumber"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("mobileMoneyNumber")}</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="payee.mobileMoneyOperator"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("mobileMoneyOperator")}</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="payee.contactEmail"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("contactEmail")}</FieldLabel>
                  <Input {...field} id={field.name} type="email" aria-invalid={fieldState.invalid} />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="payee.contactPhone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("contactPhone")}</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="payee.bankDetails"
              render={({ field, fieldState }) => (
                <Field className="sm:col-span-2" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("bankDetails")}</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    rows={3}
                    aria-invalid={fieldState.invalid}
                    placeholder={t("bankPlaceholder")}
                  />
                  <FieldDescription>{t("bankHint")}</FieldDescription>
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("tiersTitle")}</CardTitle>
          <CardDescription>{t("tiersText")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {tiers.fields.map((tier, index) => (
            <div key={tier.id} className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="grid grid-cols-[1fr_8rem_auto] items-end gap-2">
                <NumberField control={control} name={`tiers.${index}.name`} label={t("tierName")} text />
                <NumberField control={control} name={`tiers.${index}.maxGuests`} label={t("maxGuests")} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={tiers.fields.length <= 1}
                  onClick={() => tiers.remove(index)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">{t("removeTier")}</span>
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
              {t("addTier")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("plansTitle")}</CardTitle>
          <CardDescription>{t("plansText")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {plans.fields.map((plan, index) => (
            <div key={plan.id} className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="grid grid-cols-[1fr_8rem_8rem_auto] items-end gap-2">
                <NumberField control={control} name={`subscriptionPlans.${index}.name`} label={t("planName")} text />
                <NumberField control={control} name={`subscriptionPlans.${index}.includedPeople`} label={t("includedPeople")} />
                <NumberField control={control} name={`subscriptionPlans.${index}.maxPeople`} label={t("peopleCap")} text />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={plans.fields.length <= 1}
                  onClick={() => plans.remove(index)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">{t("removePlan")}</span>
                </Button>
              </div>
              <p className="text-xs font-medium text-muted-foreground">{t("monthly")}</p>
              <PriceFields control={control} prefix={`subscriptionPlans.${index}.monthly`} />
              <p className="text-xs font-medium text-muted-foreground">{t("extraPerson")}</p>
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
              {t("addPlan")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <Button type="submit" disabled={isPending || isSubmitting}>
          {isPending || isSubmitting ? t("saving") : t("save")}
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
          <FormFieldError error={fieldState.error} />
        </Field>
      )}
    />
  );
}

/** The three hand-set amounts of one price: GNF, FCFA (XOF and XAF) and US cents. */
function PriceFields({ control, prefix }: { control: FormControl; prefix: string }) {
  const t = useTranslations("admin.billing");
  return (
    <div className="grid grid-cols-3 gap-2">
      <NumberField control={control} name={`${prefix}.gnf` as FormPath} label={t("gnf")} />
      <NumberField control={control} name={`${prefix}.fcfa` as FormPath} label={t("fcfa")} />
      <NumberField control={control} name={`${prefix}.usdCents` as FormPath} label={t("usdCents")} />
    </div>
  );
}
