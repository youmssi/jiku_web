"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
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
      setState(result.ok ? { status: "done" } : { status: "failed", error: result.error });
    });
  }, [token]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {state.status === "verifying" ? (
            <p className="text-sm text-muted-foreground">{t("verifying")}</p>
          ) : state.status === "done" ? (
            <>
              <Alert>
                <AlertTitle>{t("doneTitle")}</AlertTitle>
                <AlertDescription>{t("doneDescription")}</AlertDescription>
              </Alert>
              <Button asChild className="w-full">
                <Link href={ROUTES.ONBOARDING}>{tCommon("continue")}</Link>
              </Button>
            </>
          ) : (
            <>
              <Alert variant="destructive">
                <AlertTitle>{t("failed")}</AlertTitle>
                <AlertDescription>{state.error ?? t("incomplete")}</AlertDescription>
              </Alert>
              <Button asChild variant="outline" className="w-full">
                <Link href={ROUTES.LOGIN}>{t("goToSignIn")}</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
