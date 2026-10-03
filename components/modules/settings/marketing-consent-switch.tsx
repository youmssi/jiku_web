"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { updateMarketingConsentAction } from "@/components/modules/settings/settings.service";

/** Gives or withdraws consent to Jikū's news and tips (JIKU-201). */
export function MarketingConsentSwitch({ initial }: { initial: boolean }) {
  const t = useTranslations("settings.account.news");
  const [granted, setGranted] = useState(initial);
  const [pending, startTransition] = useTransition();

  function onChange(next: boolean) {
    setGranted(next);
    startTransition(async () => {
      const result = await updateMarketingConsentAction(next);
      if (result.ok) {
        toast.success(t("saved"));
      } else {
        setGranted(!next);
        toast.error(result.error);
      }
    });
  }

  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor="marketing-consent">{t("label")}</FieldLabel>
        <FieldDescription>{t("hint")}</FieldDescription>
      </FieldContent>
      <Switch id="marketing-consent" checked={granted} disabled={pending} onCheckedChange={onChange} />
    </Field>
  );
}
