"use server";

import { redirect } from "next/navigation";
import { publicFetch, serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";
import { setAuthCookies, clearAuthCookies, type AuthTokens } from "@/lib/auth";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import {
  createOrgSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type CreateOrgInput,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/components/modules/identity/schema";

/**
 * Only same-origin paths may be used as a post-auth destination — anything else
 * (absolute URLs, protocol-relative `//`) falls back to the dashboard, so a
 * crafted link can never bounce a fresh session to another site.
 */
function safeNext(next: string | undefined, fallback: string): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export async function registerAction(
  input: RegisterInput,
  next?: string,
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please check the form and try again.");
  }
  const response = await publicFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail(
      response.status === 409
        ? "An account with this email already exists."
        : "We couldn't create your account. Please try again.",
    );
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  // A fresh account has no organization yet: onboarding creates the first one.
  redirect(safeNext(next, ROUTES.ONBOARDING));
}

export async function loginAction(input: LoginInput, next?: string): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please check the form and try again.");
  }
  const response = await publicFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    if (response.status !== 401 && response.status !== 429) {
      reportApiError(response);
    }
    if (response.status === 401) {
      // Google-only accounts get the backend's pointer to the right door
      // (ProblemDetail carries the reason in `detail`).
      const body = (await response.json().catch(() => null)) as { detail?: string } | null;
      return fail(body?.detail ?? "Invalid email or password.");
    }
    return fail(
      response.status === 429
        ? "Too many attempts. Please wait a moment and try again."
        : "We couldn't sign you in. Please try again.",
    );
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  // The app layout bounces members with no organization to onboarding.
  redirect(safeNext(next, ROUTES.DASHBOARD));
}

/** Exchanges the Google Identity Services credential for a session (JIKU-51). */
export async function googleLoginAction(idToken: string, next?: string): Promise<ActionResult> {
  const response = await publicFetch("/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) {
    if (response.status !== 401) {
      reportApiError(response);
    }
    return fail(
      response.status === 501
        ? "Google sign-in isn't available right now."
        : "We couldn't sign you in with Google. Please try again.",
    );
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  redirect(safeNext(next, ROUTES.DASHBOARD));
}

export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Enter a valid email address.");
  }
  const response = await publicFetch("/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail(
      response.status === 429
        ? "Too many attempts. Please wait a moment and try again."
        : "Something went wrong. Please try again.",
    );
  }
  // Deliberately identical whether or not the address has an account.
  return ok(null);
}

export async function resetPasswordAction(
  token: string,
  input: ResetPasswordInput,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Password must be at least 8 characters.");
  }
  const response = await publicFetch("/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password: parsed.data.password }),
  });
  if (!response.ok) {
    if (response.status !== 400) {
      reportApiError(response);
    }
    return fail(
      response.status === 400
        ? "This link is invalid or has expired. Request a new one."
        : "Something went wrong. Please try again.",
    );
  }
  return ok(null);
}

export async function verifyEmailAction(token: string): Promise<ActionResult> {
  const response = await publicFetch("/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    if (response.status !== 400) {
      reportApiError(response);
    }
    return fail(
      response.status === 400
        ? "This link is invalid or has expired. Request a new one from the app."
        : "Something went wrong. Please try again.",
    );
  }
  return ok(null);
}

export async function resendVerificationAction(): Promise<ActionResult> {
  const response = await serverFetch("/auth/verify-email/resend", { method: "POST" });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't send the email. Please try again.");
  }
  return ok(null);
}

/** Creates the caller's organization; the returned tokens are already bound to it. */
export async function createOrgAction(input: CreateOrgInput): Promise<ActionResult> {
  const parsed = createOrgSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Organization name is required.");
  }
  const response = await serverFetch("/orgs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    if (response.status !== 403) {
      reportApiError(response);
    }
    return fail(
      response.status === 403
        ? "Verify your email address first, check your inbox for the confirmation link."
        : "We couldn't create the organization. Please try again.",
    );
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  redirect(ROUTES.DASHBOARD);
}

/** Rebinds the session to another organization the user belongs to (JIKU-48). */
export async function switchOrgAction(tenantId: string): Promise<ActionResult> {
  const response = await serverFetch("/auth/switch-org", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tenantId }),
  });
  if (!response.ok) {
    reportApiError(response);
    return fail("We couldn't switch organizations. Please try again.");
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  redirect(ROUTES.DASHBOARD);
}

/** Accepts a member invitation; tokens come back bound to the joined org (JIKU-50). */
export async function acceptInvitationAction(token: string): Promise<ActionResult> {
  const response = await serverFetch("/auth/invitations/accept", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    if (response.status !== 400 && response.status !== 403 && response.status !== 409) {
      reportApiError(response);
    }
    return fail(
      response.status === 400
        ? "This invitation is invalid or has expired. Ask for a new one."
        : response.status === 403
          ? "This invitation was sent to a different email address. Sign in with the invited account."
          : response.status === 409
            ? "You are already a member of this organization."
            : "We couldn't accept the invitation. Please try again.",
    );
  }
  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  redirect(ROUTES.DASHBOARD);
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookies();
  redirect(ROUTES.LOGIN);
}
