"use server";

import { db } from "@/lib/db";
import { Prisma } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/tokens";
import { DEFAULT_AUDIO_TRACKS } from "@/lib/themes";
import { revalidatePath } from "next/cache";
import { getSafeErrorInfo } from "@/lib/errors";

export interface CreateEventInput {
  personName: string;
  personPhotoUrl?: string;
  birthDate: string;
  theme: string;
  celebrationType?: string;
  customHeading?: string;
  flipCards?: boolean;
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

export type ActionResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true } & T)
  | { ok: false; error: string; isSystemError?: boolean };

export async function createEvent(
  input: CreateEventInput,
): Promise<
  ActionResult<{ eventId: string; wishToken: string; surpriseToken: string }>
> {
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
        celebrationType: input.celebrationType || "family",
        customHeading: input.customHeading || null,
        flipCards: input.flipCards ?? true,
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

    return { ok: true, eventId: event.id, wishToken, surpriseToken };
  } catch (err) {
    console.error("createEvent error:", err);
    const info = getSafeErrorInfo(err);
    return {
      ok: false,
      error: info.message,
      isSystemError: info.isSystemError,
    };
  }
}

export async function verifyAdminPassword(
  eventId: string,
  password: string,
): Promise<ActionResult> {
  try {
    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return {
        ok: false,
        error: "Event not found. Please check your admin link.",
        isSystemError: false,
      };
    }

    const matches = await bcrypt.compare(password, event.adminPasswordHash);
    if (!matches) {
      return {
        ok: false,
        error: "Incorrect password. Try again.",
        isSystemError: false,
      };
    }

    return { ok: true };
  } catch (err) {
    console.error("verifyAdminPassword error:", err);
    const info = getSafeErrorInfo(err);
    return {
      ok: false,
      error: info.message,
      isSystemError: info.isSystemError,
    };
  }
}

export async function getAdminEvent(eventId: string) {
  try {
    const data = await db.event.findUnique({
      where: { id: eventId },
      include: {
        wishes: { orderBy: { submittedAt: "desc" }, take: 15 },
        audioTracks: { orderBy: { order: "asc" } },
        _count: { select: { wishes: true } },
      },
    });
    return { ok: true as const, data };
  } catch (err) {
    console.error("getAdminEvent error:", err);
    const info = getSafeErrorInfo(err);
    return {
      ok: false as const,
      error: info.message,
      isSystemError: info.isSystemError,
    };
  }
}

export async function getAdminWishesPage(eventId: string, cursor: string) {
  try {
    const data = await db.wish.findMany({
      where: { eventId },
      orderBy: { submittedAt: "desc" },
      take: 15,
      skip: 1,
      cursor: { id: cursor },
    });
    return { ok: true as const, data };
  } catch (err) {
    console.error("getAdminWishesPage error:", err);
    const info = getSafeErrorInfo(err);
    return {
      ok: false as const,
      error: info.message,
      isSystemError: info.isSystemError,
    };
  }
}

export async function deleteWish(wishId: string): Promise<ActionResult> {
  try {
    await db.wish.delete({ where: { id: wishId } });
    revalidatePath("/admin/[eventId]");
    revalidatePath("/surprise/[token]");
    return { ok: true };
  } catch (err) {
    console.error("deleteWish error:", err);
    const info = getSafeErrorInfo(err);
    return {
      ok: false,
      error: info.message,
      isSystemError: info.isSystemError,
    };
  }
}

export async function toggleWishVisibility(
  wishId: string,
  isHidden: boolean,
): Promise<ActionResult> {
  try {
    try {
      await db.wish.update({
        where: { id: wishId },
        data: { isHidden },
      });
    } catch (_) {
      await db.$executeRawUnsafe(
        `UPDATE "Wish" SET "isHidden" = $1 WHERE "id" = $2`,
        isHidden,
        wishId,
      );
    }
    revalidatePath("/admin/[eventId]");
    revalidatePath("/surprise/[token]");
    return { ok: true };
  } catch (err) {
    console.error("toggleWishVisibility error:", err);
    const info = getSafeErrorInfo(err);
    return {
      ok: false,
      error: info.message,
      isSystemError: info.isSystemError,
    };
  }
}

export async function toggleWishFeatured(
  wishId: string,
  isFeatured: boolean,
): Promise<ActionResult> {
  try {
    try {
      await db.wish.update({
        where: { id: wishId },
        data: { isFeatured },
      });
    } catch (_) {
      await db.$executeRawUnsafe(
        `UPDATE "Wish" SET "isFeatured" = $1 WHERE "id" = $2`,
        isFeatured,
        wishId,
      );
    }
    revalidatePath("/admin/[eventId]");
    revalidatePath("/surprise/[token]");
    return { ok: true };
  } catch (err) {
    console.error("toggleWishFeatured error:", err);
    const info = getSafeErrorInfo(err);
    return {
      ok: false,
      error: info.message,
      isSystemError: info.isSystemError,
    };
  }
}

export async function updateEvent(
  eventId: string,
  data: Partial<{
    personName: string;
    birthDate: string;
    theme: string;
    celebrationType: string;
    customHeading: string | null;
    flipCards: boolean;
    wishDeadline: string | null;
    allowAnonymous: boolean;
    teaserMessage: string;
    audioConfig: Prisma.InputJsonValue;
  }>,
): Promise<ActionResult> {
  try {
    await db.event.update({
      where: { id: eventId },
      data: {
        ...(data.personName !== undefined && { personName: data.personName }),
        ...(data.birthDate !== undefined && { birthDate: data.birthDate }),
        ...(data.theme !== undefined && { theme: data.theme }),
        ...(data.celebrationType !== undefined && {
          celebrationType: data.celebrationType,
        }),
        ...(data.customHeading !== undefined && {
          customHeading: data.customHeading,
        }),
        ...(data.flipCards !== undefined && { flipCards: data.flipCards }),
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
    return { ok: true };
  } catch (err) {
    console.error("updateEvent error:", err);
    const info = getSafeErrorInfo(err);
    return {
      ok: false,
      error: info.message,
      isSystemError: info.isSystemError,
    };
  }
}
