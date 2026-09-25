"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import {
  completeEmbeddedSignupAction,
  removeProviderAction,
  testSendAction,
  updateWhatsAppProviderAction,
} from "./settings.service";
import type { EmbeddedSignupConfig, ProviderSettingsResponse, WhatsAppProviderView } from "./schema";

const SDK_URL = "https://connect.facebook.net/en_US/sdk.js";
const SIGNUP_EVENT = "WA_EMBEDDED_SIGNUP";

interface FacebookLoginResponse {
  authResponse?: { code?: string } | null;
}

interface FacebookSdk {
  init(options: { appId: string; autoLogAppEvents: boolean; xfbml: boolean; version: string }): void;
  login(callback: (response: FacebookLoginResponse) => void, options: Record<string, unknown>): void;
}

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

/** Loads Meta's JavaScript SDK once and initialises it with Jikū's app. */
function loadFacebookSdk(appId: string, version: string): Promise<FacebookSdk> {
  if (window.FB) return Promise.resolve(window.FB);
  return new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      if (!window.FB) return reject(new Error("Meta SDK missing"));
      window.FB.init({ appId, autoLogAppEvents: true, xfbml: false, version });
      resolve(window.FB);
    };
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onerror = () => reject(new Error("Meta SDK failed to load"));
    document.body.appendChild(script);
  });
}

function isFacebookOrigin(origin: string): boolean {
  try {
    const { protocol, hostname } = new URL(origin);
    return protocol === "https:" && (hostname === "facebook.com" || hostname.endsWith(".facebook.com"));
  } catch {
    return false;
  }
}

/**
 * The organization's WhatsApp number (ADR 105). Without an offer that includes
 * it, messages go out from Jikū's number and the section points to the
 * option. With one, the organizer connects their number through Meta's
 * Embedded Signup window — or enters credentials by hand — then sees the
 * connected number, can send a test and disconnect it.
 */
export function WhatsAppNumberSection({
  whatsapp,
  embeddedSignup,
  onUpdated,
}: {
  whatsapp: WhatsAppProviderView;
  embeddedSignup: EmbeddedSignupConfig;
  onUpdated: (data: ProviderSettingsResponse) => void;
}) {
  const t = useTranslations("settings.whatsappNumber");
  const [isConnecting, startConnect] = useTransition();
  const [isRemoving, startRemove] = useTransition();
  const signup = useRef<{ code?: string; wabaId?: string; phoneNumberId?: string }>({});

  function finish(result: Awaited<ReturnType<typeof completeEmbeddedSignupAction>>) {
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onUpdated(result.data);
    toast.success(t("saved"));
  }

  function completeWhenReady() {
    const { code, wabaId, phoneNumberId } = signup.current;
    if (!code || !wabaId || !phoneNumberId) return;
    signup.current = {};
    startConnect(async () => finish(await completeEmbeddedSignupAction({ code, wabaId, phoneNumberId })));
  }

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!isFacebookOrigin(event.origin) || typeof event.data !== "string") return;
      let data: { type?: string; event?: string; data?: { phone_number_id?: string; waba_id?: string } };
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      if (data.type !== SIGNUP_EVENT) return;
      if (data.event === "FINISH" && data.data?.phone_number_id && data.data.waba_id) {
        signup.current.phoneNumberId = data.data.phone_number_id;
        signup.current.wabaId = data.data.waba_id;
        completeWhenReady();
      } else if (data.event === "CANCEL") {
        signup.current = {};
        toast.message(t("cancelled"));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // completeWhenReady only reads refs and stable setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connect() {
    const { appId, configId, graphVersion } = embeddedSignup;
    if (!appId || !configId || !graphVersion) return;
    try {
      const fb = await loadFacebookSdk(appId, graphVersion);
      signup.current = {};
      fb.login(
        (response) => {
          const code = response.authResponse?.code;
          if (!code) return;
          signup.current.code = code;
          completeWhenReady();
        },
        {
          config_id: configId,
          response_type: "code",
          override_default_response_type: true,
          extras: { setup: {}, featureType: "", sessionInfoVersion: "3" },
        },
      );
    } catch {
      toast.error(t("errors.sdk"));
    }
  }

  function disconnect() {
    startRemove(async () => {
      const result = await removeProviderAction("WHATSAPP");
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onUpdated(result.data);
      toast.success(t("disconnected"));
    });
  }

  if (!whatsapp.allowed && !whatsapp.configured) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{t("platform")}</p>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
          <p className="max-w-md text-sm">{t("notIncluded")}</p>
          <Button asChild variant="outline">
            <Link href={ROUTES.BILLING}>{t("seeOption")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {whatsapp.configured && !whatsapp.allowed ? (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertDescription className="text-inherit">{t("lapsed")}</AlertDescription>
        </Alert>
      ) : null}

      {whatsapp.configured ? (
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border p-4">
          <div>
            <p className="flex items-center gap-2 font-medium">
              {whatsapp.displayPhoneNumber ?? whatsapp.phoneNumberId}
              <Badge variant="secondary">{t("connected")}</Badge>
            </p>
            {whatsapp.verifiedName ? <p className="text-sm text-muted-foreground">{whatsapp.verifiedName}</p> : null}
            {whatsapp.displayPhoneNumber ? (
              <p className="text-xs text-muted-foreground">{t("numberId", { id: whatsapp.phoneNumberId ?? "" })}</p>
            ) : null}
          </div>
          <Button variant="outline" onClick={disconnect} disabled={isRemoving}>
            {t("disconnect")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border p-4">
          <p className="text-sm">{t("pitch")}</p>
          {embeddedSignup.enabled ? (
            <>
              <Button className="self-start" onClick={connect} disabled={isConnecting}>
                {isConnecting ? t("connecting") : t("connect")}
              </Button>
              <p className="text-xs text-muted-foreground">{t("connectHelp")}</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">{t("unavailable")}</p>
          )}
        </div>
      )}

      {whatsapp.configured ? <TestSend /> : null}
      {whatsapp.allowed ? <ManualCredentials whatsapp={whatsapp} onUpdated={onUpdated} /> : null}
    </div>
  );
}

