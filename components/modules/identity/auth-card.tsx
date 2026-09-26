import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * The card every account screen renders inside the auth layout, after the
 * shadcn login-03 block: a centered title and description over the content.
 * Forms put their submit button and the link to the sibling screen at the end
 * of their `FieldGroup`, so the whole flow keeps one rhythm.
 */
export function AuthCard({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
