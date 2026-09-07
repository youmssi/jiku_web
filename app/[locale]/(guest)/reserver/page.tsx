import type { Metadata } from "next";
import { ReservationForm } from "@/components/modules/booking";

export const metadata: Metadata = {
  title: "Réservez votre date — Jikū",
  description: "Bloquez votre date de mariage, baptême ou événement avec un acompte de 30 %.",
};

export default async function ReservePage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ src?: string; guests?: string }> }>) {
  const { src, guests } = await searchParams;
  const parsedGuests = Number(guests);
  const initialGuestCount = Number.isFinite(parsedGuests) && parsedGuests >= 1 ? Math.trunc(parsedGuests) : undefined;
  return <ReservationForm acquisitionSource={src ?? null} initialGuestCount={initialGuestCount} />;
}
