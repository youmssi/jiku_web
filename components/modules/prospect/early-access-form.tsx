"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackEvent } from "@/lib/analytics";
import { registerProspectAction } from "./prospect.service";
import { PROSPECT_SECTORS, WEEKLY_VOLUMES } from "./schema";

/**
 * Capture d'un professionnel intéressé par la prise de rendez-vous (JIKU-98).
 *
 * Le produit n'est pas encore livrable, donc le formulaire **ne promet aucune
 * disponibilité immédiate** : il annonce une liste d'accès anticipé et le dit
 * explicitement. Promettre une réservation qui n'existe pas serait le meilleur
 * moyen de brûler la confiance dans un marché dont l'objection principale est
 * précisément la défiance envers les services numériques non éprouvés.
 *
 * Quatre champs obligatoires seulement : chaque champ supplémentaire coûte de la
 * conversion, et une piste incomplète vaut mieux qu'une piste perdue.
 */
export function EarlyAccessForm() {
  const searchParams = useSearchParams();
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [sector, setSector] = useState<string>(PROSPECT_SECTORS[0].value);
  const [city, setCity] = useState("");
  const [weeklyVolume, setWeeklyVolume] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await registerProspectAction({
        businessName: businessName.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        sector,
        city: city.trim() || null,
        weeklyVolume: weeklyVolume || null,
        // Provenance de campagne, comme pour la réservation d'acompte.
        source: searchParams.get("src"),
      });
      if (result.ok) {
        // La conversion du tunnel rendez-vous. Sans elle, la campagne dépense
        // sur cette page sans qu'on sache jamais ce qu'elle produit.
        trackEvent("prospect_submitted", { sector, source: searchParams.get("src") });
        setDone(true);
      } else {
        // Un échec est aussi une information : un formulaire qui refuse est
        // indiscernable d'un visiteur qui abandonne, dans les chiffres bruts.
        trackEvent("prospect_failed", { sector });
        setError(result.error);
      }
    });
  }

  if (done) {
    return (
      <div
        id="acces-anticipe"
        className="mt-12 rounded-xl border border-green-600/20 bg-green-600/5 p-8 text-center"
      >
        <h2 className="text-xl font-semibold text-green-700 dark:text-green-400">
          C&apos;est noté, merci.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Nous vous appelons avant l&apos;ouverture pour configurer vos services et vos
          horaires avec vous. Vous n&apos;avez rien d&apos;autre à faire d&apos;ici là.
        </p>
      </div>
    );
  }

  return (
    <div id="acces-anticipe" className="mt-12 rounded-xl border border-primary/15 bg-primary/5 p-6 sm:p-8">
      <h2 className="text-xl font-semibold">Rejoindre l&apos;accès anticipé</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        La prise de rendez-vous ouvre bientôt. Laissez-nous vos coordonnées : nous vous
        appelons avant l&apos;ouverture pour tout configurer avec vous, et les premiers
        inscrits démarrent en premier.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Nom de votre activité</Label>
          <Input
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Atelier Aïcha"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contactName">Votre nom</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Aïcha Diallo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone (WhatsApp)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+224 6XX XX XX XX"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sector">Votre activité</Label>
            <select
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
            >
              {PROSPECT_SECTORS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Conakry" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weeklyVolume">Combien de rendez-vous par semaine ?</Label>
          <select
            id="weeklyVolume"
            value={weeklyVolume}
            onChange={(e) => setWeeklyVolume(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="">Je ne sais pas encore</option>
            {WEEKLY_VOLUMES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        <Button type="submit" size="lg" className="w-full rounded-full" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Être prévenu à l'ouverture"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Aucun paiement, aucun engagement. Nous n&apos;utilisons votre numéro que pour
          vous joindre au sujet de Jikū.
        </p>
      </form>
    </div>
  );
}
