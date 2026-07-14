"use client";

import Link from "next/link";
import { useState } from "react";
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
import { PasswordInput } from "@/components/ui/password-input";
import { ROUTES } from "@/lib/constants";
import { resetPasswordAction } from "@/components/modules/identity/identity.service";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/components/modules/identity/schema";

export function ResetPasswordForm({ token }: { token: string }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { password: "" },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null);
    const result = await resetPasswordAction(token, values);
    if (result.ok) {
      setDone(true);
    } else {
      setFormError(result.error);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Choose a new password</CardTitle>
          <CardDescription>Signed links work once and expire quickly.</CardDescription>
        </CardHeader>
        {done ? (
          <CardContent className="flex flex-col gap-4">
            <Alert>
              <AlertTitle>Password updated</AlertTitle>
              <AlertDescription>You can sign in with your new password now.</AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link href={ROUTES.LOGIN}>Go to sign in</Link>
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-(--card-spacing)">
            <CardContent>
              <FieldGroup>
                {formError ? (
                  <Alert variant="destructive">
                    <AlertTitle>We couldn&apos;t reset your password</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                ) : null}
                <Controller
                  control={control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                      <PasswordInput
                        {...field}
                        id={field.name}
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldDescription>At least 8 characters.</FieldDescription>
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Updating…" : "Update password"}
              </Button>
              <FieldDescription className="text-center">
                Link expired? <Link href={ROUTES.FORGOT_PASSWORD}>Request a new one</Link>
              </FieldDescription>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
