"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

/** Each label is written in the language it leads to. */
const SWITCH_LABELS: Record<Locale, string> = {
    fr: "Lire cette page en français",
    en: "Read this page in English",
};

interface LocaleSwitchProps {
    className?: string;
}

/**
 * A link to the same page in the other language, for screens whose path is
 * only known on the client (the account screens share one layout). The query
 * string is kept, so a sign-in reached from a protected page still returns
 * there. The marketing pages know their path on the server and render their
 * own link.
 */
export function LocaleSwitch({ className }: LocaleSwitchProps) {
    return (
        <Suspense fallback={<SwitchLink className={className} query="" />}>
            <SwitchLinkWithQuery className={className} />
        </Suspense>
    );
}

function SwitchLinkWithQuery({ className }: LocaleSwitchProps) {
    const query = useSearchParams().toString();
    return <SwitchLink className={className} query={query} />;
}

function SwitchLink({ className, query }: LocaleSwitchProps & { query: string }) {
    const locale = useLocale();
    const pathname = usePathname();
    const target: Locale = locale === "en" ? "fr" : "en";
    return (
        <Link
            href={query ? `${pathname}?${query}` : pathname}
            locale={target}
            lang={target}
            aria-label={SWITCH_LABELS[target]}
            className={className}
        >
            {target.toUpperCase()}
        </Link>
    );
}
