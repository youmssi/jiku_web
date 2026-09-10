import { LoginForm } from "@/components/modules/identity";

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

/**
 * Sign-in page styled after the shadcn login-03 template: muted canvas with the
 * centered max-w-sm column. The auth layout above supplies the brand header.
 */
export default async function LoginPage({ searchParams }: Readonly<PageProps>) {
  const { next } = await searchParams;
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
