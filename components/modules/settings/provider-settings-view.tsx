"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
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
  removeProviderAction,
  testSendAction,
} from "./settings.service";
import { WhatsAppNumberSection } from "./whatsapp-number-section";
import type { EmailProviderView, EmbeddedSignupConfig, ProviderSettingsResponse } from "./schema";

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

// ─── Provider settings view ─────────────────────────────────────────────────

interface ProviderSettingsViewProps {
  initial: ProviderSettingsResponse;
  embeddedSignup: EmbeddedSignupConfig;
}

export function ProviderSettingsView({ initial, embeddedSignup }: ProviderSettingsViewProps) {
  const t = useTranslations("settings.whatsappNumber");
  const [data, setData] = useState<ProviderSettingsResponse>(initial);

  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-4 text-base font-semibold">Email</h3>
        <EmailSection email={data.email} onUpdated={setData} />
      </section>

      <hr className="border-border/40" />

      <section>
        <h3 className="mb-4 text-base font-semibold">{t("title")}</h3>
        <WhatsAppNumberSection whatsapp={data.whatsapp} embeddedSignup={embeddedSignup} onUpdated={setData} />
      </section>
    </div>
  );
}
