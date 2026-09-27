"use client";

import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { FormFieldError } from "@/components/shared";
import { prepareDocuments } from "./prepare-documents";
import { submitVerificationAction } from "./verification.service";
import {
  DOCUMENT_TYPES,
  submissionSchema,
  type SubmissionInput,
  type VerificationKind,
  type VerificationLimits,
} from "./schema";

const ACCEPT = "image/jpeg,image/png,application/pdf";

/**
 * A personal or company request: the name on the documents, what they are and
 * the files themselves. Photos are shrunk in the browser to fit the upload
 * limit, so an organizer can snap their ID card with a phone and send it as is.
 */
export function RequestForm({ kind, limits }: { kind: VerificationKind; limits: VerificationLimits }) {
  const t = useTranslations("settings.verification.request");
  const types = useTranslations("settings.verification.documentTypes");
  const router = useRouter();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = useForm<SubmissionInput>({
    resolver: zodResolver(submissionSchema),
    mode: "onTouched",
    defaultValues: { kind, legalName: "", documentType: "", registrationNumber: "", taxIdentifier: "", files: [] },
  });

  async function onSubmit(values: SubmissionInput) {
    const prepared = await prepareDocuments(values.files, limits);
    if (!prepared.ok) {
      setError("files", { message: prepared.reason });
      return;
    }
    const form = new FormData();
    form.set("legalName", values.legalName);
    form.set("documentType", values.documentType);
    if (kind === "company") {
      form.set("registrationNumber", values.registrationNumber);
      if (values.taxIdentifier) form.set("taxIdentifier", values.taxIdentifier);
    }
    prepared.files.forEach((file) => form.append("files", file));
    const result = await submitVerificationAction(kind, form);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    reset();
    toast.success(t("submitted"));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          control={control}
          name="legalName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${kind}-legalName`}>{t(kind === "personal" ? "fullName" : "companyName")}</FieldLabel>
              <Input {...field} id={`${kind}-legalName`} aria-invalid={fieldState.invalid} />
              <FieldDescription>{t("legalNameHelp")}</FieldDescription>
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="documentType"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${kind}-documentType`}>{t("documentType")}</FieldLabel>
              <NativeSelect {...field} id={`${kind}-documentType`} className="w-full" aria-invalid={fieldState.invalid}>
                <NativeSelectOption value="">{t("pickDocumentType")}</NativeSelectOption>
                {DOCUMENT_TYPES[kind].map((type) => (
                  <NativeSelectOption key={type} value={type}>
                    {types(type)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
        {kind === "company" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="registrationNumber"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="company-registrationNumber">{t("registrationNumber")}</FieldLabel>
                  <Input {...field} id="company-registrationNumber" aria-invalid={fieldState.invalid} />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="taxIdentifier"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="company-taxIdentifier">{t("taxIdentifier")}</FieldLabel>
                  <Input {...field} id="company-taxIdentifier" aria-invalid={fieldState.invalid} />
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
          </div>
        ) : null}
        <Controller
          control={control}
          name="files"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${kind}-files`}>{t("files")}</FieldLabel>
              <Input
                id={`${kind}-files`}
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                type="file"
                multiple
                accept={ACCEPT}
                aria-invalid={fieldState.invalid}
                onChange={(event) => field.onChange(Array.from(event.target.files ?? []))}
              />
              <FieldDescription>
                {t(kind === "personal" ? "filesHelpPersonal" : "filesHelpCompany", {
                  max: limits.maxFiles,
                  size: Math.floor(limits.maxFileBytes / (1024 * 1024)),
                })}
              </FieldDescription>
              <FormFieldError error={fieldState.error} />
            </Field>
          )}
        />
        <p className="text-xs text-muted-foreground">{t("privacy")}</p>
        <Field orientation="horizontal">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
