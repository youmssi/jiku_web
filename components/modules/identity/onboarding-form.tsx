"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createOrgAction,
  logoutAction,
  resendVerificationAction,
} from "@/components/modules/identity/identity.service";
import { createOrgSchema, type CreateOrgInput } from "@/components/modules/identity/schema";
import { ROUTES } from "@/lib/constants";

/**
 * First-run onboarding (JIKU-52): the account exists, the organization doesn't.
 * A 403 from org creation means the email isn't verified yet — the resend
 * affordance lives right next to the error it fixes.
 *
 * `canCancel` is true when the account already runs at least one organization
 * (reached via the account menu's "New organization" entry) — those visitors
 * need a way back to where they were instead of being stranded here.
 */
export function OnboardingForm({ email, canCancel }: { email: string; canCancel: boolean }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateOrgInput>({
    resolver: zodResolver(createOrgSchema),
    mode: "onTouched",
    defaultValues: { name: "" },
  });

  async function onSubmit(values: CreateOrgInput) {
    setFormError(null);
    const result = await createOrgAction(values);
    if (result && !result.ok) {
      setFormError(result.error);
    }
  }

  async function resend() {
    setResent(false);
    const result = await resendVerificationAction();
    if (result.ok) {
      setResent(true);
    } else {
      setFormError(result.error);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create your organization</CardTitle>
          <CardDescription>
            Signed in as {email}. Name the organization your events will live under,
            you can invite your team right after.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-(--card-spacing)">
          <CardContent>
            <FieldGroup>
              {formError ? (
                <Alert variant="destructive">
                  <AlertTitle>Not yet</AlertTitle>
                  <AlertDescription className="flex flex-col gap-2">
                    {formError}
                    <Button type="button" variant="outline" size="sm" onClick={resend}>
                      Resend verification email
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}
              {resent ? (
                <Alert>
                  <AlertTitle>Email sent</AlertTitle>
                  <AlertDescription>
                    Check your inbox and open the verification link, then come back here.
                  </AlertDescription>
                </Alert>
              ) : null}
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Organization name</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="organization"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create organization"}
            </Button>
            {canCancel ? (
              <Button asChild type="button" variant="outline" className="w-full">
                <Link href={ROUTES.DASHBOARD}>Cancel</Link>
              </Button>
            ) : null}
            <FieldDescription className="text-center">
              Wrong account?{" "}
              <button type="button" className="underline" onClick={() => void logoutAction()}>
                Sign out
              </button>
            </FieldDescription>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
