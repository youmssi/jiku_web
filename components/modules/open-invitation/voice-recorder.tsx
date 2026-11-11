"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Mic, RotateCcw, Square, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { removeVoiceAction, saveVoiceAction } from "./open-invitation.service";
import type { CardVoice } from "./schema";

/** Decision D1: a voice message lasts 30 seconds at most. */
const MAX_SECONDS = 30;
/** Speech stays clear at this rate, and 30 seconds weigh about 120 KB. */
const BITS_PER_SECOND = 32_000;
/** The formats phones record in, best first: Opus where the browser has it, AAC on iPhone. */
const RECORDING_TYPES = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4", "audio/webm"];

type Draft = { blob: Blob; url: string; seconds: number };
type State = { kind: "idle" } | { kind: "recording"; startedAt: number } | { kind: "review"; draft: Draft };

/**
 * The host's voice message (JIKU-284). The microphone is asked for only when
 * the host taps "Record"; a refused or missing microphone leaves importing a
 * file. Nothing is sent before "Use this message": the host listens first,
 * and can record again or remove the saved message.
 */
export function VoiceRecorder({ eventId, voice }: { eventId: string; voice: CardVoice | null }) {
  const t = useTranslations("events.openInvitation.voice");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState(voice?.transcript ?? "");
  const [micError, setMicError] = useState(false);
  const [saving, startSaving] = useTransition();
  const recorder = useRef<MediaRecorder | null>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.kind !== "recording") return;
    const timer = window.setInterval(() => {
      const seconds = (Date.now() - state.startedAt) / 1000;
      setElapsed(seconds);
      if (seconds >= MAX_SECONDS) recorder.current?.stop();
    }, 200);
    return () => window.clearInterval(timer);
  }, [state]);

  useEffect(() => () => (state.kind === "review" ? URL.revokeObjectURL(state.draft.url) : undefined), [state]);

  async function record() {
    setMicError(false);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicError(true);
      return;
    }
    const mimeType = RECORDING_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
    const media = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: BITS_PER_SECOND });
    const chunks: Blob[] = [];
    const startedAt = Date.now();
    media.ondataavailable = (event) => chunks.push(event.data);
    media.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks, { type: media.mimeType });
      const seconds = Math.min(MAX_SECONDS, Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
      setState({ kind: "review", draft: { blob, url: URL.createObjectURL(blob), seconds } });
    };
    recorder.current = media;
    media.start();
    setElapsed(0);
    setState({ kind: "recording", startedAt });
  }

  function imported(chosen: File) {
    const url = URL.createObjectURL(chosen);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const seconds = Math.round(audio.duration);
      if (!Number.isFinite(seconds) || seconds < 1 || seconds > MAX_SECONDS) {
        URL.revokeObjectURL(url);
        toast.error(t("errors.tooLong"));
        return;
      }
      setState({ kind: "review", draft: { blob: chosen, url, seconds } });
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error(t("errors.type"));
    };
    audio.src = url;
  }

  function save(draft: Draft) {
    startSaving(async () => {
      const form = new FormData();
      form.set("file", draft.blob, "voice");
      form.set("durationSeconds", String(draft.seconds));
      if (transcript.trim()) form.set("transcript", transcript.trim());
      const result = await saveVoiceAction(eventId, form);
      // A failed upload keeps the recording here, ready to send again.
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("saved"));
      setState({ kind: "idle" });
    });
  }

  function remove() {
    startSaving(async () => {
      const result = await removeVoiceAction(eventId);
      if (!result.ok) toast.error(result.error);
      else setTranscript("");
    });
  }

  return (
    <section aria-labelledby="voice-title" className="flex flex-col gap-3 rounded-xl border p-4">
      <div>
        <h3 id="voice-title" className="text-sm font-medium">
          {t("title")}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("text", { seconds: MAX_SECONDS })}</p>
      </div>

      {state.kind === "recording" ? (
        <div className="flex flex-col gap-2" role="status" aria-live="polite">
          <div className="flex items-center justify-between text-sm font-medium tabular-nums">
            <span className="flex items-center gap-2">
              <span aria-hidden className="size-2.5 animate-pulse rounded-full bg-red-600 motion-reduce:animate-none" />
              {t("recording")}
            </span>
            <span>{t("remaining", { seconds: Math.max(0, Math.ceil(MAX_SECONDS - elapsed)) })}</span>
          </div>
          <Progress value={(elapsed / MAX_SECONDS) * 100} aria-hidden />
          <Button type="button" variant="outline" className="h-11 self-start" onClick={() => recorder.current?.stop()}>
            <Square aria-hidden />
            {t("stop")}
          </Button>
        </div>
      ) : state.kind === "review" ? (
        <div className="flex flex-col gap-3">
          <audio controls src={state.draft.url} className="w-full" aria-label={t("listenDraft")} />
          <Transcript value={transcript} onChange={setTranscript} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="h-11" disabled={saving} onClick={() => save(state.draft)}>
              {t("use")}
            </Button>
            <Button type="button" variant="outline" className="h-11" disabled={saving} onClick={() => setState({ kind: "idle" })}>
              <RotateCcw aria-hidden />
              {t("again")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {voice ? (
            <div className="flex flex-col gap-2">
              <audio controls preload="none" src={voice.url} className="w-full" aria-label={t("listenSaved", { seconds: voice.durationSeconds })} />
              {voice.transcript ? <p className="text-sm text-muted-foreground">« {voice.transcript} »</p> : null}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="h-11" onClick={() => void record()}>
              <Mic aria-hidden />
              {voice ? t("replace") : t("record")}
            </Button>
            <Button type="button" variant="outline" className="h-11" onClick={() => file.current?.click()}>
              <Upload aria-hidden />
              {t("import")}
            </Button>
            {voice ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="ghost" className="h-11" disabled={saving}>
                    <Trash2 aria-hidden />
                    {t("remove")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("removeTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>{t("removeText")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("keep")}</AlertDialogCancel>
                    <AlertDialogAction onClick={remove}>{t("removeConfirm")}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>
          {micError ? (
            <p role="alert" className="text-sm text-destructive">
              {t("micDenied")}
            </p>
          ) : null}
          <input
            ref={file}
            type="file"
            accept="audio/*"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              const chosen = event.target.files?.[0];
              event.target.value = "";
              if (chosen) imported(chosen);
            }}
          />
        </div>
      )}
    </section>
  );
}

function Transcript({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useTranslations("events.openInvitation.voice");
  return (
    <Field>
      <FieldLabel htmlFor="voice-transcript">{t("transcript")}</FieldLabel>
      <Textarea id="voice-transcript" rows={2} maxLength={500} value={value} onChange={(event) => onChange(event.target.value)} />
      <FieldDescription>{t("transcriptHint")}</FieldDescription>
    </Field>
  );
}
