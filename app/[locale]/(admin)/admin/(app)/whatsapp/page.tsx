import { redirect } from "next/navigation";
import { WhatsAppAdmin } from "@/components/modules/admin";
import type { WhatsAppOverrideStatus, WhatsAppPricingInfo } from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

const INACTIVE_OVERRIDE: WhatsAppOverrideStatus = {
  active: false,
  reason: null,
  activatedBy: null,
  activatedAt: null,
};

export default async function AdminWhatsAppPage() {
  const [pricingResponse, overrideResponse] = await Promise.all([
    adminFetch("/admin/whatsapp/pricing"),
    adminFetch("/admin/whatsapp/content-override"),
  ]);
  if (pricingResponse.status === 401 || pricingResponse.status === 403) redirect(ADMIN_ROUTES.LOGIN);
  const pricing = pricingResponse.ok
    ? ((await pricingResponse.json()) as WhatsAppPricingInfo[])
    : [];
  const override = overrideResponse.ok
    ? ((await overrideResponse.json()) as WhatsAppOverrideStatus)
    : INACTIVE_OVERRIDE;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">WhatsApp</h1>
      <WhatsAppAdmin pricing={pricing} override={override} />
    </div>
  );
}
