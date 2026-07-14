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
  memberships: Membership[];
};

export type Branding = Schema<"BrandingResponse">;

/** Registration creates the account only; the organization comes at onboarding. */
export const registerSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const createOrgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;

/** What the public invitation preview endpoint returns (JIKU-50). */
export interface InvitationPreview {
  organizationName: string;
  email: string;
  role: string;
}
