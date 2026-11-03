"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { guestRouting, LOCALE_LABELS, localeDirection } from "@/i18n/routing";

/**
 * The guest screens' language choice (JIKU-292): French, English and Arabic,
 * each written in its own language so a reader finds theirs without reading
 * the others. The page and its query (the share tag, a booking step) stay the
 * same; next-intl remembers the choice for the guest's next link.
 */
export function GuestLocaleSwitch() {
    return (
        <Suspense fallback={<Switch query="" />}>
            <SwitchWithQuery />
        </Suspense>
    );
}

function SwitchWithQuery() {
    return <Switch query={useSearchParams().toString()} />;
}

function Switch({ query }: { query: string }) {
    const t = useTranslations("guest.languages");
    const locale = useLocale();
    const pathname = usePathname();
    const href = query ? `${pathname}?${query}` : pathname;
    return (
        <nav aria-label={t("label")} className="flex flex-wrap items-center justify-center gap-1 py-4">
            {guestRouting.locales.map((target) => {
                const current = target === locale;
                return (
                    <Button key={target} asChild size="sm" variant={current ? "secondary" : "ghost"} className="max-md:h-11">
                        <Link
                            href={href}
                            locale={target}
                            lang={target}
                            dir={localeDirection(target)}
                            hrefLang={target}
                            aria-current={current ? "page" : undefined}
                        >
                            {LOCALE_LABELS[target]}
                        </Link>
                    </Button>
                );
            })}
        </nav>
    );
}
