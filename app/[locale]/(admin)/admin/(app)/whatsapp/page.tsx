import { redirect } from "next/navigation";
import { WhatsAppAdmin } from "@/components/modules/admin";
import type { WhatsAppOverrideStatus, WhatsAppPricingInfo } from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

export default async function AdminWhatsAppPage() {
  const [pricingResponse, overrideResponse] = await Promise.all([
    adminFetch("/admin/whatsapp/pricing"),
    adminFetch("/admin/whatsapp/content-override"),
  ]);
  if (pricingResponse.status === 401 || pricingResponse.status === 403) redirect(ADMIN_ROUTES.LOGIN);
  const pricing = (await pricingResponse.json()) as WhatsAppPricingInfo[];
  const override = (await overrideResponse.json()) as WhatsAppOverrideStatus;
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">WhatsApp</h1>
      <WhatsAppAdmin pricing={pricing} override={override} />
    </div>
  );
}