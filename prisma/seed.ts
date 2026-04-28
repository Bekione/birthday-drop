import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding demo event (Mohammed)...");

  const adminPasswordHash = await bcrypt.hash("demo1234", 10);

  const event = await db.event.upsert({
    where: { wishToken: "00000000-demo-wish-0000-000000000000" },
    update: {},
    create: {
      personName: "Mohammed",
      birthDate: "Aug 10, 2025",
      personPhotoUrl: null,
      wishToken: "00000000-demo-wish-0000-000000000000",
      surpriseToken: "00000000-demo-surp-0000-000000000000",
      theme: "confetti",
      audioConfig: { loop: true, volume: 0.7, autoplay: false },
      adminPasswordHash,
      allowAnonymous: true,
      teaserMessage: "Leave a warm birthday wish for our boss! 🎂",
    },
  });

  // Seed wishes
  const wishes = [
    {
      wisherName: "Elshaday",
      message: "May this year bring you good vibes and good money only ✨🫶",
    },
    {
      wisherName: "Raniya",
      message:
        "Wishing you a year filled with remarkable achievements and joyful moments!",
    },
    {
      wisherName: "Melat",
      message:
        "Hope your day is as inspiring and extraordinary as your leadership!",
    },
    {
      wisherName: "Bereket L.",
      message:
        "Thank you for your guidance — wishing you another year of success!",
    },
    {
      wisherName: "Etsub",
      message: "May your special day be filled with laughter, happiness!",
    },
    {
      wisherName: "Bereket K.",
      message: "Wishing you endless success, health, and blessings in life!",
    },
    {
      wisherName: "Wengel",
      message:
        "May every goal you set this year be achieved with grace and excellence!",
    },
    {
      wisherName: "Wisam",
      message:
        "May your day be filled with joy and the year ahead with exciting opportunities!",
    },
    {
      wisherName: "Anonymous",
      message:
        "Wishing you a wonderful birthday and a year ahead full of growth and happiness!",
    },
  ];

  // Delete existing wishes for this event, then re-seed
  await db.wish.deleteMany({ where: { eventId: event.id } });
  await db.wish.createMany({
    data: wishes.map((w) => ({ ...w, eventId: event.id })),
  });

  // Seed audio tracks
  await db.audioTrack.deleteMany({ where: { eventId: event.id } });
  await db.audioTrack.createMany({
    data: [
      {
        eventId: event.id,
        title: "Happy Birthday (Bossa Nova)",
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/happy-birthday-to-you-bossa-nova-style-arrangement-21399-SOn1WYgFsLMiUWvNzhrWRn3ligyGZQ.mp3",
        isDefault: true,
        order: 0,
      },
      {
        eventId: event.id,
        title: "Applause & Cheer",
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/applause-cheer-236786-cRd3Z8EmJ1B0qHrcUSivSPQHCLwbFU.mp3",
        isDefault: false,
        order: 1,
      },
    ],
  });

  console.log("✅ Demo event seeded!");
  console.log(`   Wish form:   /wish/00000000-demo-wish-0000-000000000000`);
  console.log(`   Surprise:    /surprise/00000000-demo-surp-0000-000000000000`);
  console.log(`   Admin:       /admin/${event.id}  (password: demo1234)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
