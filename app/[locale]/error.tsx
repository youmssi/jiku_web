"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { StateMessage } from "@/components/shared";
import { captureException } from "@/lib/error-tracking";

/**
 * Route-segment error boundary. Catches render/runtime errors thrown anywhere in
 * the app tree, reports them centrally, and offers a recovery action.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    captureException(error, { source: "route-error-boundary", digest: error.digest });
  }, [error]);

  return (
    <StateMessage
      title={t("errorPage.title")}
      description={t("errorPage.description")}
      action={<Button onClick={reset}>{t("actions.tryAgain")}</Button>}
    />
  );
}
