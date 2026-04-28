import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
];

export async function POST(request: NextRequest) {
  try {
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

    // Validate file type
    if (isPhoto && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid image format. Use JPEG, PNG, WebP, or GIF." },
        { status: 400 },
      );
    }
    if (isAudio && !ALLOWED_AUDIO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid audio format. Use MP3 or WAV." },
        { status: 400 },
      );
    }

    // Validate file size
    if (isPhoto && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image too large. Max 5MB." },
        { status: 400 },
      );
    }
    if (isAudio && file.size > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        { error: "Audio too large. Max 10MB." },
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
