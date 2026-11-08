import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BirthdayPageDynamic } from "@/components/birthday-page-dynamic";
import { ThemeProvider } from "@/components/theme-provider";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const event = await db.event.findUnique({
    where: { surpriseToken: token },
    select: { personName: true, personPhotoUrl: true },
  });
  if (!event) return { title: "Not Found" };
  const title = `🎉 Happy Birthday, ${event.personName}! — BirthdayDrop`;
  const description = `A special birthday surprise reveal for ${event.personName}!`;
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

export default async function SurprisePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const event = await db.event.findUnique({
    where: { surpriseToken: token },
    include: {
      wishes: { orderBy: { submittedAt: "asc" } },
      audioTracks: { orderBy: { order: "asc" } },
    },
  });

  if (!event) notFound();

  // Filter hidden wishes and sort featured wishes first in JS
  // Guaranteed runtime compatibility across all cached or fresh dev server instances
  const visibleWishes = (event.wishes || [])
    .filter((w: any) => !w.isHidden)
    .sort((a: any, b: any) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return (
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      );
    });

  return (
    <ThemeProvider themeId={event.theme}>
      <BirthdayPageDynamic
        personName={event.personName}
        personPhotoUrl={event.personPhotoUrl}
        birthDate={event.birthDate}
        theme={event.theme}
        celebrationType={event.celebrationType}
        customHeading={event.customHeading}
        flipCards={event.flipCards ?? true}
        audioConfig={
          event.audioConfig as {
            loop: boolean;
            volume: number;
            autoplay: boolean;
          }
        }
        audioTracks={event.audioTracks}
        wishes={visibleWishes.map(
          (w: {
            id: string;
            wisherName: string;
            message: string;
            reactions: unknown;
          }) => ({
            id: w.id,
            wisherName: w.wisherName,
            message: w.message,
            reactions: (w.reactions as Record<string, number>) ?? {},
          }),
        )}
      />
    </ThemeProvider>
  );
}
