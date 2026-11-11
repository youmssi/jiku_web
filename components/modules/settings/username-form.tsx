"use client";

import { useState } from "react";
import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormFieldError } from "@/components/shared";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateOrgUsernameAction } from "./settings.service";

const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .transform((value) => value.toLowerCase())
    .refine((value) => /^[a-z0-9-]+$/.test(value), "usernameCharacters")
    .refine((value) => value.length >= 3, "usernameTooShort")
    .refine((value) => value.length <= 32, "usernameTooLong"),
});

type UsernameFormValues = z.infer<typeof usernameSchema>;

/**
 * L'identifiant public de l'organisation, celui de sa page découverte à
 * /o/{username}. Réservé aux admins et au propriétaire ; une fois choisi, il
 * peut être changé, jamais partagé.
 */
export function UsernameForm({ initial }: { initial: string | null }) {
  const t = useTranslations("settings.username");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username: initial ?? "" },
  });

  const username = useWatch({ control, name: "username" }) ?? "";
  const profileUrl = username
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/o/${username}`
    : null;

  function onSubmit(values: UsernameFormValues) {
    startTransition(async () => {
      const result = await updateOrgUsernameAction(values.username);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("saved"));
      router.refresh();
    });
  }

  async function copyUrl() {
    if (!profileUrl) return;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-wrap items-end gap-2">
            <Controller
              control={control}
              name="username"
              render={({ field, fieldState }) => (
                <Field className="min-w-56 grow basis-56" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("label")}</FieldLabel>
                  <div className="flex items-center gap-0 overflow-hidden rounded-md border border-input">
                    <span className="border-r border-input bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
                      hellojiku.com/o/
                    </span>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      className="rounded-none border-0"
                      placeholder={t("placeholder")}
                    />
                  </div>
                  <FieldDescription>
                    {t("hint", { username: field.value || t("fallback") })}
                  </FieldDescription>
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Button type="submit" disabled={isPending || isSubmitting}>
              {(isPending || isSubmitting) ? t("saving") : t("save")}
            </Button>
          </div>
        </form>
        {profileUrl ? (
          <div className="flex items-center gap-2">
            <code className="truncate rounded-md bg-muted px-2 py-1 text-xs">
              {profileUrl}
            </code>
            <ButtonGroup>
              <Button size="icon-sm" variant="outline" onClick={copyUrl}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                <span className="sr-only">{t("copy")}</span>
              </Button>
              <Button size="icon-sm" variant="outline" asChild>
                <a href={profileUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3.5" />
                  <span className="sr-only">{t("open")}</span>
                </a>
              </Button>
            </ButtonGroup>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
