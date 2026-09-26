import { LoginForm } from "@/components/modules/identity";

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: Readonly<PageProps>) {
  const { next } = await searchParams;
  return <LoginForm next={next} />;
}
