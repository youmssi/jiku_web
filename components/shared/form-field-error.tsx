"use client";

import { useTranslations } from "next-intl";
import type { FieldError as FormError } from "react-hook-form";
import { FieldError } from "@/components/ui/field";
import type { Messages } from "@/i18n/messages";

type ValidationKey = keyof Messages["common"]["validation"];

/**
 * The error under a form field. Zod schemas carry a `common.validation` key as
 * their message, so one schema serves the server action and the form alike and
 * the text follows the visitor's locale; any other message renders as is.
 */
export function FormFieldError({ error }: { error?: FormError }) {
  const t = useTranslations("common.validation");
  const message = error?.message;
  if (!message) return null;
  const key = message as ValidationKey;
  return <FieldError>{t.has(key) ? t(key) : message}</FieldError>;
}
