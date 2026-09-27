import { z } from "zod";
import type { Schema } from "@/lib/api-contract";

// CONTRACT — the organization's verification (JIKU-175, référentiel métier §9).

export type VerificationOverview = Schema<"VerificationOverview">;
export type VerificationRequest = Schema<"VerificationRequestView">;
export type PhoneStatus = Schema<"PhoneStatusView">;
export type VerificationLimits = Schema<"VerificationLimits">;

export type VerificationKind = "personal" | "company";

/** Documents accepted for each kind; the value is what the backend stores. */
export const DOCUMENT_TYPES = {
  personal: ["NATIONAL_ID", "PASSPORT", "DRIVING_LICENCE", "RESIDENCE_PERMIT"],
  company: ["RCCM_EXTRACT", "ARTICLES", "TAX_CERTIFICATE", "OTHER"],
} as const satisfies Record<VerificationKind, readonly string[]>;

export type DocumentType = (typeof DOCUMENT_TYPES)[VerificationKind][number];

export const phoneSchema = z.object({
  phone: z
    .string()
    .transform((value) => value.replace(/\s+/g, ""))
    .pipe(z.string().regex(/^\+[1-9][0-9]{7,14}$/, "phone")),
});

export type PhoneInput = z.input<typeof phoneSchema>;

export const codeSchema = z.object({
  code: z.string().regex(/^[0-9]{6}$/, "sixDigitCode"),
});

export type CodeInput = z.infer<typeof codeSchema>;

export const submissionSchema = z
  .object({
    kind: z.enum(["personal", "company"]),
    legalName: z.string().trim().min(1, "required").max(200, "tooLong"),
    documentType: z.string().min(1, "required"),
    registrationNumber: z.string().trim().max(80, "tooLong"),
    taxIdentifier: z.string().trim().max(80, "tooLong"),
    files: z.array(z.instanceof(File)).min(1, "attachDocument"),
  })
  .refine((value) => value.kind !== "company" || value.registrationNumber.length > 0, {
    path: ["registrationNumber"],
    message: "required",
  });

export type SubmissionInput = z.infer<typeof submissionSchema>;
