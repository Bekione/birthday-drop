import { readFile } from "node:fs/promises";
import path from "node:path";

const SATORI_SUPPORTED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
]);

/**
 * Fetches a remote photo and converts it into a base64 data URI only if it
 * uses a format supported by Satori/ImageResponse (JPEG, PNG, GIF).
 * Returns null on timeout, fetch error, or unsupported format (e.g. WebP/AVIF)
 * so OG image generation falls back gracefully instead of returning HTTP 500.
 */
export async function loadOgPhotoDataUri(
  photoUrl: string | null | undefined,
): Promise<string | null> {
  if (!photoUrl) return null;

  try {
    const res = await fetch(photoUrl, {
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const rawType = (res.headers.get("content-type") || "")
      .split(";")[0]
      .trim()
      .toLowerCase();

    if (!SATORI_SUPPORTED_TYPES.has(rawType)) {
      return null;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > 4.5 * 1024 * 1024) {
      return null;
    }

    const mime = rawType === "image/jpg" ? "image/jpeg" : rawType;
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Reads a PNG asset from public/ into a base64 data URI for ImageResponse. */
export async function loadPublicPngDataUri(
  relativePath: string,
): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), "public", relativePath);
    const buf = await readFile(filePath);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
