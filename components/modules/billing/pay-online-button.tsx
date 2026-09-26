"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { checkoutAction } from "@/components/modules/billing/billing.service";
import type { CheckoutTarget } from "@/components/modules/billing/schema";

/**
 * Pays [target] online (JIKU-165): starts the payment, then leaves for the
 * provider's page (Orange Money, MTN MoMo or card). The payer comes back to the
 * return page, which follows the payment until the provider confirms it.
 */
export function PayOnlineButton({
  target,
  disabled,
  size,
}: {
  target: CheckoutTarget;
  disabled?: boolean;
  size?: "default" | "sm";
}) {
  const t = useTranslations("billing.online");
  const [isStarting, start] = useTransition();

  function pay() {
    start(async () => {
      const result = await checkoutAction(target);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      window.location.assign(result.data);
    });
  }

  return (
    <Button size={size} onClick={pay} disabled={disabled || isStarting}>
      <CreditCard />
      {isStarting ? t("starting") : t("pay")}
    </Button>
  );
}
