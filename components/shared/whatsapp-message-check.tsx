"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { WHATSAPP_MESSAGES_GUIDE } from "@/lib/constants";
import { checkWhatsAppMessageAction, type WhatsAppMessageVerdict as Verdict } from "./whatsapp-message-check.service";

/** Wait after the last keystroke before checking, so typing never fires a request per letter. */
const CHECK_DELAY_MS = 600;

/**
 * Tells the organizer, while they write, whether a WhatsApp message reads as
 * information or would be blocked as marketing (JIKU-269), with the words to
 * remove. The backend applies the same word list when the message is sent.
 */
export function WhatsAppMessageCheck({ text }: { text: string }) {
  const t = useTranslations("common.messageCheck");
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  useEffect(() => {
    if (text.trim() === "") return;
    let current = true;
    const timer = setTimeout(() => {
      checkWhatsAppMessageAction(text).then((result) => {
        if (current) setVerdict(result);
      });
    }, CHECK_DELAY_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [text]);

  const shown = text.trim() === "" ? null : verdict;

  return (
    <div aria-live="polite" className="min-h-5 text-sm">
      {shown === null ? null : shown.promotionalWords.length === 0 ? (
        <p className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
          <CircleCheck className="size-4 shrink-0" aria-hidden />
          {t("information")}
        </p>
      ) : (
        <p className="flex items-start gap-1.5 text-amber-700 dark:text-amber-400">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            {t("marketing", { words: shown.promotionalWords.map((word) => t("word", { word })).join(", ") })}{" "}
            <Link href={WHATSAPP_MESSAGES_GUIDE} className="font-medium underline underline-offset-4">
              {t("guide")}
            </Link>
          </span>
        </p>
      )}
    </div>
  );
}
