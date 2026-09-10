import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { loadPublicOrg } from "@/lib/public-org";

export const metadata: Metadata = { robots: { index: true, follow: true } };

/**
 * La page publique d'une organisation (sa carte de visite découverte) : nom,
 * logo et les services réservables par lien court. Un visiteur clique sur un
 * service et atterrit sur sa page de réservation, sans compte.
 */
export default async function PublicOrgPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; username: string }> }>) {
  const { username } = await params;
  const profile = await loadPublicOrg(username);
  if (!profile) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <header className="mb-8 flex items-center gap-3">
        {profile.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.logoUrl}
            alt={profile.organizationName}
            className="size-12 rounded-xl object-cover"
          />
        ) : (
          <span
            className="flex size-12 items-center justify-center rounded-xl text-lg font-bold text-white"
            style={{ backgroundColor: profile.primaryColor }}
          >
            {profile.organizationName.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{profile.organizationName}</h1>
          <p className="text-sm text-muted-foreground">Book an appointment</p>
        </div>
      </header>

      {profile.services.length === 0 ? (
        <Empty className="py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ArrowRight />
            </EmptyMedia>
            <EmptyTitle>No services to book yet</EmptyTitle>
            <EmptyDescription>
              This organization has not published any bookable services.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {profile.services.map((service) => (
            <li key={service.serviceId}>
              <Link
                href={`/r/${service.shortCode}`}
                className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted"
              >
                <span className="font-medium">{service.name}</span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  Book
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
