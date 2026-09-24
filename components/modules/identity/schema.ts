import { z } from "zod";
import type { Schema } from "@/lib/api-contract";

/** One organization the user belongs to (backend MembershipView, JIKU-48). */
export interface Membership {
  tenantId: string;
  tenantName: string;
  role: string;
}

/**
 * Signed-in user identity. The generated MeResponse predates the membership
 * model; the intersection adds the JIKU-48 fields until the OpenAPI snapshot is
 * regenerated (see openapi/README.md).
 */
export type CurrentUser = Schema<"MeResponse"> & {
  email: string;
  /** The person's display name; null for accounts that never provided one. */
  fullName: string | null;
  memberships: Membership[];
};

export type Branding = Schema<"BrandingResponse">;

// Validation messages are `common.validation` keys, translated where they render
// (FormFieldError), so these schemas serve the forms and the server actions alike.

/** Registration creates the account only; the organization comes at onboarding. */
export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "required")
    .max(255, "tooLong"),
  email: z.string().email("email"),
  password: z.string().min(8, "passwordMin"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("email"),
  password: z.string().min(1, "required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("email"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "passwordMin"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const createOrgSchema = z.object({
  name: z.string().trim().min(1, "required").max(255, "tooLong"),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;

/** What the public invitation preview endpoint returns (JIKU-50). */
export interface InvitationPreview {
  organizationName: string;
  email: string;
  role: string;
}
