import { Toaster } from "@/components/ui/sonner";
import { SupportButton } from "@/components/modules/organizer/components/support-button";

export default function OrganizerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      {children}
      <SupportButton />
      <Toaster />
    </div>
  );
}
