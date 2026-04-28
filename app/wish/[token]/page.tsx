import { getWishFormData } from "./actions";
import { WishForm } from "@/components/wish-form";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const event = await getWishFormData(token);
  if (!event) return { title: "Not Found" };
  return {
    title: `Leave a wish for ${event.personName} 🎂 — BirthdayDrop`,
    description:
      event.teaserMessage ||
      `Submit your birthday wish for ${event.personName}!`,
  };
}

export default async function WishPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const event = await getWishFormData(token);
  if (!event) notFound();

  const isExpired = event.wishDeadline
    ? new Date() > event.wishDeadline
    : false;

  return (
    <WishForm
      token={token}
      personName={event.personName}
      birthDate={event.birthDate}
      teaserMessage={event.teaserMessage}
      allowAnonymous={event.allowAnonymous}
      wishCount={event._count.wishes}
      isExpired={isExpired}
    />
  );
}
