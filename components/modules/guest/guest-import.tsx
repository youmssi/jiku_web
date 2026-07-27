"use client";

import { useCallback, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import Link from "next/link";
import { toast } from "sonner";
import { Download, Upload, FileText, X, CircleCheck, CircleAlert, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Attachment,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentMedia,
} from "@/components/ui/attachment";
import { importGuestsAction } from "@/components/modules/guest/guest.service";

const CSV_TEMPLATE_PATH = "/templates/guest-import-template.csv";
const REQUIRED_COLUMNS = ["firstname", "lastname", "email", "phone"] as const;
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_REGEX = /^\+?[0-9 ]{6,20}$/;
const MAX_PREVIEW_ROWS = 500;

type RowStatus = "valid" | "warning" | "error";

interface ParsedRow {
  rowNumber: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  status: RowStatus;
  issue: string | null;
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
function validateRow(row: Omit<ParsedRow, "rowNumber" | "status" | "issue">): string | null {
  if (row.firstName === null) return "Missing first name";
  if (row.lastName === null) return "Missing last name";
  if (row.email === null && row.phone === null) return "Missing both email and phone";
  if (row.email !== null && !EMAIL_REGEX.test(row.email)) return "Invalid email format";
  if (row.phone !== null && !PHONE_REGEX.test(row.phone)) return "Invalid phone number";
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
        const missingColumns = REQUIRED_COLUMNS.filter((col) => !fields.includes(col));
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
          const firstName = blankToNull(record.firstname);
          const lastName = blankToNull(record.lastname);
          const email = blankToNull(record.email)?.toLowerCase() ?? null;
          const phone = blankToNull(record.phone);
          const base = { firstName, lastName, email, phone };

          const problem = validateRow(base);
          if (problem) {
            errors++;
            return { rowNumber: index + 2, ...base, status: "error" as const, issue: problem };
          }

          const duplicate =
            (email !== null && seenEmails.has(email)) || (phone !== null && seenPhones.has(phone));
          if (email) seenEmails.add(email);
          if (phone) seenPhones.add(phone);

          if (duplicate) {
            warnings++;
            return {
              rowNumber: index + 2,
              ...base,
              status: "warning" as const,
              issue: "Duplicate email or phone within this file",
            };
          }

          valid++;
          return { rowNumber: index + 2, ...base, status: "valid" as const, issue: null };
        });

        resolve({ file, rows, missingColumns: [], valid, warnings, errors });
      },
    });
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusBadge({ status }: { status: RowStatus }) {
  if (status === "valid") {
    return (
      <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
        <CircleCheck data-icon="inline-start" />
        Valid
      </Badge>
    );
  }
  if (status === "warning") {
    return (
      <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
        <TriangleAlert data-icon="inline-start" />
        Warning
      </Badge>
    );
  }
  return (
    <Badge variant="destructive">
      <CircleAlert data-icon="inline-start" />
      Error
    </Badge>
  );
}

