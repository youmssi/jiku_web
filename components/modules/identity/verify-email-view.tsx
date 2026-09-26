"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { trackEvent } from "@/lib/analytics";
import { ROUTES } from "@/lib/constants";
import { AuthCard } from "@/components/modules/identity/auth-card";
import { verifyEmailAction } from "@/components/modules/identity/identity.service";

type State = { status: "verifying" } | { status: "done" } | { status: "failed"; error: string | null };

/** Consumes the emailed verification token as soon as the page opens (JIKU-49). */
export function VerifyEmailView({ token }: { token: string | null }) {
  const t = useTranslations("auth.verify");
  const tCommon = useTranslations("common.actions");
  const [state, setState] = useState<State>(
    token ? { status: "verifying" } : { status: "failed", error: null },
  );

  useEffect(() => {
    if (!token) {
      return;
    }
    void verifyEmailAction(token).then((result) => {
      if (result.ok) trackEvent("email_verified");
      setState(result.ok ? { status: "done" } : { status: "failed", error: result.error });
    });
  }, [token]);

  return (
    <AuthCard title={t("title")}>
      {state.status === "verifying" ? (
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground" role="status">
          <Spinner />
          {t("verifying")}
        </p>
      ) : state.status === "done" ? (
        <FieldGroup>
          <Alert>
            <AlertTitle>{t("doneTitle")}</AlertTitle>
            <AlertDescription>{t("doneDescription")}</AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <Link href={ROUTES.ONBOARDING}>{tCommon("continue")}</Link>
          </Button>
        </FieldGroup>
      ) : (
        <FieldGroup>
          <Alert variant="destructive">
            <AlertTitle>{t("failed")}</AlertTitle>
            <AlertDescription>{state.error ?? t("incomplete")}</AlertDescription>
          </Alert>
          <Button asChild variant="outline" className="w-full">
            <Link href={ROUTES.LOGIN}>{t("goToSignIn")}</Link>
          </Button>
        </FieldGroup>
      )}
    </AuthCard>
  );
}
