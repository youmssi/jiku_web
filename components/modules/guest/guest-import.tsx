"use client";

import { useCallback, useState, useTransition } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { toast } from "sonner";
import { CircleAlert, CircleCheck, Download, FileText, TriangleAlert, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { askRating } from "@/components/modules/feedback";
import { trackEvent } from "@/lib/analytics";
import { importGuestsAction } from "@/components/modules/guest/guest.service";

const CSV_TEMPLATE_PATH = "/templates/guest-import-template.csv";
const REQUIRED_COLUMNS = ["firstname", "lastname", "email", "phone"] as const;
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_REGEX = /^\+?[0-9 ]{6,20}$/;
const MAX_PREVIEW_ROWS = 500;

type RowStatus = "valid" | "warning" | "error";
type RowIssue = "missingFirstName" | "missingLastName" | "missingContact" | "invalidEmail" | "invalidPhone" | "duplicate";

interface ParsedRow {
  rowNumber: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  status: RowStatus;
  issue: RowIssue | null;
}

interface ParsedFile {
  file: File;
  rows: ParsedRow[];
  missingColumns: string[];
  valid: number;
  warnings: number;
  errors: number;
}

/** Mirrors the backend's header matching (GuestService.normalize): lowercase, strip non-alphanumerics. */
function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function blankToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Mirrors the backend's per-row validation (GuestService.validateRow) so problems surface before upload. */
function validateRow(row: Pick<ParsedRow, "firstName" | "lastName" | "email" | "phone">): RowIssue | null {
  if (row.firstName === null) return "missingFirstName";
  if (row.lastName === null) return "missingLastName";
  if (row.email === null && row.phone === null) return "missingContact";
  if (row.email !== null && !EMAIL_REGEX.test(row.email)) return "invalidEmail";
  if (row.phone !== null && !PHONE_REGEX.test(row.phone)) return "invalidPhone";
  return null;
}

function parseCsv(file: File): Promise<ParsedFile> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (result) => {
        const fields = result.meta.fields ?? [];
        const missingColumns = REQUIRED_COLUMNS.filter((column) => !fields.includes(column));
        if (missingColumns.length > 0) {
          resolve({ file, rows: [], missingColumns, valid: 0, warnings: 0, errors: 0 });
          return;
        }

        const seenEmails = new Set<string>();
        const seenPhones = new Set<string>();
        let valid = 0;
        let warnings = 0;
        let errors = 0;

        const rows: ParsedRow[] = result.data.map((record, index) => {
          const base = {
            firstName: blankToNull(record.firstname),
            lastName: blankToNull(record.lastname),
            email: blankToNull(record.email)?.toLowerCase() ?? null,
            phone: blankToNull(record.phone),
          };
          const rowNumber = index + 2;

          const problem = validateRow(base);
          if (problem) {
            errors++;
            return { rowNumber, ...base, status: "error" as const, issue: problem };
          }

          const duplicate =
            (base.email !== null && seenEmails.has(base.email)) || (base.phone !== null && seenPhones.has(base.phone));
          if (base.email) seenEmails.add(base.email);
          if (base.phone) seenPhones.add(base.phone);

          if (duplicate) {
            warnings++;
            return { rowNumber, ...base, status: "warning" as const, issue: "duplicate" as const };
          }

          valid++;
          return { rowNumber, ...base, status: "valid" as const, issue: null };
        });

        resolve({ file, rows, missingColumns: [], valid, warnings, errors });
      },
    });
  });
}

