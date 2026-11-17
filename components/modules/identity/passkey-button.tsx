"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { passkeyCancelled, passkeysSupported, signWithPasskey } from "@/lib/webauthn";
import {
  finishPasskeySignInAction,
  startPasskeySignInAction,
} from "@/components/modules/identity/identity.service";

const noSubscription = () => () => {};

/**
 * Signing in with a passkey (JIKU-318): the device offers the passkeys it holds
 * for this site and unlocks one with a fingerprint, the face or the PIN. Shown
 * only where the browser supports passkeys, once the page has loaded.
 */
export function PasskeyButton({ next }: { next?: string }) {
  const t = useTranslations("auth.passkey");
  const supported = useSyncExternalStore(noSubscription, passkeysSupported, () => false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!supported) return null;

  function signIn() {
    setError(null);
    startTransition(async () => {
      const ceremony = await startPasskeySignInAction();
      if (!ceremony.ok) {
        setError(ceremony.error);
        return;
      }
      let credential: Record<string, unknown>;
      try {
        credential = await signWithPasskey(ceremony.data.options);
      } catch (cause) {
        if (!passkeyCancelled(cause)) setError(t("deviceFailed"));
        return;
      }
      // A finished sign-in redirects; only a failure returns.
      const result = await finishPasskeySignInAction(ceremony.data.ceremonyId, credential, next);
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="outline" className="w-full" onClick={signIn} disabled={pending}>
        {pending ? <Spinner /> : <Fingerprint className="size-4" aria-hidden />}
        {t("signIn")}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
