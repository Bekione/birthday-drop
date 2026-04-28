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
    select: { personName: true },
  });
  if (!event) return { title: "Not Found" };
  return {
    title: `🎉 Happy Birthday, ${event.personName}! — BirthdayDrop`,
    description: `A special birthday surprise for ${event.personName}!`,
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

  return (
    <ThemeProvider themeId={event.theme}>
      <BirthdayPageDynamic
        personName={event.personName}
        personPhotoUrl={event.personPhotoUrl}
        birthDate={event.birthDate}
        theme={event.theme}
        audioConfig={
          event.audioConfig as {
            loop: boolean;
            volume: number;
            autoplay: boolean;
          }
        }
        audioTracks={event.audioTracks}
        wishes={event.wishes.map(
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
