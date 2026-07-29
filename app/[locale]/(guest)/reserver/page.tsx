import type { Metadata } from "next";
import { ReservationForm } from "@/components/modules/booking";

export const metadata: Metadata = {
  title: "Réservez votre date — Jikū",
  description: "Bloquez votre date de mariage, baptême ou événement avec un acompte de 30 %.",
};

export default async function ReservePage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ src?: string }> }>) {
  const { src } = await searchParams;
  return <ReservationForm acquisitionSource={src ?? null} />;
}
