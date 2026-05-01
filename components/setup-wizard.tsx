"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { ZodIssue } from "zod";
import { THEMES, ThemeId, DEFAULT_AUDIO_TRACKS } from "@/lib/themes";
import { createEvent } from "@/app/actions";
import { Logo } from "@/components/logo";
import {
  Star,
  Music2,
  Lock,
  PartyPopper,
  Camera,
  Upload,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { useWizardStore } from "@/lib/wizard-store";
import { step0Schema, step3Schema } from "@/lib/wizard-schema";
import { getDeviceId } from "@/lib/device-id";
import { useState } from "react";

const STEPS = ["Who?", "Theme", "Music", "Security", "Done!"];

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

export function SetupWizard() {
  const router = useRouter();

  // Zustand state
  const {
    step,
    setStep,
    personName,
    birthDate,
    photoPreview,
    teaserMessage,
    allowAnonymous,
    theme,
    selectedTrackId,
    audioLoop,
    audioVolume,
    audioAutoplay,
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
  const [copied, setCopied] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    wishToken: string;
    surpriseToken: string;
    eventId: string;
  } | null>(null);

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
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setField("photoFile", file);
    setField("photoPreview", URL.createObjectURL(file));
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
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "X-Device-Id": deviceId },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        photoUrl = data.url;
      }

      const customAudioFile = useWizardStore.getState().customAudioFile;
      if (customAudioFile) {
        const formData = new FormData();
        formData.append("file", customAudioFile);
        formData.append("type", "audio");
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "X-Device-Id": deviceId },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Audio upload failed");
        customTrackUrl = data.url;
        customTrackTitle = customAudioFile.name.replace(/\.[^.]+$/, "");
      }

      const res = await createEvent({
        personName: personName.trim(),
        birthDate: birthDate.trim(),
        personPhotoUrl: photoUrl,
        theme,
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

      sessionStorage.setItem("wizard_result", JSON.stringify(res));
      setResult(res);
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
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Birthday (display format) *
                      </label>
                      <input
                        id="birthDate"
                        type="text"
                        placeholder="e.g. Aug 10, 2025"
                        value={birthDate}
                        onChange={(e) => {
                          setField("birthDate", e.target.value);
                          if (fieldErrors.birthDate)
                            setFieldErrors((p) => {
                              const n = { ...p };
                              delete n.birthDate;
                              return n;
                            });
                        }}
                        className={field("birthDate").className}
                      />
                      {fieldErrors.birthDate && (
                        <p className="text-xs text-red-500 mt-1">
                          {fieldErrors.birthDate}
                        </p>
                      )}
                    </div>
                    {/* Photo upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Photo (optional)
                      </label>
                      <div className="flex items-center gap-4">
                        {photoPreview && (
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="h-16 w-16 rounded-full object-cover border-2 border-purple-300"
                          />
                        )}
                        <label className="cursor-pointer rounded-xl border-2 border-dashed border-purple-200 px-6 py-4 text-center text-sm text-purple-500 hover:border-purple-400 transition-colors flex-1 flex items-center justify-center gap-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 shadow">
                            <Camera size={24} className="text-white" />
                          </div>
                          <span>Click to upload a photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                          />
                        </label>
                      </div>
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
                    {Object.values(THEMES).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        id={`theme-${t.id}`}
                        onClick={() => setField("theme", t.id as ThemeId)}
                        className={`snap-center shrink-0 w-64 rounded-2xl border-2 p-5 text-left transition-all duration-200 hover:scale-[1.02] ${
                          theme === t.id
                            ? "border-purple-500 shadow-lg shadow-purple-100"
                            : "border-gray-100"
                        }`}
                      >
                        <div
                          className={`h-20 rounded-xl mb-4 flex items-center justify-center text-4xl bg-gradient-to-br ${
                            t.id === "confetti"
                              ? "from-blue-100 to-teal-200"
                              : "from-indigo-950 to-purple-950"
                          }`}
                        >
                          {t.emoji}
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-gray-800">{t.name}</p>
                          {theme === t.id && (
                            <span className="text-purple-600 text-lg">✓</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{t.description}</p>
                      </button>
                    ))}
                    {/* Future theme placeholder */}
                    <div className="snap-center shrink-0 w-64 rounded-2xl border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center text-gray-300 gap-2">
                      <span className="text-3xl">✨</span>
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

                  <div className="space-y-3 mb-6">
                    {DEFAULT_AUDIO_TRACKS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setField("selectedTrackId", t.id);
                          setField("customAudioFile", null);
                        }}
                        className={`w-full flex items-center gap-4 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                          selectedTrackId === t.id &&
                          !useWizardStore.getState().customAudioFile
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-100 hover:border-purple-200"
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                          <Music2 size={18} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {t.title}
                          </p>
                          {t.isDefault && (
                            <p className="text-xs text-purple-500">
                              Default pick
                            </p>
                          )}
                        </div>
                        {selectedTrackId === t.id &&
                          !useWizardStore.getState().customAudioFile && (
                            <span className="ml-auto text-purple-600">✓</span>
                          )}
                      </button>
                    ))}
                    {/* Custom upload */}
                    <label
                      className={`w-full flex items-center gap-4 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                        useWizardStore.getState().customAudioFile
                          ? "border-purple-500 bg-purple-50"
                          : "border-dashed border-gray-200 hover:border-purple-200"
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                        <Upload size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {useWizardStore.getState().customAudioFile?.name ??
                            "Upload your own song"}
                        </p>
                        <p className="text-xs text-gray-400">
                          MP3 or WAV, max 10MB
                        </p>
                      </div>
                      {useWizardStore.getState().customAudioFile && (
                        <span className="ml-auto text-purple-600">✓</span>
                      )}
                      <input
                        type="file"
                        accept="audio/mp3,audio/mpeg,audio/wav"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setField("customAudioFile", file);
                            setField("selectedTrackId", "");
                          }
                        }}
                      />
                    </label>
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

              {/* ── Step 3: Security ─────────────────────── */}
              {step === 3 && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow">
                      <Lock size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-adlam text-purple-700">
                        Secure your event
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Set a password and a wish deadline.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Admin Password *
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
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Confirm Password *
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
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Wish form deadline (optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={wishDeadline}
                        onChange={(e) =>
                          setField("wishDeadline", e.target.value)
                        }
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Form closes automatically after this date. Defaults to
                        birthday date if left empty.
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
                      <p className="font-semibold mb-1 flex items-end gap-2">
                        <AlertTriangle />
                        Save this password!
                      </p>
                      <p>
                        You&apos;ll need it to access your admin dashboard.
                        There&apos;s no recovery option — keep it safe.
                      </p>
                    </div>
                  </div>
                  {error && (
                    <p className="mt-4 text-sm text-red-500">{error}</p>
                  )}
                </div>
              )}

              {/* ── Step 4: Done! ────────────────────────── */}
              {step === 4 && result && (
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="text-6xl animate-bounce">🎉</div>
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
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                        ⚙️ Admin Dashboard (bookmark this)
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
                    className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 font-bold text-white shadow-lg hover:scale-105 transition-all"
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
                  onClick={() => goTo(step + 1)}
                  className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:scale-105 transition-all"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  id="create-surprise"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:scale-105 disabled:opacity-60 disabled:scale-100 transition-all"
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
