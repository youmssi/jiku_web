"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchTemplateAction,
  previewTemplateAction,
  saveTemplateAction,
  updateVocabularyAction,
} from "./settings.service";
import type {
  TemplateChannelView,
  TemplateDetail,
  TemplateSummary,
  VocabularyEntry,
} from "./schema";

const TERM_KEYS = ["ticket", "appointment", "walkIn", "person", "professional", "action"] as const;
const TEMPLATE_NAMES = ["invitation", "ticket", "event-cancelled", "appointment-reminder", "client-called"] as const;

function isOneOf<T extends string>(list: readonly T[], value: string): value is T {
  return (list as readonly string[]).includes(value);
}

function insertVariable(body: string, name: string): string {
  const token = `{{${name}}}`;
  return body.endsWith("\n") ? body + token : body === "" ? token : `${body}\n${token}`;
}

/**
 * Personnalisation du tenant (JIKU-91) : termes du produit (ticket, rendez-vous,
 * personne…) et gabarits e-mail/WhatsApp adressés aux clients. Chaque gabarit
 * revient au contenu par défaut tant qu'il n'est pas modifié ; un aperçu avec des
 * données d'exemple permet de vérifier avant d'enregistrer.
 */
export function PersonalisationView({
  initialVocabulary,
  templateSummaries,
}: {
  initialVocabulary: VocabularyEntry[];
  templateSummaries: TemplateSummary[];
}) {
  const t = useTranslations("settings.personalisation");
  const [terms, setTerms] = useState<{ key: string; label: string; original: string; value: string }[]>(
    initialVocabulary.map((entry) => ({
      key: entry.key,
      label: isOneOf(TERM_KEYS, entry.key) ? t(`termLabels.${entry.key}`) : entry.label,
      original: entry.value,
      value: entry.value,
    })),
  );
  const [isSavingTerms, startSavingTerms] = useTransition();

  // ─── Gabarits ──────────────────────────────────────────────────────────────

  const [templateName, setTemplateName] = useState<string>(templateSummaries[0]?.name ?? "");
  const [detail, setDetail] = useState<TemplateDetail | null>(null);
  const [channel, setChannel] = useState<string>("");
  const [body, setBody] = useState("");
  const [active, setActive] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [isBusy, startBusy] = useTransition();

  useEffect(() => {
    if (!templateName) return;
    startBusy(async () => {
      const result = await fetchTemplateAction(templateName);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setDetail(result.data);
      const firstChannel = result.data.channels[0];
      setChannel(firstChannel?.channel ?? "");
      setBody(firstChannel?.body ?? "");
      setActive(firstChannel?.active ?? true);
      setPreview(null);
      if (firstChannel) await renderPreview(firstChannel.channel, firstChannel.body);
    });
    // renderPreview only reads its arguments and stable setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateName]);

  const isEmail = channel.toLowerCase() === "email";
  const currentChannel: TemplateChannelView | undefined = useMemo(
    () => detail?.channels.find((entry) => entry.channel === channel),
    [detail, channel],
  );

  function selectChannel(value: string) {
    const entry = detail?.channels.find((candidate) => candidate.channel === value);
    setChannel(value);
    setBody(entry?.body ?? "");
    setActive(entry?.active ?? true);
    setPreview(null);
    if (entry) startBusy(() => renderPreview(entry.channel, entry.body));
  }

  async function renderPreview(forChannel: string, forBody: string) {
    const result = await previewTemplateAction(templateName, { channel: forChannel, body: forBody });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setPreview(result.data.body);
  }

  function saveTerms() {
    startSavingTerms(async () => {
      const changes = terms
        .filter((term) => term.value.trim() !== term.original)
        .map((term) => ({ key: term.key, value: term.value.trim() || null }));
      if (changes.length === 0) {
        toast.success(t("termsUpToDate"));
        return;
      }
      const result = await updateVocabularyAction(changes);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setTerms((current) => current.map((term) => ({ ...term, original: term.value.trim() })));
      toast.success(t("termsSaved"));
    });
  }

  function previewBody() {
    if (!templateName || !channel) return;
    startBusy(() => renderPreview(channel, body));
  }

  function saveTemplate() {
    if (!templateName || !channel) return;
    startBusy(async () => {
      const result = await saveTemplateAction(templateName, { channel, body, active });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const updated = result.data.channels.find((entry) => entry.channel === channel);
      setBody(updated?.body ?? body);
      setActive(updated?.active ?? active);
      toast.success(t("saved"));
      await renderPreview(channel, updated?.body ?? body);
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold">{t("termsTitle")}</h3>
        <p className="text-sm text-muted-foreground">{t("termsText")}</p>
        <div className="flex flex-col gap-3">
          {terms.map((term) => (
            <div key={term.key} className="flex flex-col gap-1">
              <Label htmlFor={`term-${term.key}`}>{term.label}</Label>
              <Input
                id={`term-${term.key}`}
                value={term.value}
                placeholder={term.original}
                onChange={(event) =>
                  setTerms((current) =>
                    current.map((item) => (item.key === term.key ? { ...item, value: event.target.value } : item)),
                  )
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-1">
          <Button onClick={saveTerms} disabled={isSavingTerms}>
            {isSavingTerms ? t("saving") : t("saveTerms")}
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-base font-semibold">{t("messagesTitle")}</h3>
        <p className="text-sm text-muted-foreground">{t("messagesText")}</p>

        {templateSummaries.length === 0 ? null : (
          <div className="flex flex-col gap-3">
            <div className="max-w-xs">
              <Label htmlFor="template-name">{t("message")}</Label>
              <div className="mt-1">
                <Select value={templateName} onValueChange={setTemplateName}>
                  <SelectTrigger id="template-name">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateSummaries.map((summary) => (
                      <SelectItem key={summary.name} value={summary.name}>
                        {isOneOf(TEMPLATE_NAMES, summary.name) ? t(`templateLabels.${summary.name}`) : summary.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {detail ? (
              <>
                {detail.channels.length > 1 ? (
                  <div className="max-w-xs">
                    <Label htmlFor="template-channel">{t("channel")}</Label>
                    <div className="mt-1">
                      <Select value={channel} onValueChange={selectChannel}>
                        <SelectTrigger id="template-channel">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {detail.channels.map((entry) => (
                            <SelectItem key={entry.channel} value={entry.channel}>
                              {entry.channel.toLowerCase() === "email" ? t("email") : t("whatsapp")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  <Switch
                    id="template-active"
                    checked={active}
                    onCheckedChange={(checked) => {
                      setActive(checked);
                      setPreview(null);
                    }}
                  />
                  <Label htmlFor="template-active">{t("active")}</Label>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">{t("previewTitle")}</p>
                  {preview === null ? (
                    <p className="text-sm text-muted-foreground">{isBusy ? t("rendering") : t("previewStale")}</p>
                  ) : isEmail ? (
                    <iframe
                      title={t("previewTitle")}
                      sandbox=""
                      srcDoc={preview}
                      className="h-[28rem] w-full rounded-xl border bg-white"
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap break-words rounded-xl border bg-muted/30 p-4 text-sm">{preview}</pre>
                  )}
                </div>

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="group self-start">
                      {isEmail ? t("editHtml") : t("edit")}
                      <ChevronDown
                        className="transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
                        aria-hidden
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="template-body">{t("body")}</Label>
                      <Textarea
                        id="template-body"
                        rows={12}
                        className="font-mono text-xs"
                        value={body}
                        onChange={(event) => {
                          setBody(event.target.value);
                          setPreview(null);
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{t("variables")}</p>
                      <div className="flex flex-wrap gap-2">
                        {detail.variables.map((variable) => (
                          <Button
                            key={variable.name}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setBody((current) => insertVariable(current, variable.name));
                              setPreview(null);
                            }}
                          >
                            {`{{${variable.name}}}`}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (!currentChannel) return;
                          setBody(currentChannel.defaultBody);
                          setPreview(null);
                        }}
                        disabled={!currentChannel}
                      >
                        {t("restore")}
                      </Button>
                      <Button variant="outline" onClick={previewBody} disabled={!channel || isBusy}>
                        {isBusy ? t("rendering") : t("refreshPreview")}
                      </Button>
                      <Button onClick={saveTemplate} disabled={!channel || isBusy}>
                        {t("save")}
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
