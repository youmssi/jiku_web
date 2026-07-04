"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

/**
 * Root error boundary. Replaces the root layout when an error escapes it, so it
 * must render its own <html>/<body>. Uses inline styles because the global
 * stylesheet may not have loaded. Errors are still reported centrally.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { source: "global-error-boundary", digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ maxWidth: "28rem" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something went wrong</h1>
            <p style={{ marginTop: "0.5rem", color: "#71717a" }}>
              An unexpected error occurred. Please reload the page.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "1px solid #e4e4e7",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
