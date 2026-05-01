/**
 * Generates a stable device fingerprint stored in localStorage.
 * Used for basic upload rate-limiting without requiring an account.
 */
export async function getDeviceId(): Promise<string> {
  const STORAGE_KEY = "birthdaydrop_did";

  if (typeof window === "undefined") return "server";

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  // Collect a few stable browser signals
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency ?? 0,
    navigator.platform ?? "",
  ]
    .join("|")
    .toLowerCase();

  // SHA-256 hash using the Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const id = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
