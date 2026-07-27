import { Toaster } from "@/components/ui/sonner";

export default function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-900">
      {children}
      <Toaster />
    </div>
  );
}
