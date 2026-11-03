"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
// By file, not through the shared barrel: this boundary loads with every page,
// and the barrel would ship organizer-only components to all of them (JIKU-287).
import { StateMessage } from "@/components/shared/state-message";
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