/** Review dialog: every parsed row, its detected fields, and its validation status, before anything is uploaded. */
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
  const shown = parsed.rows.slice(0, MAX_PREVIEW_ROWS);
  const truncated = parsed.rows.length > MAX_PREVIEW_ROWS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Review {parsed.file.name}</DialogTitle>
          <DialogDescription>
            Check every row before importing. Rows marked{" "}
            <span className="font-medium text-destructive">Error</span> are skipped automatically; rows
            marked <span className="font-medium text-amber-600 dark:text-amber-400">Warning</span> are
            imported but worth a second look.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
            {parsed.valid} valid
          </Badge>
          <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
            {parsed.warnings} warning{parsed.warnings === 1 ? "" : "s"}
          </Badge>
          <Badge variant="destructive">
            {parsed.errors} error{parsed.errors === 1 ? "" : "s"}
          </Badge>
        </div>

        <div className="max-h-[50vh] overflow-y-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Row</TableHead>
                <TableHead>First name</TableHead>
                <TableHead>Last name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((row) => (
                <TableRow
                  key={row.rowNumber}
                  className={
                    row.status === "error"
                      ? "bg-destructive/5 hover:bg-destructive/10"
                      : row.status === "warning"
                        ? "bg-amber-500/5 hover:bg-amber-500/10"
                        : undefined
                  }
                >
                  <TableCell className="text-muted-foreground">{row.rowNumber}</TableCell>
                  <TableCell>{row.firstName ?? "—"}</TableCell>
                  <TableCell>{row.lastName ?? "—"}</TableCell>
                  <TableCell>{row.email ?? "—"}</TableCell>
                  <TableCell>{row.phone ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.issue ?? ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {truncated && (
          <p className="text-xs text-muted-foreground">
            Showing the first {MAX_PREVIEW_ROWS.toLocaleString()} of {parsed.rows.length.toLocaleString()}{" "}
            rows. All rows are still validated and imported.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Back
          </Button>
          <Button onClick={onConfirm} disabled={isPending || parsed.valid === 0}>
            {isPending ? "Importing…" : `Confirm import (${parsed.valid} guest${parsed.valid === 1 ? "" : "s"})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function GuestImport({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();
  const [isParsing, setIsParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const handleFile = useCallback((file: File) => {
    setIsParsing(true);
    parseCsv(file).then((result) => {
      setParsed(result);
      setIsParsing(false);
    });
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const csvFile = acceptedFiles[0];
      if (!csvFile) return;
      handleFile(csvFile);
    },
    [handleFile],
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "text/comma-separated-values": [".csv"] },
    multiple: false,
    noClick: false,
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
      const result = outcome.data;
      toast.success(
        `Imported ${result.imported} guest(s), ${result.failed} failed, ` +
          `${result.skippedDuplicates} duplicate(s).`,
      );
      clearFile();
    });
  }

  return (
    <div className="space-y-4">
      {/* CSV template download */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Import guests from a CSV file</p>
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href={CSV_TEMPLATE_PATH} download>
            <Download className="size-3.5" />
            Download template
          </Link>
        </Button>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragActive
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
            : parsed
              ? "border-border/40 bg-muted/20"
              : "border-border/40 hover:border-primary/30 hover:bg-muted/10"
        }`}
      >
        <input {...getInputProps()} />

        {!parsed ? (
          <Empty className="border-0 p-0">
            <EmptyHeader>
              {isDragActive ? (
                <>
                  <EmptyMedia variant="icon">
                    <Upload className="size-5 text-primary" />
                  </EmptyMedia>
                  <EmptyTitle className="text-primary">Drop your CSV here</EmptyTitle>
                  <EmptyDescription>We&apos;ll check every row before importing.</EmptyDescription>
                </>
              ) : isParsing ? (
                <>
                  <EmptyMedia variant="icon">
                    <Upload className="size-5 animate-pulse" />
                  </EmptyMedia>
                  <EmptyTitle>Reading your file…</EmptyTitle>
                  <EmptyDescription>Checking columns and validating each row.</EmptyDescription>
                </>
              ) : (
                <>
                  <EmptyMedia variant="icon">
                    <Upload className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle>Choose a CSV file</EmptyTitle>
                  <EmptyDescription>
                    Drag and drop your file here, or{" "}
                    <button
                      type="button"
                      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        open();
                      }}
                    >
                      browse
                    </button>{" "}
                    to select one. Columns needed: first name, last name, email, phone.
                  </EmptyDescription>
                </>
              )}
            </EmptyHeader>
          </Empty>
        ) : parsed.missingColumns.length > 0 ? (
          <Empty className="border-0 p-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleAlert className="size-5 text-destructive" />
              </EmptyMedia>
              <EmptyTitle className="text-destructive">Missing required columns</EmptyTitle>
              <EmptyDescription>
                This file is missing: {parsed.missingColumns.join(", ")}. Download the template above and
                match its headers.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
              >
                Choose another file
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="flex items-center justify-center">
            <Attachment state="done" size="default" className="max-w-sm">
              <AttachmentMedia>
                <FileText className="size-4" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{parsed.file.name}</AttachmentTitle>
                <AttachmentDescription>
                  {formatFileSize(parsed.file.size)} · {parsed.valid} valid
                  {parsed.warnings > 0 ? `, ${parsed.warnings} warning(s)` : ""}
                  {parsed.errors > 0 ? `, ${parsed.errors} error(s)` : ""}
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  aria-label="Remove file"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                >
                  <X className="size-3.5" />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {parsed && parsed.missingColumns.length === 0 && (
        <div className="flex items-center gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setReviewOpen(true);
            }}
            disabled={isPending || parsed.rows.length === 0}
          >
            <Upload className="size-4" />
            Review {parsed.rows.length.toLocaleString()} row{parsed.rows.length === 1 ? "" : "s"}
          </Button>
          <Button variant="ghost" onClick={clearFile} disabled={isPending}>
            Cancel
          </Button>
        </div>
      )}

      {parsed && parsed.missingColumns.length === 0 && (
        <ReviewDialog
          parsed={parsed}
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          onConfirm={onConfirmImport}
          isPending={isPending}
        />
      )}
    </div>
  );
}
