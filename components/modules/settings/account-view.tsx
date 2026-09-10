import { UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * The signed-in user's own identity, shown read-only. The backend has no
 * profile update endpoint yet (PUT on the account), so nothing here is
 * editable; the card exists so the page answers "who am I and what can I do"
 * instead of hiding the answer entirely.
 */
export function AccountView({
  fullName,
  email,
  role,
}: {
  fullName: string | null;
  email: string;
  role: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-4" />
            Your account
          </CardTitle>
          <CardDescription>
            How you appear in this organization. Editing your name or email is
            not available yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between gap-4 py-1">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{fullName ?? "Not set"}</span>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{email}</span>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span className="text-muted-foreground">Role in this organization</span>
            <span className="font-medium">{roleLabel(role)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function roleLabel(role: string): string {
  switch (role) {
    case "ORGANIZER_OWNER":
      return "Owner";
    case "ORGANIZER_ADMIN":
      return "Admin";
    case "ORGANIZER_MEMBER":
      return "Member";
    default:
      return role;
  }
}
