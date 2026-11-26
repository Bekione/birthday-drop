import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_IMAGE_SIZE = 4.2 * 1024 * 1024; // 4.2MB (safely under Vercel's 4.5MB payload limit)
const MAX_AUDIO_SIZE = 4.2 * 1024 * 1024; // 4.2MB (safely under Vercel's 4.5MB payload limit)
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const ALLOWED_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/x-mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
];
const ALLOWED_AUDIO_EXTS = [".mp3", ".wav"];

// In-memory rate limiter — resets per cold start (serverless-safe)
// Key: `${deviceId}_${type}`, Value: { count, resetAt }
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const PHOTO_LIMIT = 3; // max photos per device per hour
const AUDIO_LIMIT = 2; // max audio uploads per device per hour

function checkRateLimit(deviceId: string, type: "photo" | "audio"): boolean {
  if (!deviceId || deviceId === "unknown") return true; // skip if no device id
  const key = `${deviceId}_${type}`;
  const now = Date.now();
  const entry = rateLimiter.get(key);
  const limit = type === "photo" ? PHOTO_LIMIT : AUDIO_LIMIT;

  if (!entry || now > entry.resetAt) {
    rateLimiter.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const deviceId =
      request.headers.get("X-Device-Id")?.slice(0, 128) ?? "unknown";

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isPhoto = type === "photo";
    const isAudio = type === "audio";

    if (!isPhoto && !isAudio) {
      return NextResponse.json(
        { error: "Invalid upload type" },
        { status: 400 },
      );
    }

    // Device rate limiting
    if (!checkRateLimit(deviceId, isPhoto ? "photo" : "audio")) {
      return NextResponse.json(
        { error: "Too many uploads from this device. Please try again later." },
        { status: 429 },
      );
    }

    // Validate file type (with extension fallback for browsers sending empty/generic MIME types)
    const dotIdx = file.name.lastIndexOf(".");
    const ext = dotIdx >= 0 ? file.name.slice(dotIdx).toLowerCase() : "";
    const hasGenericMime =
      !file.type || file.type === "application/octet-stream";

    if (
      isPhoto &&
      !ALLOWED_IMAGE_TYPES.includes(file.type) &&
      !(hasGenericMime && ALLOWED_IMAGE_EXTS.includes(ext))
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid image format. Supported formats: JPG, PNG, WebP, GIF, or AVIF.",
        },
        { status: 400 },
      );
    }
    if (
      isAudio &&
      !ALLOWED_AUDIO_TYPES.includes(file.type) &&
      !(hasGenericMime && ALLOWED_AUDIO_EXTS.includes(ext))
    ) {
      return NextResponse.json(
        { error: "Invalid audio format. Use MP3 or WAV." },
        { status: 400 },
      );
    }

    // Validate file size
    if (isPhoto && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 4MB." },
        { status: 400 },
      );
    }
    if (isAudio && file.size > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        { error: "Audio too large. Maximum size is 4MB." },
        { status: 400 },
      );
    }

    const prefix = isPhoto ? "photos" : "audio";
    const filename = `${prefix}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const blob = await put(filename, file, { access: "public" });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
