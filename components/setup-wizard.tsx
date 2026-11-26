"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { ZodIssue } from "zod";
import { THEMES, ThemeId, DEFAULT_AUDIO_TRACKS } from "@/lib/themes";
import { createEvent } from "@/app/actions";
import { Logo } from "@/components/logo";
import Image from "next/image";
import {
  Star,
  Music2,
  Lock,
  PartyPopper,
  Camera,
  Upload,
  LayoutDashboard,
  Mail,
  Play,
  Pause,
  Check,
  ShieldCheck,
  X,
  AlertCircle,
} from "lucide-react";
import { useWizardStore } from "@/lib/wizard-store";
import { step0Schema, step3Schema } from "@/lib/wizard-schema";
import { getDeviceId } from "@/lib/device-id";
import { useState } from "react";

const STEPS = ["Who?", "Theme", "Music", "Security", "Done!"];

const CELEBRATION_OPTIONS = [
  {
    id: "family",
    label: "Family",
    icon: "/icons/home-heart.svg",
    desc: "Mom, Dad, Relatives",
  },
  {
    id: "friends",
    label: "Friends",
    icon: "/icons/people.svg",
    desc: "Besties & Squad",
  },
  {
    id: "workplace",
    label: "Workplace",
    icon: "/icons/briefcase.svg",
    desc: "Team & Coworkers",
  },
  {
    id: "other",
    label: "Other",
    icon: "/icons/star.svg",
    desc: "Community & Club",
  },
];

function toDateInputValue(str: string): string {
  if (!str) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Step slide animation variants
const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "40%" : "-40%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? "-40%" : "40%",
    opacity: 0,
  }),
};

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const ALLOWED_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];
const MAX_UPLOAD_SIZE = 4.2 * 1024 * 1024; // 4.2MB (Vercel serverless limit is 4.5MB)

async function compressImageIfNeeded(file: File): Promise<File> {
  // If file is under 2MB or is GIF, skip canvas compression
  if (file.size <= 2 * 1024 * 1024 || file.type === "image/gif") {
    return file;
  }
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 1200;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(file);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const compressed = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, ".jpg"),
              { type: "image/jpeg" }
            );
            resolve(compressed);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        0.88
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

async function safeUpload(
  formData: FormData,
  deviceId: string,
  kind: "photo" | "audio"
): Promise<string> {
  let res: Response;
  try {
    res = await fetch("/api/upload", {
      method: "POST",
      headers: { "X-Device-Id": deviceId },
      body: formData,
    });
  } catch (netErr: any) {
    throw new Error(
      `Network error uploading ${kind}: ${netErr?.message || "Please check your internet connection."}`
    );
  }

  if (res.status === 413) {
    throw new Error(
      `${kind === "photo" ? "Photo" : "Audio file"} is too large for upload (server 4MB limit). Please select a smaller file.`
    );
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    if (!res.ok) {
      if (
        text.toLowerCase().includes("payload_too_large") ||
        text.toLowerCase().includes("too large")
      ) {
        throw new Error(
          `${kind === "photo" ? "Photo" : "Audio file"} exceeds the 4MB upload limit. Please select a smaller file.`
        );
      }
      throw new Error(
        `Upload failed (${res.status}): Server returned an unexpected error.`
      );
    }
  }

  if (!res.ok || !data?.url) {
    throw new Error(data?.error || `Failed to upload ${kind}.`);
  }

  return data.url;
}

