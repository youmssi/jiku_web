"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { resendVerificationAction } from "@/components/modules/identity/identity.service";

/**
 * Mails the confirmation link again, then says so in place of the button so
 * a second tap has nothing to resend.
 */
export function ResendVerificationButton() {
  const t = useTranslations("auth.confirmEmail");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  if (sent) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {t("resent")}
      </p>
    );
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-fit max-md:h-11"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await resendVerificationAction();
          if (result.ok) {
            setSent(true);
          } else {
            toast.error(result.error);
          }
        })
      }
    >
      {t("resend")}
    </Button>
  );
}

/**
 * The one reminder an unconfirmed organizer sees (JIKU-253): everything works,
 * only sending waits for the address, so it informs instead of blocking.
 */
export function ConfirmEmailBanner({ email }: { email: string }) {
  const t = useTranslations("auth.confirmEmail");
  return (
    <Alert>
      <MailCheck />
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <span>{t("description", { email })}</span>
        <ResendVerificationButton />
      </AlertDescription>
    </Alert>
  );
}
