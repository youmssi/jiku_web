"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateEmailProviderAction,
  updateWhatsAppProviderAction,
  removeProviderAction,
  testSendAction,
} from "./settings.service";
import type { EmailProviderView, WhatsAppProviderView, ProviderSettingsResponse } from "./schema";

// ─── Email section ──────────────────────────────────────────────────────────

function EmailSection({
  email,
  onUpdated,
}: {
  email: EmailProviderView;
  onUpdated: (data: ProviderSettingsResponse) => void;
}) {
  const [mode, setMode] = useState<"platform" | "resend">(
    email.configured ? "resend" : "platform",
  );
  const [apiKey, setApiKey] = useState("");
  const [from, setFrom] = useState(email.from ?? "");
  const [fromName, setFromName] = useState(email.fromName ?? "");
  const [testRecipient, setTestRecipient] = useState("");
  const [isSaving, startSave] = useTransition();
  const [isTesting, startTest] = useTransition();

  function handleSave() {
    startSave(async () => {
      if (mode === "platform") {
        const result = await removeProviderAction("EMAIL");
        if (!result.ok) { toast.error(result.error); return; }
        onUpdated(result.data);
        return;
      }
      const result = await updateEmailProviderAction({
        apiKey: apiKey.trim(),
        from: from.trim(),
        fromName: fromName.trim() || null,
      });
      if (!result.ok) { toast.error(result.error); return; }
      onUpdated(result.data);
      setApiKey("");
      toast.success("Email provider saved.");
    });
  }

  function handleTest() {
    if (!testRecipient.trim()) return;
    startTest(async () => {
      const result = await testSendAction("EMAIL", testRecipient.trim());
      if (result.ok) {
        toast.success(
          result.data.delivered
            ? "Test message sent successfully."
            : `Test failed: ${result.data.error ?? "unknown error"}`,
        );
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block">Email provider</Label>
        <Select value={mode} onValueChange={(v) => setMode(v as "platform" | "resend")}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="platform">Platform default (Jikū)</SelectItem>
            <SelectItem value="resend">Resend (my own key)</SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {mode === "platform"
            ? "Emails are sent through Jikū's own sending infrastructure. No configuration needed."
            : "Bring your own Resend API key. Emails are sent from your verified domain."}
        </p>
      </div>

      {mode === "resend" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email-apiKey">Resend API key</Label>
            <Input
              id="email-apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="re_..."
              autoComplete="off"
            />
            {email.configured && (
              <p className="text-xs text-muted-foreground">
                Current key: {email.apiKeyMasked ?? "••••"}. Enter a new value to replace it.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-from">From email</Label>
            <Input
              id="email-from"
              type="email"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="noreply@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-fromName">From name (optional)</Label>
            <Input
              id="email-fromName"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="My Organization"
            />
          </div>
        </>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving || (mode === "resend" && !apiKey && !email.configured)}
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>
        {email.configured && mode === "platform" && (
          <span className="text-xs text-muted-foreground">Your custom provider will be removed.</span>
        )}
      </div>

      {email.configured && (
        <div className="rounded-lg border border-border/40 p-4">
          <Label htmlFor="email-test" className="mb-2 block text-sm font-medium">
            Send a test message
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="email-test"
              type="email"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="you@example.com"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isTesting || !testRecipient.trim()}
            >
              {isTesting ? "Sending…" : "Send"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WhatsApp section ────────────────────────────────────────────────────────

function WhatsAppSection({
  whatsapp,
  onUpdated,
}: {
  whatsapp: WhatsAppProviderView;
  onUpdated: (data: ProviderSettingsResponse) => void;
}) {
  const [mode, setMode] = useState<"platform" | "meta">(
    whatsapp.configured ? "meta" : "platform",
  );
  const [accessToken, setAccessToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState(whatsapp.phoneNumberId ?? "");
  const [templateName, setTemplateName] = useState(whatsapp.templateName ?? "");
  const [templateLanguage, setTemplateLanguage] = useState(whatsapp.templateLanguage ?? "fr");
  const [testRecipient, setTestRecipient] = useState("");
  const [isSaving, startSave] = useTransition();
  const [isTesting, startTest] = useTransition();

  function handleSave() {
    startSave(async () => {
      if (mode === "platform") {
        const result = await removeProviderAction("WHATSAPP");
        if (!result.ok) { toast.error(result.error); return; }
        onUpdated(result.data);
        return;
      }
      const result = await updateWhatsAppProviderAction({
        accessToken: accessToken.trim(),
        phoneNumberId: phoneNumberId.trim(),
        templateName: templateName.trim() || null,
        templateLanguage: templateLanguage.trim() || null,
      });
      if (!result.ok) { toast.error(result.error); return; }
      onUpdated(result.data);
      setAccessToken("");
      toast.success("WhatsApp provider saved.");
    });
  }

  function handleTest() {
    if (!testRecipient.trim()) return;
    startTest(async () => {
      const result = await testSendAction("WHATSAPP", testRecipient.trim());
      if (result.ok) {
        toast.success(
          result.data.delivered
            ? "Test message sent successfully."
            : `Test failed: ${result.data.error ?? "unknown error"}`,
        );
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block">WhatsApp provider</Label>
        <Select value={mode} onValueChange={(v) => setMode(v as "platform" | "meta")}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="platform">Platform default (Jikū)</SelectItem>
            <SelectItem value="meta">Meta Cloud API (my own app)</SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {mode === "platform"
            ? "WhatsApp messages are sent through Jikū's own WhatsApp Business Account. No configuration needed."
            : "Bring your own WhatsApp Cloud API credentials from your Meta Business account."}
        </p>
      </div>

      {mode === "meta" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="wa-accessToken">Access token</Label>
            <Input
              id="wa-accessToken"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="EAAx..."
              autoComplete="off"
            />
            {whatsapp.configured && (
              <p className="text-xs text-muted-foreground">
                Current token: {whatsapp.accessTokenMasked ?? "••••"}. Enter a new value to replace it.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wa-phoneNumberId">Phone number ID</Label>
            <Input
              id="wa-phoneNumberId"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="123456789012345"
            />
            <p className="text-xs text-muted-foreground">
              The numeric ID of your WhatsApp Business phone number, found in Meta Business Manager.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wa-templateName">
              Template name <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="wa-templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="event_invitation"
            />
            <p className="text-xs text-muted-foreground">
              An approved message template in Meta Business Manager. If blank, a plain text message is
              sent (works within the 24-hour customer-service window and with test numbers).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wa-templateLanguage">
              Template language <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="wa-templateLanguage"
              value={templateLanguage}
              onChange={(e) => setTemplateLanguage(e.target.value)}
              placeholder="fr"
              maxLength={5}
              className="w-24 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Language code for the template (e.g. fr, en). Defaults to fr.
            </p>
          </div>
        </>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={
            isSaving ||
            (mode === "meta" &&
              (!phoneNumberId.trim() || (!accessToken && !whatsapp.configured)))
          }
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>
        {whatsapp.configured && mode === "platform" && (
          <span className="text-xs text-muted-foreground">Your custom provider will be removed.</span>
        )}
      </div>

      {whatsapp.configured && (
        <div className="rounded-lg border border-border/40 p-4">
          <Label htmlFor="wa-test" className="mb-2 block text-sm font-medium">
            Send a test message
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="wa-test"
              type="tel"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="+224620000000"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isTesting || !testRecipient.trim()}
            >
              {isTesting ? "Sending…" : "Send"}
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Enter a phone number in E.164 format (e.g. +224620000000 for Guinea).
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Provider settings view ─────────────────────────────────────────────────

interface ProviderSettingsViewProps {
  initial: ProviderSettingsResponse;
}

export function ProviderSettingsView({ initial }: ProviderSettingsViewProps) {
  const [data, setData] = useState<ProviderSettingsResponse>(initial);

  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-4 text-base font-semibold">Email</h3>
        <EmailSection email={data.email} onUpdated={setData} />
      </section>

      <hr className="border-border/40" />

      <section>
        <h3 className="mb-4 text-base font-semibold">WhatsApp</h3>
        <WhatsAppSection whatsapp={data.whatsapp} onUpdated={setData} />
      </section>
    </div>
  );
}
