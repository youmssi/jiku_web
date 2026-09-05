"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  const [terms, setTerms] = useState<{ key: string; label: string; original: string; value: string }[]>(
    initialVocabulary.map((entry) => ({ key: entry.key, label: entry.label, original: entry.value, value: entry.value })),
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
    });
  }, [templateName]);

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
  }

  function saveTerms() {
    startSavingTerms(async () => {
      const changes = terms
        .filter((term) => term.value.trim() !== term.original)
        .map((term) => ({ key: term.key, value: term.value.trim() || null }));
      if (changes.length === 0) {
        toast.success("Terms are up to date.");
        return;
      }
      const result = await updateVocabularyAction(changes);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setTerms((current) => current.map((term) => ({ ...term, original: term.value.trim() })));
      toast.success("Terms saved.");
    });
  }

  function previewBody() {
    if (!templateName || !channel) return;
    startBusy(async () => {
      const result = await previewTemplateAction(templateName, { channel, body });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setPreview(result.data.body);
    });
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
      setPreview(null);
      toast.success("Template saved.");
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold">Terms</h3>
        <p className="text-sm text-muted-foreground">
          Rename the words your clients and team see. Leave a field empty to use the default word.
        </p>
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
            {isSavingTerms ? "Saving…" : "Save terms"}
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-base font-semibold">Client messages</h3>
        <p className="text-sm text-muted-foreground">
          The emails and WhatsApp messages sent to your clients. Until you edit one, the platform
          default is used. Unusual or unknown variables fall back to the default so a message is never lost.
        </p>

        {templateSummaries.length === 0 ? null : (
          <div className="flex flex-col gap-3">
            <div className="max-w-xs">
              <Label>Message</Label>
              <div className="mt-1">
                <Select value={templateName} onValueChange={setTemplateName}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateSummaries.map((summary) => (
                      <SelectItem key={summary.name} value={summary.name}>
                        {summary.label}
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
                    <Label>Channel</Label>
                    <div className="mt-1">
                      <Select value={channel} onValueChange={selectChannel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {detail.channels.map((entry) => (
                            <SelectItem key={entry.channel} value={entry.channel}>
                              {entry.channel.toLowerCase() === "email" ? "Email" : "WhatsApp"}
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
                  <Label htmlFor="template-active">Send this custom version</Label>
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Message body</Label>
                  <Textarea
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
                  <Label>Available variables</Label>
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

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!currentChannel) return;
                      setBody(currentChannel.defaultBody);
                      setPreview(null);
                    }}
                    disabled={!currentChannel}
                  >
                    Restore default wording
                  </Button>
                  <Button variant="outline" onClick={previewBody} disabled={!channel || isBusy}>
                    {isBusy ? "Rendering…" : "Preview"}
                  </Button>
                  <Button onClick={saveTemplate} disabled={!channel || isBusy}>
                    Save template
                  </Button>
                </div>

                {preview !== null ? (
                  <pre className="whitespace-pre-wrap rounded-xl border bg-muted/30 p-4 text-sm">{preview}</pre>
                ) : null}
              </>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
