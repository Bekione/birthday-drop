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

  const title = `Secret Birthday Wish for ${event.personName} 🎂 — BirthdayDrop`;
  const description =
    event.teaserMessage ||
    `We're secretly collecting birthday wishes and memories for ${event.personName}'s birthday! Add yours before the surprise reveal.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
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
    : new Date() > new Date(event.birthDate);

  return (
    <WishForm
      token={token}
      personName={event.personName}
      personPhotoUrl={event.personPhotoUrl}
      birthDate={event.birthDate}
      celebrationType={event.celebrationType}
      customHeading={event.customHeading}
      teaserMessage={event.teaserMessage}
      allowAnonymous={event.allowAnonymous}
      wishCount={event._count.wishes}
      isExpired={isExpired}
      wishDeadline={event.wishDeadline ? event.wishDeadline.toISOString() : null}
    />
  );
}
