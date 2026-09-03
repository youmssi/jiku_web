"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    captureException(error, { source: "route-error-boundary", digest: error.digest });
  }, [error]);

  return (
    <StateMessage
      title="Something went wrong"
      description="An unexpected error occurred. You can try again."
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
