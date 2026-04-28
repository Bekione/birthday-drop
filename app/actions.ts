"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/tokens";
import { DEFAULT_AUDIO_TRACKS } from "@/lib/themes";
import { revalidatePath } from "next/cache";

export interface CreateEventInput {
  personName: string;
  personPhotoUrl?: string;
  birthDate: string;
  theme: string;
  audioConfig: {
    selectedTrackId?: string;
    loop: boolean;
    volume: number;
    autoplay: boolean;
  };
  customTrackUrl?: string;
  customTrackTitle?: string;
  adminPassword: string;
  wishDeadline?: string;
  allowAnonymous: boolean;
  teaserMessage?: string;
}

export async function createEvent(input: CreateEventInput) {
  const adminPasswordHash = await bcrypt.hash(input.adminPassword, 10);
  const wishToken = generateToken();
  const surpriseToken = generateToken();

  const event = await db.event.create({
    data: {
      personName: input.personName,
      personPhotoUrl: input.personPhotoUrl || null,
      birthDate: input.birthDate,
      wishToken,
      surpriseToken,
      theme: input.theme,
      audioConfig: input.audioConfig,
      adminPasswordHash,
      wishDeadline: input.wishDeadline ? new Date(input.wishDeadline) : null,
      allowAnonymous: input.allowAnonymous,
      teaserMessage: input.teaserMessage || null,
    },
  });

  // Create default audio tracks for this event
  const tracksToCreate = DEFAULT_AUDIO_TRACKS.map((t) => ({
    eventId: event.id,
    title: t.title,
    url: t.url,
    isDefault:
      input.audioConfig.selectedTrackId === t.id ||
      (t.isDefault && !input.audioConfig.selectedTrackId),
    order: t.order,
  }));

  // Add custom track if provided
  if (input.customTrackUrl && input.customTrackTitle) {
    tracksToCreate.push({
      eventId: event.id,
      title: input.customTrackTitle,
      url: input.customTrackUrl,
      isDefault: true,
      order: -1, // custom track plays first
    });
    // Make others non-default
    tracksToCreate.forEach((t) => {
      if (t.order >= 0) t.isDefault = false;
    });
  }

  await db.audioTrack.createMany({ data: tracksToCreate });

  return { eventId: event.id, wishToken, surpriseToken };
}

export async function verifyAdminPassword(eventId: string, password: string) {
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) return false;
  return bcrypt.compare(password, event.adminPasswordHash);
}

export async function getAdminEvent(eventId: string) {
  return db.event.findUnique({
    where: { id: eventId },
    include: {
      wishes: { orderBy: { submittedAt: "desc" } },
      audioTracks: { orderBy: { order: "asc" } },
    },
  });
}

export async function deleteWish(wishId: string) {
  await db.wish.delete({ where: { id: wishId } });
  revalidatePath("/admin/[eventId]");
}

export async function updateEvent(
  eventId: string,
  data: Partial<{
    personName: string;
    birthDate: string;
    theme: string;
    wishDeadline: string | null;
    allowAnonymous: boolean;
    teaserMessage: string;
    audioConfig: Record<string, unknown>;
  }>,
) {
  await db.event.update({
    where: { id: eventId },
    data: {
      ...(data.personName !== undefined && { personName: data.personName }),
      ...(data.birthDate !== undefined && { birthDate: data.birthDate }),
      ...(data.theme !== undefined && { theme: data.theme }),
      ...(data.wishDeadline !== undefined && {
        wishDeadline: data.wishDeadline ? new Date(data.wishDeadline) : null,
      }),
      ...(data.allowAnonymous !== undefined && {
        allowAnonymous: data.allowAnonymous,
      }),
      ...(data.teaserMessage !== undefined && {
        teaserMessage: data.teaserMessage,
      }),
      ...(data.audioConfig !== undefined && { audioConfig: data.audioConfig }),
    },
  });
  revalidatePath(`/admin/${eventId}`);
}
