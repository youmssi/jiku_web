import { GuestLocaleSwitch } from "@/components/shared/guest-locale-switch";

/** A client's booking and queue pages read in French, English or Arabic (JIKU-292). */
export default function ClientPagesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <GuestLocaleSwitch />
    </>
  );
}
