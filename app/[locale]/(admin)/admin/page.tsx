import { localeRedirect } from "@/i18n/redirect";
import { ADMIN_ROUTES } from "@/lib/constants";

export default function AdminIndexPage() {
  return localeRedirect(ADMIN_ROUTES.TENANTS);
}
