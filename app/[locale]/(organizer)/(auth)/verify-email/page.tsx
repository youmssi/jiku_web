import { VerifyEmailView } from "@/components/modules/identity";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Readonly<PageProps>) {
  const { token } = await searchParams;
  return <VerifyEmailView token={token ?? null} />;
}