export function SetupWizard() {
  const router = useRouter();

  // Zustand state
  const {
    step,
    setStep,
    personName,
    birthDate,
    photoPreview,
    celebrationType,
    customHeading,
    flipCards,
    teaserMessage,
    allowAnonymous,
    theme,
    selectedTrackId,
    audioLoop,
    audioVolume,
    audioAutoplay,
    customAudioFile,
    adminPassword,
    confirmPassword,
    wishDeadline,
    setField,
    reset,
  } = useWizardStore();

  // Local UI state (not persisted)
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [audioError, setAudioError] = useState("");
  const [optimizingPhoto, setOptimizingPhoto] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    wishToken: string;
    surpriseToken: string;
    eventId: string;
  } | null>(null);
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(
    null,
  );
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const base = typeof window !== "undefined" ? window.location.origin : "";

  // Restore step 4 result from sessionStorage after refresh
  useEffect(() => {
    const saved = sessionStorage.getItem("wizard_result");
    if (saved && step === 4) {
      try {
        setResult(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, [step]);

  const validateStep = useCallback((): boolean => {
    if (step === 0) {
      const r = step0Schema.safeParse({ personName, birthDate });
      if (!r.success) {
        const errs: Record<string, string> = {};
        r.error.issues.forEach((e: ZodIssue) => {
          if (e.path[0]) errs[String(e.path[0])] = e.message;
        });
        setFieldErrors(errs);
        return false;
      }
    }
    if (step === 3) {
      const r = step3Schema.safeParse({ adminPassword, confirmPassword });
      if (!r.success) {
        const errs: Record<string, string> = {};
        r.error.issues.forEach((e: ZodIssue) => {
          if (e.path[0]) errs[String(e.path[0])] = e.message;
        });
        setFieldErrors(errs);
        return false;
      }
    }
    setFieldErrors({});
    return true;
  }, [step, personName, birthDate, adminPassword, confirmPassword]);

  const goTo = (next: number) => {
    if (next > step && !validateStep()) return;
    setError("");
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError("");

    const dotIdx = file.name.lastIndexOf(".");
    const ext = dotIdx >= 0 ? file.name.slice(dotIdx).toLowerCase() : "";
    const isMimeValid = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isExtValid = ALLOWED_IMAGE_EXTS.includes(ext);

    if (!isMimeValid && !isExtValid) {
      setPhotoError(
        "Unsupported format. Please select a JPG, PNG, WebP, GIF, or AVIF image."
      );
      return;
    }

    try {
      setOptimizingPhoto(true);
      const processed = await compressImageIfNeeded(file);
      setOptimizingPhoto(false);

      if (processed.size > MAX_UPLOAD_SIZE) {
        setPhotoError(
          `Image is too large (${(processed.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 4MB.`
        );
        return;
      }

      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
      setField("photoFile", processed);
      setField("photoPreview", URL.createObjectURL(processed));
    } catch {
      setOptimizingPhoto(false);
      if (file.size > MAX_UPLOAD_SIZE) {
        setPhotoError(
          `Image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 4MB.`
        );
        return;
      }
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
      setField("photoFile", file);
      setField("photoPreview", URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setField("photoFile", null);
    setField("photoPreview", null);
    setPhotoError("");
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError("");
    try {
      const deviceId = await getDeviceId();

      let photoUrl: string | undefined;
      let customTrackUrl: string | undefined;
      let customTrackTitle: string | undefined;

      const photoFile = useWizardStore.getState().photoFile;
      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        formData.append("type", "photo");
        photoUrl = await safeUpload(formData, deviceId, "photo");
      }

      const customAudioFile = useWizardStore.getState().customAudioFile;
      if (customAudioFile) {
        const formData = new FormData();
        formData.append("file", customAudioFile);
        formData.append("type", "audio");
        customTrackUrl = await safeUpload(formData, deviceId, "audio");
        customTrackTitle = customAudioFile.name.replace(/\.[^.]+$/, "");
      }

      const res = await createEvent({
        personName: personName.trim(),
        birthDate: birthDate.trim(),
        personPhotoUrl: photoUrl,
        theme,
        celebrationType,
        customHeading: customHeading.trim() || undefined,
        flipCards,
        audioConfig: {
          selectedTrackId: customTrackUrl ? "custom" : selectedTrackId,
          loop: audioLoop,
          volume: audioVolume,
          autoplay: audioAutoplay,
        },
        customTrackUrl,
        customTrackTitle,
        adminPassword,
        wishDeadline: wishDeadline || undefined,
        allowAnonymous,
        teaserMessage: teaserMessage || undefined,
      });

      if (!res.ok) {
        throw new Error(res.error);
      }

      const payload = {
        eventId: res.eventId,
        wishToken: res.wishToken,
        surpriseToken: res.surpriseToken,
      };
      sessionStorage.setItem("wizard_result", JSON.stringify(payload));
      setResult(payload);
      setDirection(1);
      setStep(4);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const field = (key: string) => ({
    error: fieldErrors[key],
    className: `w-full rounded-xl border px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
      fieldErrors[key] ? "border-red-300 bg-red-50" : "border-gray-200"
    }`,
  });

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="mt-4 text-gray-500 text-sm">
            Create your birthday surprise in minutes
          </p>
        </div>

        {/* Step indicators */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.slice(0, 4).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                    i < step
                      ? "bg-green-500 text-white"
                      : i === step
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                {i < 3 && (
                  <div
                    className={`h-0.5 w-8 transition-all duration-300 ${
                      i < step ? "bg-green-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* ── Step 0: Who ─────────────────────────── */}
              {step === 0 && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-600 shadow">
                      <PartyPopper size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-adlam text-purple-700">
                        Who&apos;s the birthday star?
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Tell us about the person being surprised.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        id="personName"
                        type="text"
                        placeholder="e.g. Mohammed"
                        value={personName}
                        onChange={(e) => {
                          setField("personName", e.target.value);
                          if (fieldErrors.personName)
                            setFieldErrors((p) => {
                              const n = { ...p };
                              delete n.personName;
                              return n;
                            });
                        }}
                        className={field("personName").className}
                      />
                      {fieldErrors.personName && (
                        <p className="text-xs text-red-500 mt-1">
                          {fieldErrors.personName}
                        </p>
                      )}
                    </div>
                    {/* Birthday Date Selector */}
                    <div>
                      <label htmlFor="birthDate" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Birthday Date *
                      </label>
                      <input
                        id="birthDate"
                        type="date"
                        value={toDateInputValue(birthDate)}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            setField("birthDate", "");
                            return;
                          }
                          const formatted = formatDateDisplay(val);
                          setField("birthDate", formatted);
                          if (fieldErrors.birthDate) {
                            setFieldErrors((p) => {
                              const n = { ...p };
                              delete n.birthDate;
                              return n;
                            });
                          }
                        }}
                        className={field("birthDate").className}
                      />
                      {birthDate && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-medium">Display on surprise page:</span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-full">
                            <Image src="/icons/birthday-cake.svg" width={14} height={14} alt="Cake" />
                            <span>{birthDate}</span>
                          </span>
                        </div>
                      )}
                      {fieldErrors.birthDate && (
                        <p className="text-xs text-red-500 mt-1">
                          {fieldErrors.birthDate}
                        </p>
                      )}
                    </div>

                    {/* Celebration Setting */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Celebration Setting *
                      </label>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {CELEBRATION_OPTIONS.map((item) => {
                          const isSelected = (celebrationType || "family") === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setField("celebrationType", item.id as any)}
                              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                                isSelected
                                  ? "border-purple-600 bg-purple-50/80 text-purple-900 shadow-sm ring-2 ring-purple-400/30"
                                  : "border-gray-200 bg-white hover:border-purple-200 text-gray-700"
                              }`}
                            >
                              <div className="w-10 h-10 mb-1.5 flex items-center justify-center">
                                <Image
                                  src={item.icon}
                                  alt={item.label}
                                  width={34}
                                  height={34}
                                  className={`object-contain transition-transform ${isSelected ? "scale-105" : "opacity-80"}`}
                                />
                              </div>
                              <span className="text-xs font-bold">{item.label}</span>
                              <span className="text-[10px] text-gray-400 mt-0.5">{item.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Wish Section Title */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Wishes Section Title (optional override)
                      </label>
                      <input
                        type="text"
                        placeholder={
                          celebrationType === "friends"
                            ? "Default: Wishes from Friends!"
                            : celebrationType === "workplace"
                              ? "Default: Wishes from the Team!"
                              : celebrationType === "other"
                                ? "Default: Birthday Wishes!"
                                : "Default: Wishes from Family & Loved Ones!"
                        }
                        value={customHeading}
                        onChange={(e) => setField("customHeading", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-800 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Shown on the surprise page (e.g. &ldquo;Wishes for Mom!&rdquo; or &ldquo;Love from the Johnson Family&rdquo;).
                      </p>
                    </div>

                    {/* Photo upload */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-semibold text-gray-700">
                          Photo (optional)
                        </label>
                        <span className="text-[11px] text-gray-400">
                          JPG, PNG, WebP, GIF, AVIF &bull; Max 4MB
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        {photoPreview ? (
                          <div className="relative group shrink-0">
                            <Image
                              src={photoPreview}
                              alt="Preview"
                              width={64}
                              height={64}
                              className="h-16 w-16 rounded-full object-cover border-2 border-purple-300 shadow-sm"
                              unoptimized
                            />
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-transform hover:scale-110"
                              title="Remove photo"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : null}
                        <label className="cursor-pointer rounded-xl border-2 border-dashed border-purple-200 px-6 py-4 text-center text-sm text-purple-500 hover:border-purple-400 hover:bg-purple-50/50 transition-colors flex-1 flex items-center justify-center gap-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 shadow">
                            <Camera size={24} className="text-white" />
                          </div>
                          <span className="font-medium">
                            {optimizingPhoto
                              ? "Optimizing photo..."
                              : photoPreview
                                ? "Change photo"
                                : "Click to upload a photo"}
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif,.avif"
                            className="hidden"
                            disabled={optimizingPhoto}
                            onChange={handlePhotoChange}
                          />
                        </label>
                      </div>
                      {photoError && (
                        <div className="mt-2 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-600 animate-fade-in-up">
                          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                          <span className="font-medium">{photoError}</span>
                        </div>
                      )}
                    </div>
                    {/* Teaser */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Teaser message on wish form (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Leave a warm birthday wish for our boss! 🎂"
                        value={teaserMessage}
                        onChange={(e) =>
                          setField("teaserMessage", e.target.value)
                        }
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                      />
                    </div>
                    {/* Allow anonymous */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setField("allowAnonymous", !allowAnonymous)
                        }
                        className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                          allowAnonymous ? "bg-purple-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                            allowAnonymous ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                      <span className="text-sm text-gray-600">
                        Allow anonymous wishes (no name required)
                      </span>
                    </div>

                    {/* Wish Card Reveal Style Selector */}
                    <div className="pt-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Wish Cards Reveal Style
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setField("flipCards", true)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                            flipCards
                              ? "border-purple-600 bg-purple-50/70 shadow-sm ring-2 ring-purple-400/30"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Image src="/icons/gift-box.svg" width={28} height={28} alt="Gift Box" />
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                flipCards
                                  ? "bg-purple-600 text-white"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              Recommended
                            </span>
                          </div>
                          <p className="text-sm font-bold text-gray-900 mb-0.5">
                            3D Flip to Reveal
                          </p>
                          <p className="text-xs text-gray-500 leading-snug">
                            Interactive gift cards! Recipient taps each card to flip and discover the wish & reactions.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setField("flipCards", false)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                            !flipCards
                              ? "border-purple-600 bg-purple-50/70 shadow-sm ring-2 ring-purple-400/30"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Image src="/icons/scroll.svg" width={28} height={28} alt="Scroll" />
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                !flipCards
                                  ? "bg-purple-600 text-white"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              Instant Open
                            </span>
                          </div>
                          <p className="text-sm font-bold text-gray-900 mb-0.5">
                            Open Celebration Wall
                          </p>
                          <p className="text-xs text-gray-500 leading-snug">
                            All messages are immediately visible on screen in a colorful masonry celebration wall.
                          </p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 1: Theme ────────────────────────── */}
              {step === 1 && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-600 shadow">
                      <Star size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-adlam text-purple-700">
                        Pick a theme
                      </h2>
                      <p className="text-gray-400 text-sm">
                        The surprise page will use this visual style.
                      </p>
                    </div>
                  </div>
                  {/* Horizontal scroll snap — ready for more themes */}
                  <div className="flex gap-4 overflow-x-auto py-3 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-purple-200">
                    {Object.values(THEMES).map((t) => {
                      const imgSrc =
                        t.id === "confetti"
                          ? "/images/theme-confetti-carnival.png"
                          : "/images/theme-midnight-star.png";
                      return (
                        <button
                          key={t.id}
                          type="button"
                          id={`theme-${t.id}`}
                          onClick={() => setField("theme", t.id as ThemeId)}
                          className={`snap-center shrink-0 w-64 rounded-2xl border-2 p-0 text-left transition-all duration-200 hover:scale-[1.02] overflow-hidden ${
                            theme === t.id
                              ? "border-purple-500 shadow-lg shadow-purple-100"
                              : "border-gray-100"
                          }`}
                        >
                          {/* Preview image */}
                          <div className="relative h-36 w-full overflow-hidden">
                            <Image
                              src={imgSrc}
                              alt={`${t.name} preview`}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {theme === t.id && (
                              <div className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 shadow-lg">
                                <Check size={14} className="text-white" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <p className="font-bold text-gray-800 mb-0.5">
                              {t.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                    {/* Future theme placeholder */}
                    <div className="snap-center shrink-0 w-64 rounded-2xl border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center text-gray-300 gap-2">
                      <Star size={28} />
                      <p className="text-xs font-semibold">More coming soon</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Music ────────────────────────── */}
              {step === 2 && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-600 shadow">
                      <Music2 size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-adlam text-purple-700">
                        Choose the music
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Pick a song or upload your own.
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Curated tracks
                  </p>
                  <div className="space-y-3 mb-6">
                    {DEFAULT_AUDIO_TRACKS.map((t) => {
                      const isSelected =
                        selectedTrackId === t.id &&
                        !useWizardStore.getState().customAudioFile;
                      const isPreviewing = previewingTrackId === t.id;

                      const handlePreview = (e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (isPreviewing) {
                          previewAudioRef.current?.pause();
                          setPreviewingTrackId(null);
                        } else {
                          if (previewAudioRef.current) {
                            previewAudioRef.current.pause();
                          }
                          previewAudioRef.current = new Audio(t.url);
                          previewAudioRef.current.volume = 0.6;
                          previewAudioRef.current.play();
                          previewAudioRef.current.onended = () =>
                            setPreviewingTrackId(null);
                          setPreviewingTrackId(t.id);
                        }
                      };

                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            setField("selectedTrackId", t.id);
                            setField("customAudioFile", null);
                            setAudioError("");
                          }}
                          className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                            isSelected
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-100 hover:border-purple-200"
                          }`}
                        >
                          {/* Album art placeholder */}
                          <div
                            className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${t.gradient ?? "from-purple-400 to-pink-500"} flex items-center justify-center shadow-sm`}
                          >
                            <Music2 size={16} className="text-white" />
                          </div>
                          <p className="flex-1 font-semibold text-gray-800 text-sm">
                            {t.title}
                          </p>
                          {/* Selected check */}
                          {isSelected && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                          {/* Play/pause preview */}
                          <button
                            type="button"
                            onClick={handlePreview}
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                              isPreviewing
                                ? "bg-purple-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-purple-600"
                            }`}
                          >
                            {isPreviewing ? (
                              <Pause size={14} />
                            ) : (
                              <Play size={14} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                    {/* Custom upload */}
                    <div>
                      <label
                        className={`w-full flex items-center gap-4 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                          customAudioFile
                            ? "border-purple-500 bg-purple-50"
                            : "border-dashed border-gray-200 hover:border-purple-200"
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 shrink-0">
                          <Upload size={18} className="text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {customAudioFile?.name ?? "Upload your own song"}
                          </p>
                          <p className="text-xs text-gray-400">
                            MP3 or WAV, max 4MB
                          </p>
                        </div>
                        {customAudioFile ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-purple-600 font-bold">✓</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setField("customAudioFile", null);
                                setAudioError("");
                              }}
                              className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 transition-colors"
                              title="Remove song"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : null}
                        <input
                          type="file"
                          accept="audio/mp3,audio/mpeg,audio/wav,.mp3,.wav"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (!file) return;
                            setAudioError("");
                            const dotIdx = file.name.lastIndexOf(".");
                            const ext =
                              dotIdx >= 0
                                ? file.name.slice(dotIdx).toLowerCase()
                                : "";
                            const validMimes = [
                              "audio/mpeg",
                              "audio/mp3",
                              "audio/x-mp3",
                              "audio/wav",
                              "audio/x-wav",
                              "audio/wave",
                            ];
                            const validExts = [".mp3", ".wav"];
                            if (
                              !validMimes.includes(file.type) &&
                              !validExts.includes(ext)
                            ) {
                              setAudioError(
                                "Unsupported audio format. Please choose an MP3 or WAV file."
                              );
                              return;
                            }
                            if (file.size > MAX_UPLOAD_SIZE) {
                              setAudioError(
                                `Audio file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 4MB.`
                              );
                              return;
                            }
                            setField("customAudioFile", file);
                            setField("selectedTrackId", "");
                          }}
                        />
                      </label>
                      {audioError && (
                        <div className="mt-2 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-600 animate-fade-in-up">
                          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                          <span className="font-medium">{audioError}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-700">
                      Audio settings
                    </p>
                    {/* Loop */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Loop song</span>
                      <button
                        type="button"
                        onClick={() => setField("audioLoop", !audioLoop)}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          audioLoop ? "bg-purple-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            audioLoop ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                    {/* Autoplay */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Autoplay on open
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setField("audioAutoplay", !audioAutoplay)
                        }
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          audioAutoplay ? "bg-purple-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            audioAutoplay ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                    {/* Volume */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">
                          Default volume
                        </span>
                        <span className="text-sm font-semibold text-purple-600">
                          {Math.round(audioVolume * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={audioVolume}
                        onChange={(e) =>
                          setField("audioVolume", Number(e.target.value))
                        }
                        className="w-full accent-purple-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow">
                      <Lock size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-adlam text-purple-700">
                        Secure your event
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Lock in the details and get the party started.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5 mt-6">
                    {/* Admin Password */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Admin Password
                      </label>
                      <input
                        id="adminPassword"
                        type="password"
                        placeholder="Min 6 characters"
                        value={adminPassword}
                        onChange={(e) => {
                          setField("adminPassword", e.target.value);
                          if (fieldErrors.adminPassword)
                            setFieldErrors((p) => {
                              const n = { ...p };
                              delete n.adminPassword;
                              return n;
                            });
                        }}
                        className={field("adminPassword").className}
                      />
                      {fieldErrors.adminPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          {fieldErrors.adminPassword}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Confirm Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repeat your password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setField("confirmPassword", e.target.value);
                          if (fieldErrors.confirmPassword)
                            setFieldErrors((p) => {
                              const n = { ...p };
                              delete n.confirmPassword;
                              return n;
                            });
                        }}
                        className={field("confirmPassword").className}
                      />
                      {fieldErrors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          {fieldErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* Wish deadline */}
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Wish Form Deadline
                        </label>
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 uppercase tracking-wide">
                          Recommended
                        </span>
                      </div>
                      <input
                        type="datetime-local"
                        value={wishDeadline}
                        onChange={(e) =>
                          setField("wishDeadline", e.target.value)
                        }
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Guests won&apos;t be able to submit wishes after this
                        time.
                      </p>
                    </div>

                    {/* Security warning */}
                    <div className="rounded-xl bg-purple-50 border border-purple-200 p-4">
                      <p className="font-bold text-purple-800 mb-1 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-purple-600" />
                        Keep this safe, Party Planner!
                      </p>
                      <p className="text-sm text-purple-700 leading-relaxed">
                        This password is your only way to view the secret wishes
                        and manage the event. We can&apos;t store plain-text
                        passwords, so we can&apos;t recover it for you!
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-700 animate-fade-in-up">
                      <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
                      <div>
                        <p className="font-semibold text-red-800">Surprise creation failed</p>
                        <p className="mt-0.5 text-xs text-red-600 leading-relaxed">{error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 4: Done! ────────────────────────── */}
              {step === 4 && result && (
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="animate-bounce">
                      <Image src="/icons/party-popper.svg" width={64} height={64} alt="Party" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-adlam text-purple-700 mb-2">
                    Your surprise is ready!
                  </h2>
                  <p className="text-gray-500 mb-8 text-sm">
                    Share these links — keep the surprise link secret until the
                    birthday!
                  </p>
                  <div className="space-y-4 text-left mb-8">
                    {/* Wish form link */}
                    <div className="rounded-2xl bg-pink-50 border border-pink-100 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-pink-500 mb-1 flex items-center gap-1.5">
                        <Mail size={14} /> Wish Form Link (share with team)
                      </p>
                      <p className="text-xs text-gray-400 mb-2">
                        They fill this out before the birthday.
                      </p>
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-pink-200 px-3 py-2">
                        <code className="flex-1 text-xs text-gray-700 break-all">
                          {base}/wish/{result.wishToken}
                        </code>
                        <button
                          id="copy-wish-link"
                          onClick={() =>
                            copyToClipboard(
                              `${base}/wish/${result.wishToken}`,
                              "wish",
                            )
                          }
                          className="rounded-lg bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-600 hover:bg-pink-200 transition-colors whitespace-nowrap"
                        >
                          {copied === "wish" ? "✓ Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                    {/* Surprise link */}
                    <div className="rounded-2xl bg-purple-50 border border-purple-100 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-1 flex items-center gap-1.5">
                        <PartyPopper size={14} /> Surprise Page (open on
                        birthday)
                      </p>
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-purple-200 px-3 py-2">
                        <code className="flex-1 text-xs text-gray-700 break-all">
                          {base}/surprise/{result.surpriseToken}
                        </code>
                        <button
                          id="copy-surprise-link"
                          onClick={() =>
                            copyToClipboard(
                              `${base}/surprise/${result.surpriseToken}`,
                              "surprise",
                            )
                          }
                          className="rounded-lg bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-600 hover:bg-purple-200 transition-colors whitespace-nowrap"
                        >
                          {copied === "surprise" ? "✓ Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                    {/* Admin link */}
                    <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
                        <LayoutDashboard size={14} />
                        Admin Dashboard (bookmark this)
                      </p>
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
                        <code className="flex-1 text-xs text-gray-700 break-all">
                          {base}/admin/{result.eventId}
                        </code>
                        <button
                          id="copy-admin-link"
                          onClick={() =>
                            copyToClipboard(
                              `${base}/admin/${result.eventId}`,
                              "admin",
                            )
                          }
                          className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap"
                        >
                          {copied === "admin" ? "✓ Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      reset();
                      router.push(`/admin/${result.eventId}`);
                    }}
                    className="w-full rounded-full bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-3 font-bold text-white shadow-lg hover:scale-105 transition-all"
                  >
                    Go to Admin Dashboard →
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer nav */}
          {step < 4 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-8 py-5">
              <button
                type="button"
                onClick={() => goTo(Math.max(0, step - 1))}
                disabled={step === 0}
                className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
              >
                ← Back
              </button>
              <span className="text-xs text-gray-400">
                Step {step + 1} of 4
              </span>
              {step < 3 ? (
                <button
                  type="button"
                  id="next-step"
                  disabled={optimizingPhoto}
                  onClick={() => goTo(step + 1)}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:scale-105 disabled:opacity-60 disabled:scale-100 transition-all"
                >
                  {optimizingPhoto ? "Optimizing…" : "Next →"}
                </button>
              ) : (
                <button
                  type="button"
                  id="create-surprise"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:scale-105 disabled:opacity-60 disabled:scale-100 transition-all"
                >
                  {loading ? (
                    "Creating…"
                  ) : (
                    <span className="flex items-center gap-2">
                      <PartyPopper size={18} /> Create Surprise!
                    </span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
