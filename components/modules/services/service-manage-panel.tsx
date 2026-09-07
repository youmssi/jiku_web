"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ResourceScheduleEditor } from "@/components/modules/services/resource-schedule-editor";
import {
  addRequirementAction,
  createResourceAction,
  createStaffLinkAction,
  fetchBookingLinkAction,
  removeRequirementAction,
  revokeStaffLinkAction,
  setResourceActiveAction,
} from "@/components/modules/services/services.service";
import type {
  ResourceType,
  ServiceRequirement,
  ServiceResource,
  ServiceSummary,
  StaffLink,
} from "@/components/modules/services/schema";

const TIMEZONES = [
  "Africa/Conakry",
  "Africa/Abidjan",
  "Africa/Dakar",
  "Africa/Accra",
  "Africa/Douala",
  "Africa/Casablanca",
  "Europe/Paris",
  "UTC",
] as const;

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "PERSON", label: "Personne" },
  { value: "LOCATION", label: "Lieu" },
  { value: "EQUIPMENT", label: "Équipement" },
];

const TYPE_LABEL: Record<ResourceType, string> = {
  PERSON: "Personne",
  LOCATION: "Lieu",
  EQUIPMENT: "Équipement",
};

/**
 * Gestion complète d'un service (JIKU-84/86) : lien public de réservation à
 * partager, liens de comptoir révocables, ressources (personnes/lieux/équipements)
 * et exigences (ce qu'un créneau consomme de chaque type).
 */
