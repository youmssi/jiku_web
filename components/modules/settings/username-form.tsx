"use client";

import { useState } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
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
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateOrgUsernameAction } from "./settings.service";

const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .transform((value) => value.toLowerCase())
    .refine((value) => /^[a-z0-9-]+$/.test(value), "Use only lowercase letters, numbers and hyphens.")
    .refine((value) => value.length >= 3, "Use at least 3 characters.")
    .refine((value) => value.length <= 32, "Use at most 32 characters."),
});

type UsernameFormValues = z.infer<typeof usernameSchema>;

/**
 * L'identifiant public de l'organisation, celui de sa page découverte à
 * /o/{username}. Réservé aux admins et au propriétaire ; une fois choisi, il
 * peut être changé, jamais partagé.
 */
export function UsernameForm({ initial }: { initial: string | null }) {
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
      toast.success("Your public page is live.");
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
      toast.error("Impossible de copier.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Public page</CardTitle>
        <CardDescription>
          Your discoverable profile. Clients open it to see every bookable service
          and reserve without an account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-wrap items-end gap-2">
            <Controller
              control={control}
              name="username"
              render={({ field, fieldState }) => (
                <Field className="min-w-56 grow basis-56" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Public username</FieldLabel>
                  <div className="flex items-center gap-0 overflow-hidden rounded-md border border-input">
                    <span className="border-r border-input bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
                      jiku.app/o/
                    </span>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      className="rounded-none border-0"
                      placeholder="mon-salon"
                    />
                  </div>
                  <FieldDescription>
                    3 to 32 lowercase letters, numbers and hyphens. Shown as
                    jiku.app/o/{field.value || "username"}.
                  </FieldDescription>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
            <Button type="submit" disabled={isPending || isSubmitting}>
              {(isPending || isSubmitting) ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
        {profileUrl ? (
          <div className="flex items-center gap-2">
            <code className="truncate rounded-md bg-muted px-2 py-1 text-xs">
              {profileUrl}
            </code>
            <Button size="icon-sm" variant="outline" onClick={copyUrl}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              <span className="sr-only">Copy public page link</span>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
