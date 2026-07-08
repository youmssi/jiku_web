"use server";

import { redirect } from "next/navigation";
import { publicFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";
import { setAuthCookies, clearAuthCookies, type AuthTokens } from "@/lib/auth";
import { type ActionResult, fail, reportApiError } from "@/lib/action-result";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/components/modules/identity/schema";

export async function registerAction(input: RegisterInput): Promise<ActionResult> {
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
  redirect(ROUTES.DASHBOARD);
}

export async function loginAction(input: LoginInput): Promise<ActionResult> {
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
    return fail(
      response.status === 401
        ? "Invalid email or password."
        : response.status === 429
          ? "Too many attempts. Please wait a moment and try again."
          : "We couldn't sign you in. Please try again.",
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
