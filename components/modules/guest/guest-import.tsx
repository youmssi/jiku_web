"use client";

import { useId, useRef, useState, useTransition, type DragEvent } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { importGuestsAction } from "@/components/modules/guest/guest.service";

function isCsv(file: File): boolean {
  return file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function GuestImport({ eventId }: { eventId: string }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  function selectFile(candidate: File | undefined) {
    if (!candidate) return;
    if (!isCsv(candidate)) {
      toast.error("Please choose a .csv file.");
      return;
    }
    setFile(candidate);
  }

  function clearFile() {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  function onImport() {
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    startTransition(async () => {
      const outcome = await importGuestsAction(eventId, body);
      if (!outcome.ok) {
        toast.error(outcome.error);
        return;
      }
      const result = outcome.data;
      toast.success(
        `Imported ${result.imported} guest(s) — ${result.failed} failed, ` +
          `${result.skippedDuplicates} duplicate(s).`,
      );
      clearFile();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-input hover:border-primary/60 hover:bg-accent/40",
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UploadCloud className="size-5" />
        </span>
        <span className="text-sm font-medium">
          Drag a CSV here, or click to browse
        </span>
        <span className="text-xs text-muted-foreground">
          Columns: firstName, lastName, email, phone
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
      </label>

      {file ? (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <FileText className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearFile}
            disabled={isPending}
            aria-label="Remove file"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : null}

      <div>
        <Button type="button" onClick={onImport} disabled={!file || isPending}>
          {isPending ? "Importing…" : "Import CSV"}
        </Button>
      </div>
    </div>
  );
}
