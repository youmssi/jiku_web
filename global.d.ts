import type { Messages } from "@/i18n/messages";
import type { GuestLocale } from "@/i18n/routing";

declare module "next-intl" {
  interface AppConfig {
    // Every locale a page can run in; Arabic only on the guest screens (JIKU-292).
    Locale: GuestLocale;
    Messages: Messages;
  }
}