export function ServiceManagePanel({
  service,
  initialResources,
  initialRequirements,
  initialStaffLinks,
}: {
  service: ServiceSummary;
  initialResources: ServiceResource[];
  initialRequirements: ServiceRequirement[];
  initialStaffLinks: StaffLink[];
}) {
  const [resources, setResources] = useState<ServiceResource[]>(initialResources);
  const [requirements, setRequirements] = useState<ServiceRequirement[]>(initialRequirements);
  const [staff, setStaff] = useState<StaffLink[]>(initialStaffLinks);
  const [busy, setBusy] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bookingLink, setBookingLink] = useState<string | null>(null);

  // Staff: création (le jeton n'est montré qu'une fois).
  const [staffLabel, setStaffLabel] = useState("");
  const [freshStaff, setFreshStaff] = useState<{ label: string; token: string } | null>(null);

  // Ressource : création.
  const [resName, setResName] = useState("");
  const [resType, setResType] = useState<ResourceType>("PERSON");
  const [resTimezone, setResTimezone] = useState<string>(TIMEZONES[0]);

  // Exigence : ajout.
  const [reqType, setReqType] = useState<ResourceType>("PERSON");
  const [reqQuantity, setReqQuantity] = useState("1");

  async function showBookingLink() {
    const result = await fetchBookingLinkAction(service.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setBookingLink(`${window.location.origin}/appointments/${result.data}`);
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copié dans le presse-papiers.");
    } catch {
      toast.error("Impossible de copier.");
    }
  }

  async function addStaff() {
    const label = staffLabel.trim();
    if (!label) return;
    setBusy(true);
    const result = await createStaffLinkAction(service.id, label);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setStaffLabel("");
    setFreshStaff({ label: result.data.label, token: result.data.token });
    setStaff((current) => [...current.filter((s) => s.id !== result.data.id), result.data]);
  }

  async function revokeStaff(staffId: string, staffLabelName: string) {
    setBusy(true);
    const result = await revokeStaffLinkAction(service.id, staffId);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Le lien « ${staffLabelName} » a été révoqué.`);
    setStaff((current) => current.map((s) => (s.id === staffId ? { ...s, revoked: true } : s)));
  }

  async function addResource() {
    const name = resName.trim();
    if (!name) return;
    setBusy(true);
    const result = await createResourceAction(name, resType, resTimezone);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setResName("");
    setResources((current) => [...current, result.data]);
    toast.success("Ressource créée.");
  }

  async function toggleResource(resource: ServiceResource) {
    const result = await setResourceActiveAction(resource.id, !resource.active);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setResources((current) => current.map((r) => (r.id === result.data.id ? result.data : r)));
  }

  async function addRequirement() {
    const quantity = Number.parseInt(reqQuantity, 10);
    if (!Number.isFinite(quantity) || quantity < 1) return;
    setBusy(true);
    const result = await addRequirementAction(service.id, reqType, quantity);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setRequirements((current) => [...current.filter((r) => r.id !== result.data.id), result.data]);
  }

  async function removeRequirement(requirementId: string) {
    setBusy(true);
    const result = await removeRequirementAction(service.id, requirementId);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setRequirements((current) => current.filter((r) => r.id !== requirementId));
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">{service.name}</h1>
        <p className="text-sm text-muted-foreground">{service.timezone}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lien public de réservation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Partagez ce lien (WhatsApp, bio, message) : toute personne qui l&apos;a peut
            choisir un créneau sans compte.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={showBookingLink}>
              Afficher le lien
            </Button>
            {bookingLink ? (
              <>
                <code className="max-w-full break-all rounded bg-muted px-2 py-1 font-mono text-xs">
                  {bookingLink}
                </code>
                <Button size="sm" onClick={() => copy(bookingLink)}>
                  Copier
                </Button>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personnel de comptoir</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Chaque lien ouvre la console sur un téléphone. Un employé qui part : révoquez
            son lien, l&apos;accès s&apos;arrête immédiatement.
          </p>
          {staff.map((link) => (
            <div key={link.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span>{link.label}</span>
                {link.revoked ? <Badge variant="outline">révoqué</Badge> : <Badge>actif</Badge>}
              </div>
              {!link.revoked ? (
                <Button size="sm" variant="outline" disabled={busy} onClick={() => revokeStaff(link.id, link.label)}>
                  Révoquer
                </Button>
              ) : null}
            </div>
          ))}
          {freshStaff ? (
            <div className="rounded-lg border border-green-600/30 bg-green-50 p-3 text-sm dark:bg-green-950/30 dark:text-green-200">
              <p className="font-medium">
                Lien pour « {freshStaff.label} » — montrez-le une seule fois :
              </p>
              <p className="mt-1 break-all font-mono text-xs">{window.location.origin}/ligne/{freshStaff.token}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => copy(`${window.location.origin}/ligne/${freshStaff.token}`)}>
                Copier le lien
              </Button>
            </div>
          ) : null}
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <Field>
              <FieldLabel htmlFor="staff-label">Nom du poste</FieldLabel>
              <Input id="staff-label" value={staffLabel} onChange={(e) => setStaffLabel(e.target.value)} placeholder="Comptoir" />
            </Field>
            <Button onClick={addStaff} disabled={busy || !staffLabel.trim()}>
              Créer le lien
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ressources</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Personnes, lieux et équipements nécessaires pour un créneau. Une ressource
            désactivée cesse d&apos;être proposée sans déranger les créneaux existants.
          </p>
          {resources.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune ressource pour le moment.</p>
          ) : (
            <ul className="divide-y">
              {resources.map((resource) => (
                <li key={resource.id} className="py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p>{resource.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {TYPE_LABEL[resource.type]} · {resource.timezone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedId(expandedId === resource.id ? null : resource.id)}
                      >
                        Horaires
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleResource(resource)}>
                        {resource.active ? "Désactiver" : "Activer"}
                      </Button>
                    </div>
                  </div>
                  {expandedId === resource.id ? <ResourceScheduleEditor resource={resource} /> : null}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="res-name">Nom</FieldLabel>
              <Input id="res-name" value={resName} onChange={(e) => setResName(e.target.value)} placeholder="Coumba (coiffeuse)" />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel htmlFor="res-type">Type</FieldLabel>
                <Select value={resType} onValueChange={(v) => setResType(v as ResourceType)}>
                  <SelectTrigger id="res-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="res-zone">Fuseau</FieldLabel>
                <Select value={resTimezone} onValueChange={setResTimezone}>
                  <SelectTrigger id="res-zone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
          <div>
            <Button onClick={addResource} disabled={busy || !resName.trim()}>
              Ajouter la ressource
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exigences du service</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Ce qu&apos;un créneau consomme : un créneau n&apos;est proposé que si chaque exigence
            est satisfaite (ex. 1 personne + 1 lieu pour une coloration).
          </p>
          {requirements.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune exigence — ajoutez-en au moins une pour ouvrir des créneaux.</p>
          ) : (
            <ul className="divide-y">
              {requirements.map((requirement) => (
                <li key={requirement.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span>
                    {TYPE_LABEL[requirement.type]} × {requirement.quantity}
                  </span>
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => removeRequirement(requirement.id)}>
                    Retirer
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <Select value={reqType} onValueChange={(v) => setReqType(v as ResourceType)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="w-24"
              type="number"
              min={1}
              value={reqQuantity}
              onChange={(e) => setReqQuantity(e.target.value)}
              aria-label="Quantité"
            />
            <Button onClick={addRequirement} disabled={busy}>
              Ajouter l&apos;exigence
            </Button>
          </div>
        </CardContent>
      </Card>

      {busy ? (
        <div className="flex justify-center py-2">
          <Spinner />
        </div>
      ) : null}
    </div>
  );
}
