"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import { takeLineTicket, type AppointmentLinkRef } from "@/components/modules/appointment/appointment.service";
import { lineTicketPath } from "@/components/modules/appointment/line-paths";

/**
 * A client takes a ticket for today's line from the QR shown at the entrance
 * (JIKU-113), without an account: a name and a phone number, then their own
 * ticket page where they follow their place.
 */
export function LineTicketTake({ link, serviceName }: { link: AppointmentLinkRef; serviceName: string }) {
  const t = useTranslations("guest.line.take");
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isPending, startTransition] = useTransition();
  const ready = name.trim().length >= 2 && phone.trim().length >= 6;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) return;
    startTransition(async () => {
      const result = await takeLineTicket(link, { clientName: name.trim(), clientPhone: phone.trim() });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.push(lineTicketPath(link, result.data.ticketCode));
    });
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle", { service: serviceName })}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-5">
            <p className="text-sm text-muted-foreground">{t("text")}</p>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="line-name">{t("name")}</FieldLabel>
                <Input id="line-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="line-phone">{t("phone")}</FieldLabel>
                <Input
                  id="line-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+224 6XX XX XX XX"
                  required
                />
                <FieldDescription>{t("phoneHelp")}</FieldDescription>
              </Field>
            </FieldGroup>
            <Button type="submit" className="w-full rounded-full" disabled={isPending || !ready}>
              {isPending ? t("submitting") : t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