function ManualCredentials({
  whatsapp,
  onUpdated,
}: {
  whatsapp: WhatsAppProviderView;
  onUpdated: (data: ProviderSettingsResponse) => void;
}) {
  const t = useTranslations("settings.whatsappNumber");
  const [accessToken, setAccessToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState(whatsapp.phoneNumberId ?? "");
  const [templateName, setTemplateName] = useState(whatsapp.templateName ?? "");
  const [templateLanguage, setTemplateLanguage] = useState(whatsapp.templateLanguage ?? "fr");
  const [isSaving, startSave] = useTransition();

  function save() {
    startSave(async () => {
      const result = await updateWhatsAppProviderAction({
        accessToken: accessToken.trim(),
        phoneNumberId: phoneNumberId.trim(),
        templateName: templateName.trim() || null,
        templateLanguage: templateLanguage.trim() || null,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onUpdated(result.data);
      setAccessToken("");
      toast.success(t("saved"));
    });
  }

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="link" className="h-auto self-start p-0 text-sm">
          {t("manual.toggle")}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="wa-accessToken">{t("manual.accessToken")}</Label>
          <Input
            id="wa-accessToken"
            type="password"
            value={accessToken}
            onChange={(event) => setAccessToken(event.target.value)}
            placeholder="EAAx..."
            autoComplete="off"
          />
          {whatsapp.configured ? (
            <p className="text-xs text-muted-foreground">
              {t("manual.accessTokenCurrent", { masked: whatsapp.accessTokenMasked ?? "••••" })}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="wa-phoneNumberId">{t("manual.phoneNumberId")}</Label>
          <Input
            id="wa-phoneNumberId"
            value={phoneNumberId}
            onChange={(event) => setPhoneNumberId(event.target.value)}
            placeholder="123456789012345"
          />
          <p className="text-xs text-muted-foreground">{t("manual.phoneNumberIdHelp")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <div className="space-y-2">
            <Label htmlFor="wa-templateName">{t("manual.templateName")}</Label>
            <Input
              id="wa-templateName"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              placeholder="event_invitation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wa-templateLanguage">{t("manual.templateLanguage")}</Label>
            <Input
              id="wa-templateLanguage"
              value={templateLanguage}
              onChange={(event) => setTemplateLanguage(event.target.value)}
              maxLength={5}
              className="font-mono"
            />
          </div>
        </div>
        <Button
          className="self-start"
          onClick={save}
          disabled={isSaving || !phoneNumberId.trim() || !accessToken.trim()}
        >
          {isSaving ? t("manual.saving") : t("manual.save")}
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}

function TestSend() {
  const t = useTranslations("settings.whatsappNumber.test");
  const [recipient, setRecipient] = useState("");
  const [isTesting, startTest] = useTransition();

  function send() {
    startTest(async () => {
      const result = await testSendAction("WHATSAPP", recipient.trim());
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (result.data.delivered) {
        toast.success(t("sent"));
      } else {
        toast.error(t("failed", { error: result.data.error ?? "" }));
      }
    });
  }

  return (
    <div className="rounded-xl border p-4">
      <Label htmlFor="wa-test" className="mb-2 block text-sm font-medium">
        {t("label")}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id="wa-test"
          type="tel"
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
          placeholder="+224620000000"
          className="flex-1"
        />
        <Button variant="outline" onClick={send} disabled={isTesting || !recipient.trim()}>
          {isTesting ? t("sending") : t("send")}
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{t("help")}</p>
    </div>
  );
}
