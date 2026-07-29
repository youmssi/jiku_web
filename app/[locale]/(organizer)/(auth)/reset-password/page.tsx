import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/modules/identity";
import { ROUTES } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Readonly<PageProps>) {
  const { token } = await searchParams;
  if (!token) {
    redirect(ROUTES.FORGOT_PASSWORD);
  }
  return <ResetPasswordForm token={token} />;
}
