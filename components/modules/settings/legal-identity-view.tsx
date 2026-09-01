"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateLegalIdentityAction } from "./settings.service";
import type { LegalIdentityResponse } from "./schema";

interface LegalIdentityViewProps {
  identity: LegalIdentityResponse;
}

/**
 * The organization's legal details, as they appear on an invoice (JIKU-69).
 *
 * Most organizers never fill this in — a family paying by Mobile Money does not
 * need an invoice. It matters to companies and public-sector buyers, whose
 * accounts department cannot process a document without it, so the form states
 * plainly whether an invoice can currently be issued rather than letting the
 * organizer discover the refusal at the moment they need one.
 */
export function LegalIdentityView({ identity }: LegalIdentityViewProps) {
  const [legalName, setLegalName] = useState(identity.legalName ?? "");
  const [registrationNumber, setRegistrationNumber] = useState(identity.registrationNumber ?? "");
  const [taxIdentifier, setTaxIdentifier] = useState(identity.taxIdentifier ?? "");
  const [addressLine, setAddressLine] = useState(identity.addressLine ?? "");
  const [city, setCity] = useState(identity.city ?? "");
  const [country, setCountry] = useState(identity.country ?? "");
  const [complete, setComplete] = useState(identity.completeForInvoicing);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateLegalIdentityAction({
        legalName: legalName || null,
        registrationNumber: registrationNumber || null,
        taxIdentifier: taxIdentifier || null,
        addressLine: addressLine || null,
        city: city || null,
        country: country || null,
      });
      if (result.ok) {
        setComplete(result.data.completeForInvoicing);
        toast.success("Legal details saved.");
      } else {
        toast.error(result.error);
      }
    });
  }

  const hasChanges =
    legalName !== (identity.legalName ?? "") ||
    registrationNumber !== (identity.registrationNumber ?? "") ||
    taxIdentifier !== (identity.taxIdentifier ?? "") ||
    addressLine !== (identity.addressLine ?? "") ||
    city !== (identity.city ?? "") ||
    country !== (identity.country ?? "");

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Only needed if you invoice a company or an institution. Leave it blank if you never
        need an invoice.
      </p>

      <div
        className={`rounded-lg border px-4 py-3 text-sm ${
          complete
            ? "border-green-600/30 bg-green-600/5 text-green-700 dark:text-green-400"
            : "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400"
        }`}
      >
        {complete
          ? "Complete — invoices can be issued for your organization."
          : "Incomplete — an invoice needs a legal name, address, city and country."}
      </div>

      <div className="space-y-2">
        <Label htmlFor="legalName">Registered company name</Label>
        <Input
          id="legalName"
          value={legalName}
          onChange={(event) => setLegalName(event.target.value)}
          placeholder="Societe Exemple SARL"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="registrationNumber">Registration number</Label>
          <Input
            id="registrationNumber"
            value={registrationNumber}
            onChange={(event) => setRegistrationNumber(event.target.value)}
            placeholder="RCCM…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxIdentifier">Tax identifier</Label>
          <Input
            id="taxIdentifier"
            value={taxIdentifier}
            onChange={(event) => setTaxIdentifier(event.target.value)}
            placeholder="NIF…"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine">Address</Label>
        <Input
          id="addressLine"
          value={addressLine}
          onChange={(event) => setAddressLine(event.target.value)}
          placeholder="12 rue du Commerce"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Conakry" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country code</Label>
          <Input
            id="country"
            value={country}
            onChange={(event) => setCountry(event.target.value.toUpperCase())}
            maxLength={2}
            placeholder="GN"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={isPending || !hasChanges}>
        {isPending ? "Saving…" : "Save legal details"}
      </Button>
    </div>
  );
}
