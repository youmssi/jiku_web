"use client";

import Script from "next/script";
import { useCallback, useRef, useState } from "react";
import { googleLoginAction } from "@/components/modules/identity/identity.service";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  renderButton(parent: HTMLElement, options: { theme: string; size: string; width: number }): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

/**
 * The Google Identity Services button (JIKU-51). Renders nothing unless
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID is configured; the credential (an ID token) is
 * exchanged server-side for the platform's own session.
 */
export function GoogleButton({ next }: { next?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const onLoad = useCallback(() => {
    const google = window.google;
    if (!CLIENT_ID || !google || !container.current) {
      return;
    }
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => {
        void googleLoginAction(response.credential, next).then((result) => {
          if (result && !result.ok) {
            setError(result.error);
          }
        });
      },
    });
    google.accounts.id.renderButton(container.current, {
      theme: "outline",
      size: "large",
      width: 320,
    });
  }, [next]);

  if (!CLIENT_ID) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex w-full items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <div ref={container} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={onLoad} />
    </div>
  );
}
