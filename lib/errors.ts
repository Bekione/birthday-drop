import { Prisma } from "../app/generated/prisma/client";

const DB_UNAVAILABLE_PATTERNS = [
  "tenant or user not found", // Supabase pooler when project is paused
  "circuit breaker", // Supabase Supavisor
  "can't reach",
  "cannot reach",
  "econnrefused",
  "etimedout",
  "enotfound",
  "econnreset",
  "ehostunreach",
  "connection refused",
  "connection terminated",
  "connection timed out",
  "timeout expired",
  "server closed the connection",
  "too many clients",
  "remaining connection slots",
  "driveradaptererror",
  "fetch failed",
  "getaddrinfo",
];

const DB_UNAVAILABLE_PRISMA_CODES = new Set([
  "P1001", // Can't reach database server
  "P1002", // Database server timed out
  "P1008", // Operations timed out
  "P1017", // Server closed connection
  "P2024", // Timed out fetching a new connection from pool
]);

/** Collects error message + nested cause messages for accurate classification. */
function collectErrorText(err: unknown): string {
  const parts: string[] = [];
  let current: unknown = err;
  let depth = 0;

  while (current && depth < 5) {
    if (current instanceof Error) {
      parts.push(current.message);
      current = (current as { cause?: unknown }).cause;
    } else if (typeof current === "string") {
      parts.push(current);
      break;
    } else {
      break;
    }
    depth++;
  }

  return parts.join(" | ").toLowerCase();
}

export function isDatabaseUnavailableError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  if (err instanceof Prisma.PrismaClientRustPanicError) return true;
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    DB_UNAVAILABLE_PRISMA_CODES.has(err.code)
  ) {
    return true;
  }

  const text = collectErrorText(err);
  return DB_UNAVAILABLE_PATTERNS.some((pattern) => text.includes(pattern));
}

export function getSafeErrorInfo(err: unknown): {
  message: string;
  isSystemError: boolean;
} {
  if (isDatabaseUnavailableError(err)) {
    return {
      message:
        "Our database service is temporarily unreachable. Please try again in a moment.",
      isSystemError: true,
    };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return {
        message: "A surprise with those details already exists.",
        isSystemError: false,
      };
    }
    if (err.code === "P2025") {
      return {
        message: "This item could not be found. It may have been deleted.",
        isSystemError: false,
      };
    }
    return {
      message: "A database error occurred. Please try again shortly.",
      isSystemError: true,
    };
  }

  return {
    message: "Something unexpected went wrong on our end. Please try again.",
    isSystemError: true,
  };
}

export function safeErrorMessage(err: unknown): string {
  return getSafeErrorInfo(err).message;
}
