import { RegisterForm } from "@/components/modules/identity";

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const { next } = await searchParams;
  return <RegisterForm next={next} />;
}