function StatusBadge({ status }: { status: RowStatus }) {
  const t = useTranslations("guests.import.status");
  if (status === "valid") {
    return (
      <Badge variant="secondary">
        <CircleCheck data-icon="inline-start" />
        {t("valid")}
      </Badge>
    );
  }
  if (status === "warning") {
    return (
      <Badge variant="outline">
        <TriangleAlert data-icon="inline-start" />
        {t("warning")}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive">
      <CircleAlert data-icon="inline-start" />
      {t("error")}
    </Badge>
  );
}

/** Every parsed row, its detected fields and its validation status, before anything is uploaded. */
function ReviewDialog({
  parsed,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  parsed: ParsedFile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const t = useTranslations("guests.import");
  const format = useFormatter();
  const shown = parsed.rows.slice(0, MAX_PREVIEW_ROWS);
  const truncated = parsed.rows.length > MAX_PREVIEW_ROWS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("reviewTitle", { file: parsed.file.name })}</DialogTitle>
          <DialogDescription>{t("reviewDescription")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{t("counts.valid", { count: parsed.valid })}</Badge>
          <Badge variant="outline">{t("counts.warnings", { count: parsed.warnings })}</Badge>
          <Badge variant="destructive">{t("counts.errors", { count: parsed.errors })}</Badge>
        </div>

        <div className="max-h-[50vh] overflow-y-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">{t("columns.row")}</TableHead>
                <TableHead>{t("columns.firstName")}</TableHead>
                <TableHead>{t("columns.lastName")}</TableHead>
                <TableHead>{t("columns.email")}</TableHead>
                <TableHead>{t("columns.phone")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.issue")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((row) => (
                <TableRow
                  key={row.rowNumber}
                  className={row.status === "error" ? "bg-destructive/5 hover:bg-destructive/10" : undefined}
                >
                  <TableCell className="text-muted-foreground">{row.rowNumber}</TableCell>
                  <TableCell>{row.firstName ?? "—"}</TableCell>
                  <TableCell>{row.lastName ?? "—"}</TableCell>
                  <TableCell>{row.email ?? "—"}</TableCell>
                  <TableCell>{row.phone ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.issue ? t(`issues.${row.issue}`) : ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {truncated ? (
          <p className="text-xs text-muted-foreground">
            {t("truncated", { shown: format.number(MAX_PREVIEW_ROWS), total: format.number(parsed.rows.length) })}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("back")}
          </Button>
          <Button onClick={onConfirm} disabled={isPending || parsed.valid + parsed.warnings === 0}>
            {isPending ? t("importing") : t("confirm", { count: parsed.valid + parsed.warnings })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Guest import from a CSV file: drop or pick a file, see every row checked the
 * way the server will check it, then confirm. Rows in error are skipped; rows
 * with a warning (a duplicate within the file) are sent and deduplicated by the
 * server.
 */
export function GuestImport({ eventId, onImported }: { eventId: string; onImported?: () => void }) {
  const t = useTranslations("guests.import");
  const format = useFormatter();
  const [isPending, startTransition] = useTransition();
  const [isParsing, setIsParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setIsParsing(true);
    void parseCsv(file).then((result) => {
      setParsed(result);
      setIsParsing(false);
    });
  }, []);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "text/comma-separated-values": [".csv"] },
    multiple: false,
    noKeyboard: true,
  });

  function clearFile() {
    setParsed(null);
    setReviewOpen(false);
  }

  function onConfirmImport() {
    const file = parsed?.file;
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const outcome = await importGuestsAction(eventId, formData);
      if (!outcome.ok) {
        toast.error(outcome.error);
        return;
      }
      const { imported, failed, skippedDuplicates } = outcome.data;
      trackEvent("guests_added", { source: "import", count: imported });
      askRating("guests_imported");
      toast.success(t("done", { imported, failed, duplicates: skippedDuplicates }));
      clearFile();
      onImported?.();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{t("columnsHint")}</p>
        <Button variant="ghost" size="sm" asChild>
          <a href={CSV_TEMPLATE_PATH} download>
            <Download data-icon="inline-start" />
            {t("template")}
          </a>
        </Button>
      </div>

      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"
        }`}
      >
        <input {...getInputProps()} />

        {!parsed ? (
          <Empty className="border-0 p-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Upload className={isParsing ? "animate-pulse" : undefined} />
              </EmptyMedia>
              <EmptyTitle>{isDragActive ? t("drop") : isParsing ? t("reading") : t("choose")}</EmptyTitle>
              <EmptyDescription>
                {isParsing
                  ? t("readingHint")
                  : t.rich("chooseHint", {
                      browse: (chunks) => (
                        <button
                          type="button"
                          className="font-medium text-primary underline underline-offset-4"
                          onClick={(event) => {
                            event.stopPropagation();
                            open();
                          }}
                        >
                          {chunks}
                        </button>
                      ),
                    })}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : parsed.missingColumns.length > 0 ? (
          <Empty className="border-0 p-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleAlert className="text-destructive" />
              </EmptyMedia>
              <EmptyTitle>{t("missingTitle")}</EmptyTitle>
              <EmptyDescription>{t("missingDescription", { columns: parsed.missingColumns.join(", ") })}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  clearFile();
                }}
              >
                {t("another")}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="flex items-center justify-center">
            <Attachment state="done" size="default" className="max-w-sm">
              <AttachmentMedia>
                <FileText />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{parsed.file.name}</AttachmentTitle>
                <AttachmentDescription>
                  {format.number(parsed.file.size / 1024, { style: "unit", unit: "kilobyte", maximumFractionDigits: 1 })} ·{" "}
                  {t("summary", { valid: parsed.valid, warnings: parsed.warnings, errors: parsed.errors })}
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  aria-label={t("remove")}
                  onClick={(event) => {
                    event.stopPropagation();
                    clearFile();
                  }}
                >
                  <X />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          </div>
        )}
      </div>

      {parsed && parsed.missingColumns.length === 0 ? (
        <>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={clearFile} disabled={isPending}>
              {t("cancel")}
            </Button>
            <Button onClick={() => setReviewOpen(true)} disabled={isPending || parsed.rows.length === 0}>
              {t("review", { count: parsed.rows.length })}
            </Button>
          </div>
          <ReviewDialog
            parsed={parsed}
            open={reviewOpen}
            onOpenChange={setReviewOpen}
            onConfirm={onConfirmImport}
            isPending={isPending}
          />
        </>
      ) : null}
    </div>
  );
}
