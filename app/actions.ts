"use server";

import { db } from "@/lib/db";
import { Prisma } from "../app/generated/prisma/client";
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

/** Normalise any server/DB error into a safe user-facing string. */
function safeErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return "Something went wrong. Please try again.";

  const msg = err.message.toLowerCase();

  // Network / DB unreachable
  if (
    msg.includes("can't reach") ||
    msg.includes("connect") ||
    msg.includes("econnrefused") ||
    msg.includes("etimedout") ||
    msg.includes("network") ||
    msg.includes("fetch failed")
  ) {
    return "Unable to reach the server right now. Please check your connection and try again.";
  }

  // Prisma known-request errors (constraint violations, etc.)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002")
      return "A surprise with those details already exists.";
    return "Database error. Please try again.";
  }

  // Prisma initialisation errors (bad URL, misconfiguration)
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return "Service is temporarily unavailable. Please try again shortly.";
  }

  return "Something went wrong. Please try again.";
}

export async function createEvent(
  input: CreateEventInput,
): Promise<{ eventId: string; wishToken: string; surpriseToken: string }> {
  try {
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
        order: -1,
      });
      tracksToCreate.forEach((t) => {
        if (t.order >= 0) t.isDefault = false;
      });
    }

    await db.audioTrack.createMany({ data: tracksToCreate });

    return { eventId: event.id, wishToken, surpriseToken };
  } catch (err) {
    // Re-throw a safe, user-facing error — never expose internals
    throw new Error(safeErrorMessage(err));
  }
}

export async function verifyAdminPassword(eventId: string, password: string) {
  try {
    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event) return false;
    return bcrypt.compare(password, event.adminPasswordHash);
  } catch {
    return false;
  }
}

export async function getAdminEvent(eventId: string) {
  return db.event.findUnique({
    where: { id: eventId },
    include: {
      wishes: { orderBy: { submittedAt: "desc" }, take: 15 },
      audioTracks: { orderBy: { order: "asc" } },
      _count: { select: { wishes: true } },
    },
  });
}

export async function getAdminWishesPage(eventId: string, cursor: string) {
  return db.wish.findMany({
    where: { eventId },
    orderBy: { submittedAt: "desc" },
    take: 15,
    skip: 1,
    cursor: { id: cursor },
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
    audioConfig: Prisma.InputJsonValue;
  }>,
) {
  try {
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
        ...(data.audioConfig !== undefined && {
          audioConfig: data.audioConfig as Prisma.InputJsonValue,
        }),
      },
    });
    revalidatePath(`/admin/${eventId}`);
  } catch (err) {
    throw new Error(safeErrorMessage(err));
  }
}
