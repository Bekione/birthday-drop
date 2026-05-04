"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";

export async function getWishFormData(token: string) {
  return db.event.findUnique({
    where: { wishToken: token },
    select: {
      id: true,
      personName: true,
      birthDate: true,
      wishDeadline: true,
      allowAnonymous: true,
      teaserMessage: true,
      _count: { select: { wishes: true } },
    },
  });
}

export async function submitWish(
  token: string,
  wisherName: string,
  message: string,
) {
  const event = await db.event.findUnique({
    where: { wishToken: token },
    select: { id: true, wishDeadline: true, birthDate: true },
  });

  if (!event) return { success: false, error: "Event not found." };

  // First check specific deadline, fallback to birthDate
  const isExpired = event.wishDeadline
    ? new Date() > event.wishDeadline
    : new Date() > new Date(event.birthDate);

  if (isExpired) {
    return { success: false, error: "The wish form has closed." };
  }

  // Rate limitter using high-security cookies.
  // People changing `wisherName` no longer bypasses this limit.
  const cookieStore = await cookies();
  const limitKey = `bd_wishes_${event.id}`;
  const currentCount = parseInt(cookieStore.get(limitKey)?.value || "0", 10);

  if (currentCount >= 3) {
    return {
      success: false,
      error:
        "You've reached the maximum number of wishes allowed from this device.",
    };
  }

  await db.wish.create({
    data: {
      eventId: event.id,
      wisherName: wisherName.trim() || "Anonymous",
      message: message.trim(),
    },
  });

  cookieStore.set(limitKey, (currentCount + 1).toString(), {
    expires:
      event.wishDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  revalidatePath(`/wish/${token}`);
  return { success: true };
}

export async function addReaction(wishId: string, emoji: string) {
  const wish = await db.wish.findUnique({ where: { id: wishId } });
  if (!wish) return;

  const reactions = (wish.reactions as Record<string, number>) ?? {};
  reactions[emoji] = (reactions[emoji] ?? 0) + 1;

  await db.wish.update({ where: { id: wishId }, data: { reactions } });
}
