import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  version: number | undefined;
};

const DB_CLIENT_VERSION = 2;

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

if (!globalForPrisma.prisma || globalForPrisma.version !== DB_CLIENT_VERSION) {
  globalForPrisma.prisma = createPrismaClient();
  globalForPrisma.version = DB_CLIENT_VERSION;
}

export const db = globalForPrisma.prisma;
