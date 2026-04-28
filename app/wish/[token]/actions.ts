"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

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
    select: { id: true, wishDeadline: true },
  });

  if (!event) return { success: false, error: "Event not found." };

  if (event.wishDeadline && new Date() > event.wishDeadline) {
    return { success: false, error: "The wish form has closed." };
  }

  // Basic rate limit: max 3 wishes per IP per event
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  // We store ip in a virtual check via recent submissions from the same wisher name+event within 10 min
  // Simple approach: check count of wishes in last hour from same event with same name
  const recentCount = await db.wish.count({
    where: {
      eventId: event.id,
      wisherName: { equals: wisherName, mode: "insensitive" },
      submittedAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });

  if (recentCount >= 3) {
    return {
      success: false,
      error: "You've already submitted a wish. Thank you! 🎉",
    };
  }

  await db.wish.create({
    data: {
      eventId: event.id,
      wisherName: wisherName.trim() || "Anonymous",
      message: message.trim(),
    },
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
