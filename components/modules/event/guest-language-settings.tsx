"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LOCALE_LABELS, localeDirection } from "@/i18n/routing";
import { saveGuestLanguageAction } from "./event.service";
import { GUEST_LANGUAGES, type GuestLanguageView } from "./schema";

/**
 * The language an event's guests read (JIKU-293). One tap saves it: the card,
 * the ticket, the links and the WhatsApp and email messages follow. Each name
 * is written in its own language, so the organizer recognizes it at once.
 */
export function GuestLanguageSettings({ eventId, initial }: { eventId: string; initial: GuestLanguageView }) {
  const t = useTranslations("events.settings.guestLanguage");
  const [language, setLanguage] = useState(initial.language);
  const [saving, startSaving] = useTransition();

  function choose(next: string) {
    // Radix sends an empty value when the selected item is tapped again: the language stays.
    if (!next || next === language) return;
    const previous = language;
    setLanguage(next);
    startSaving(async () => {
      const result = await saveGuestLanguageAction(eventId, next);
      if (!result.ok) {
        setLanguage(previous);
        toast.error(result.error);
        return;
      }
      toast.success(t("saved", { language: t(`names.${next as "fr" | "en" | "ar"}`) }));
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle id="guest-language-title">{t("title")}</CardTitle>
        <CardDescription id="guest-language-text">{t("text")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ToggleGroup
          type="single"
          variant="outline"
          value={language}
          onValueChange={choose}
          disabled={saving}
          aria-labelledby="guest-language-title"
          aria-describedby="guest-language-text"
          className="flex-wrap"
        >
          {GUEST_LANGUAGES.map((option) => (
            <ToggleGroupItem
              key={option}
              value={option}
              lang={option}
              dir={localeDirection(option)}
              // The chosen language reads at a glance: filled, with a check, not a shade of grey alone.
              className="min-w-24 max-md:h-11 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground [&[data-state=off]>svg]:hidden"
            >
              <Check aria-hidden data-icon="inline-start" />
              {LOCALE_LABELS[option]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardContent>
    </Card>
  );
}
