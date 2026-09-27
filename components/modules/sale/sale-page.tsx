import { getLocale, getTranslations } from "next-intl/server";
import { CalendarDays, MapPin } from "lucide-react";
import { StateMessage, VerifiedBadge } from "@/components/shared";
import { formatEventDay, formatEventTime } from "@/lib/datetime";
import { CheckoutForm } from "./checkout-form";
import type { PublicSale } from "./schema";

/**
 * The public sale page of an event (JIKU-177): who organizes it, when and
 * where, and the tickets on sale. When the sale is closed it says why in the
 * client's terms, never in the organizer's.
 */
export async function SalePage({ sale, username }: { sale: PublicSale; username: string }) {
  const [t, locale] = await Promise.all([getTranslations("guest.sale"), getLocale()]);
  const zone = sale.eventTimezone;
  const when =
    sale.eventStart && zone ? `${formatEventDay(sale.eventStart, zone, locale)} · ${formatEventTime(sale.eventStart, zone, locale)}` : null;

  return (
    <div className="flex flex-1 justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <header className="mb-8 text-center">
          {sale.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sale.logoUrl} alt={sale.organizerName} className="mx-auto mb-4 h-12 object-contain" />
          ) : null}
          <p className="text-sm text-muted-foreground">{t("organizedBy", { organizer: sale.organizerName })}</p>
          <VerifiedBadge kind={sale.organizerVerification} className="mt-2" />
          <h1 className="mt-2 text-balance text-2xl font-semibold">{sale.eventName}</h1>
          <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {when ? (
              <p className="flex items-center justify-center gap-1.5">
                <CalendarDays aria-hidden className="size-4 shrink-0" />
                <span className="first-letter:uppercase">{when}</span>
              </p>
            ) : null}
            {sale.eventLocation ? (
              <p className="flex items-center justify-center gap-1.5">
                <MapPin aria-hidden className="size-4 shrink-0" />
                {sale.eventLocation}
              </p>
            ) : null}
          </div>
        </header>

        {sale.onSale ? (
          <CheckoutForm sale={sale} username={username} />
        ) : (
          <StateMessage
            title={t("closedTitle")}
            description={t(`closed.${sale.closedReason ?? "NOTHING_FOR_SALE"}`)}
          />
        )}
      </div>
    </div>
  );
}
