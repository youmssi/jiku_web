"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Copy, ExternalLink, Share2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { AdvancedOnly, AdvancedSettings, AdvancedToggle } from "@/components/shared";
import { askRating } from "@/components/modules/feedback";
import { zoneCity } from "@/lib/datetime";
import { EntranceQrCard } from "@/components/modules/services/entrance-qr-card";
import { ResourceScheduleEditor } from "@/components/modules/services/resource-schedule-editor";
import { WeeklyHours } from "@/components/modules/services/weekly-hours";
import {
  addRequirementAction,
  createResourceAction,
  createStaffLinkAction,
  removeRequirementAction,
  revokeStaffLinkAction,
  setResourceActiveAction,
} from "@/components/modules/services/services.service";
import type {
  ResourceAvailability,
  ResourceType,
  ServiceRequirement,
  ServiceResource,
  ServiceSummary,
  StaffLink,
} from "@/components/modules/services/schema";
import { RESOURCE_TYPES, SERVICE_TIMEZONES } from "@/components/modules/services/schema";

/**
 * A service's link and hours (JIKU-252): the booking link comes first, ready
 * to copy or share, then the week of whoever receives clients. The rarer
 * settings (several people or rooms, what a slot needs, counter links, the
 * walk-in QR) fold under "Advanced options". A service nobody can book yet
 * says why and offers the fix.
 */
export function ServiceManagePanel({
  service,
  bookingUrl,
  durationMinutes,
  weeks,
  initialResources,
  initialRequirements,
  initialStaffLinks,
}: {
  service: ServiceSummary;
  bookingUrl: string | null;
  durationMinutes: number | null;
  /** Each active person's week, by resource id. */
  weeks: Record<string, ResourceAvailability[]>;
  initialResources: ServiceResource[];
  initialRequirements: ServiceRequirement[];
  initialStaffLinks: StaffLink[];
}) {
  const t = useTranslations("services.manage");
  const types = useTranslations("services.resourceTypes");
  const [resources, setResources] = useState<ServiceResource[]>(initialResources);
  const [requirements, setRequirements] = useState<ServiceRequirement[]>(initialRequirements);
  const [staff, setStaff] = useState<StaffLink[]>(initialStaffLinks);
  const [busy, setBusy] = useState(false);
  const [scheduleFor, setScheduleFor] = useState<ServiceResource | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const hoursT = useTranslations("services.hours");

  // Staff: création, et l'état "copié" du lien le plus récemment copié dans la table.
  const [staffLabel, setStaffLabel] = useState("");
  const [freshStaff, setFreshStaff] = useState<{ label: string; code: string } | null>(null);
  const [copiedStaffId, setCopiedStaffId] = useState<string | null>(null);

  // Ressource : création.
  const [resName, setResName] = useState("");
  const [resType, setResType] = useState<ResourceType>("PERSON");
  const [resTimezone, setResTimezone] = useState<string>(SERVICE_TIMEZONES[0]);

  // Exigence : ajout.
  const [reqType, setReqType] = useState<ResourceType>("PERSON");
  const [reqQuantity, setReqQuantity] = useState("1");

  // Asked once the link is out, the moment the setup has paid off.
  function linkShared() {
    askRating("service_created");
  }

  async function copyLink() {
    if (!bookingUrl) return;
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      linkShared();
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  async function shareLink() {
    if (!bookingUrl) return;
    const text = t("bookingLink.shareText", { service: service.name });
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: service.name, text, url: bookingUrl });
        linkShared();
      } catch {
        // The person closed the share sheet: nothing to report.
      }
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${bookingUrl}`)}`, "_blank", "noopener,noreferrer");
    linkShared();
  }

  // The path renders on the server too (the list of existing links); only a
  // copy, made after a click, needs the absolute URL and so the window.
  function staffLinkPath(code: string): string {
    return `/line/${code}`;
  }

  function staffLinkUrl(code: string): string {
    return `${window.location.origin}${staffLinkPath(code)}`;
  }

  async function copyStaffLink(staffId: string, code: string) {
    try {
      await navigator.clipboard.writeText(staffLinkUrl(code));
      setCopiedStaffId(staffId);
      setTimeout(() => setCopiedStaffId((current) => (current === staffId ? null : current)), 2000);
    } catch {
      toast.error(t("copyFailed"));
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
    if (result.data.code) {
      setFreshStaff({ label: result.data.label, code: result.data.code });
    }
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
    toast.success(t("staff.revokedToast", { label: staffLabelName }));
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
    toast.success(t("resources.created"));
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

  /** The fix offered when a service asks for nothing: one person per appointment. */
  async function addPersonRequirement() {
    setBusy(true);
    const result = await addRequirementAction(service.id, "PERSON", 1);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setRequirements((current) => [...current, result.data]);
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

  const staffColumns: ColumnDef<DataTableFeatures, StaffLink>[] = [
    {
      accessorKey: "label",
      header: t("staff.station"),
      filterFn: "includesString",
    },
    {
      id: "status",
      header: t("status"),
      enableSorting: false,
      cell: ({ row }) =>
        row.original.revoked ? <Badge variant="outline">{t("staff.revoked")}</Badge> : <Badge>{t("staff.active")}</Badge>,
    },
    {
      id: "actions",
      header: t("actions"),
      enableSorting: false,
      cell: ({ row }) => {
        const link = row.original;
        if (link.revoked) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <div className="flex items-center gap-2">
            {link.code ? (
              <ButtonGroup>
                <Button size="icon-sm" variant="outline" onClick={() => copyStaffLink(link.id, link.code!)}>
                  {copiedStaffId === link.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  <span className="sr-only">{t("copy")}</span>
                </Button>
                <Button size="icon-sm" variant="outline" asChild>
                  <a href={staffLinkPath(link.code)} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-3.5" />
                    <span className="sr-only">{t("open")}</span>
                  </a>
                </Button>
              </ButtonGroup>
            ) : null}
            <Button size="sm" variant="outline" disabled={busy} onClick={() => revokeStaff(link.id, link.label)}>
              {t("staff.revoke")}
            </Button>
          </div>
        );
      },
    },
  ];

  const resourceColumns: ColumnDef<DataTableFeatures, ServiceResource>[] = [
    {
      accessorKey: "name",
      header: t("resources.name"),
      filterFn: "includesString",
    },
    {
      id: "type",
      header: t("resources.type"),
      cell: ({ row }) => types(row.original.type),
    },
    {
      accessorKey: "timezone",
      header: t("resources.timezone"),
    },
    {
      id: "status",
      header: t("status"),
      enableSorting: false,
      cell: ({ row }) => (row.original.active ? <Badge>{t("resources.active")}</Badge> : <Badge variant="outline">{t("resources.inactive")}</Badge>),
    },
    {
      id: "actions",
      header: t("actions"),
      enableSorting: false,
      cell: ({ row }) => (
        <ButtonGroup>
          <Button size="sm" variant="outline" onClick={() => setScheduleFor(row.original)}>
            {t("resources.schedule")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => toggleResource(row.original)}>
            {row.original.active ? t("resources.deactivate") : t("resources.activate")}
          </Button>
        </ButtonGroup>
      ),
    },
  ];

  const requirementColumns: ColumnDef<DataTableFeatures, ServiceRequirement>[] = [
    {
      id: "type",
      header: t("resources.type"),
      cell: ({ row }) => types(row.original.type),
    },
    {
      accessorKey: "quantity",
      header: t("requirements.quantity"),
    },
    {
      id: "actions",
      header: t("actions"),
      enableSorting: false,
      cell: ({ row }) => (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => removeRequirement(row.original.id)}>
          {t("remove")}
        </Button>
      ),
    },
  ];

  const people = resources.filter((resource) => resource.type === "PERSON" && resource.active);
  const needsPerson = requirements.some((requirement) => requirement.type === "PERSON");
  const missing =
    requirements.length === 0
      ? "requirement"
      : needsPerson && people.length === 0
        ? "person"
        : needsPerson && people.every((person) => (weeks[person.id]?.length ?? 0) === 0)
          ? "hours"
          : null;

  return (
    <AdvancedSettings initialOpen={people.length !== 1 || requirements.length !== 1 || staff.length > 0}>
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold">{service.name}</h1>
        <p className="text-sm text-muted-foreground">
          {[durationMinutes ? t("duration", { count: durationMinutes }) : null, t("zone", { zone: zoneCity(service.timezone) })]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      {missing ? (
        <Alert>
          <AlertTitle>{t("notBookable.title")}</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>{t(`notBookable.${missing}`)}</span>
            {missing === "requirement" ? (
              <Button className="w-fit" onClick={() => void addPersonRequirement()} disabled={busy}>
                {t("notBookable.addRequirement")}
              </Button>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("bookingLink.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{t("bookingLink.text")}</p>
          {bookingUrl ? (
            <>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 break-all font-mono text-sm underline-offset-4 hover:underline"
              >
                {bookingUrl.replace(/^https?:\/\//, "")}
                <ExternalLink aria-hidden className="size-4 shrink-0" />
                <span className="sr-only">{t("open")}</span>
              </a>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void copyLink()}>
                  {linkCopied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
                  {linkCopied ? t("bookingLink.copied") : t("bookingLink.copy")}
                </Button>
                <Button variant="outline" onClick={() => void shareLink()}>
                  <Share2 data-icon="inline-start" />
                  {t("bookingLink.share")}
                </Button>
              </div>
              <span aria-live="polite" className="sr-only">
                {linkCopied ? t("bookingLink.copied") : ""}
              </span>
            </>
          ) : (
            <p className="text-sm text-destructive">{t("bookingLink.unavailable")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {people.length === 1 ? hoursT("titleOf", { name: people[0].name }) : hoursT("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{hoursT("text")}</p>
          {people.length === 1 ? (
            <WeeklyHours resourceId={people[0].id} initial={weeks[people[0].id] ?? []} />
          ) : people.length > 1 ? (
            <>
              <p className="text-sm">{hoursT("several")}</p>
              <ul className="flex flex-col gap-2">
                {people.map((person) => (
                  <li key={person.id} className="flex items-center justify-between gap-3">
                    <span className="font-medium">{person.name}</span>
                    <Button variant="outline" onClick={() => setScheduleFor(person)}>
                      {hoursT("edit")}
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t("notBookable.person")}</p>
          )}
        </CardContent>
      </Card>

      <AdvancedToggle label={t("advanced")} />
      <AdvancedOnly first>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("resources.title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t("resources.text")}</p>
            {resources.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("resources.empty")}</p>
            ) : (
              <DataTable columns={resourceColumns} data={resources} />
            )}
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="res-name">{t("resources.name")}</FieldLabel>
                <Input id="res-name" value={resName} onChange={(e) => setResName(e.target.value)} placeholder={t("resources.namePlaceholder")} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field>
                  <FieldLabel htmlFor="res-type">{t("resources.type")}</FieldLabel>
                  <Select value={resType} onValueChange={(v) => setResType(v as ResourceType)}>
                    <SelectTrigger id="res-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {types(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="res-zone">{t("resources.timezone")}</FieldLabel>
                  <Select value={resTimezone} onValueChange={setResTimezone}>
                    <SelectTrigger id="res-zone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TIMEZONES.map((zone) => (
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
                {t("resources.add")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("requirements.title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t("requirements.text")}</p>
            {requirements.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("requirements.empty")}</p>
            ) : (
              <DataTable columns={requirementColumns} data={requirements} />
            )}
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <Select value={reqType} onValueChange={(v) => setReqType(v as ResourceType)}>
                <SelectTrigger className="w-40" aria-label={t("requirements.type")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {types(type)}
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
                aria-label={t("requirements.quantity")}
              />
              <Button onClick={addRequirement} disabled={busy}>
                {t("requirements.add")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("staff.title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t("staff.text")}</p>
            {staff.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("staff.empty")}</p>
            ) : (
              <DataTable columns={staffColumns} data={staff} />
            )}
            {freshStaff ? (
              <div className="rounded-lg border border-green-600/30 bg-green-50 p-3 text-sm dark:bg-green-950/30 dark:text-green-200">
                <p className="font-medium">{t("staff.fresh", { label: freshStaff.label })}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="break-all font-mono text-xs">{staffLinkUrl(freshStaff.code)}</p>
                  <ButtonGroup>
                    <Button size="icon-sm" variant="outline" onClick={() => copyStaffLink(freshStaff.code, freshStaff.code)}>
                      {copiedStaffId === freshStaff.code ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      <span className="sr-only">{t("copy")}</span>
                    </Button>
                    <Button size="icon-sm" variant="outline" asChild>
                      <a href={staffLinkPath(freshStaff.code)} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-3.5" />
                        <span className="sr-only">{t("open")}</span>
                      </a>
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            ) : null}
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <Field>
                <FieldLabel htmlFor="staff-label">{t("staff.name")}</FieldLabel>
                <Input id="staff-label" value={staffLabel} onChange={(e) => setStaffLabel(e.target.value)} placeholder={t("staff.namePlaceholder")} />
              </Field>
              <Button onClick={addStaff} disabled={busy || !staffLabel.trim()}>
                {t("staff.create")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <EntranceQrCard serviceId={service.id} serviceName={service.name} />
      </AdvancedOnly>

      {busy ? (
        <div className="flex justify-center py-2">
          <Spinner />
        </div>
      ) : null}

      <Dialog open={scheduleFor != null} onOpenChange={(open) => !open && setScheduleFor(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("resources.scheduleTitle", { name: scheduleFor?.name ?? "" })}</DialogTitle>
          </DialogHeader>
          {scheduleFor ? scheduleFor.type === "PERSON" ? (
            <WeeklyHours resourceId={scheduleFor.id} initial={weeks[scheduleFor.id] ?? []} />
          ) : (
            <ResourceScheduleEditor resource={scheduleFor} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
    </AdvancedSettings>
  );
}
