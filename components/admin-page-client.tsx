"use client";

import { useState, useEffect, useRef } from "react";
import {
  verifyAdminPassword,
  getAdminEvent,
  deleteWish,
  updateEvent,
  getAdminWishesPage,
} from "@/app/actions";
import { THEMES, ThemeId, DEFAULT_AUDIO_TRACKS } from "@/lib/themes";
import { Logo } from "@/components/logo";
import Image from "next/image";
import {
  Eye,
  Edit2,
  X,
  Save,
  Trash2,
  Unlock,
  RefreshCw,
  Link2,
  MessageCircleHeart,
  Cake,
  Mailbox,
  Copy,
  Sparkles,
  LayoutDashboard,
  Gift,
  PartyPopper,
  Settings2,
  Music2,
  Check,
  Play,
  Pause,
  Upload,
  PlusCircle,
} from "lucide-react";

interface AdminPageClientProps {
  eventId: string;
}

type EventData = Awaited<ReturnType<typeof getAdminEvent>>;

const SESSION_KEY = (eventId: string) => `admin_authed_${eventId}`;

export function AdminPageClient({ eventId }: AdminPageClientProps) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true); // checking sessionStorage
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [event, setEvent] = useState<EventData>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTheme, setEditTheme] = useState<ThemeId>("confetti");
  const [editDeadline, setEditDeadline] = useState("");
  const [editTeaser, setEditTeaser] = useState("");

  // New full-settings states
  const [editAllowAnon, setEditAllowAnon] = useState(true);
  const [editSelectedTrackId, setEditSelectedTrackId] = useState("");
  const [editAudioLoop, setEditAudioLoop] = useState(true);
  const [editAudioAutoplay, setEditAudioAutoplay] = useState(true);
  const [editCustomAudioFile, setEditCustomAudioFile] = useState<File | null>(
    null,
  );
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(
    null,
  );
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    previewAudioRef.current = new Audio();
    previewAudioRef.current.onended = () => setPreviewingTrackId(null);
    return () => {
      previewAudioRef.current?.pause();
    };
  }, []);

  const [wishList, setWishList] = useState<NonNullable<EventData>["wishes"]>(
    [],
  );
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastWishElementRef = useRef<HTMLDivElement | null>(null);

  const base = typeof window !== "undefined" ? window.location.origin : "";

  // Infinite Scroll Observer setup
  useEffect(() => {
    if (loadingMore || !hasMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingMore && hasMore) {
        setLoadingMore(true);
        const cursor = wishList[wishList.length - 1]?.id;
        if (!cursor) {
          setLoadingMore(false);
          return;
        }
        getAdminWishesPage(eventId, cursor)
          .then((newWishes) => {
            if (newWishes.length < 15) setHasMore(false);
            setWishList((prev) => {
              const existingIds = new Set(prev.map((w) => w.id));
              const filtered = newWishes.filter((w) => !existingIds.has(w.id));
              return [...prev, ...filtered];
            });
          })
          .catch(() => {})
          .finally(() => setLoadingMore(false));
      }
    });

    if (lastWishElementRef.current) {
      observerRef.current.observe(lastWishElementRef.current);
    }
    return () => observerRef.current?.disconnect();
  }, [loadingMore, hasMore, wishList, eventId]);

  // Restore auth from sessionStorage on mount
  useEffect(() => {
    const wasAuthed = sessionStorage.getItem(SESSION_KEY(eventId));
    if (wasAuthed === "1") {
      getAdminEvent(eventId).then((data) => {
        if (data) {
          setEvent(data);
          setWishList(data.wishes);
          setHasMore(data.wishes.length === 15);
          setLastRefreshed(new Date());
          setEditName(data.personName);
          setEditDate(data.birthDate);
          setEditTheme((data.theme as ThemeId) ?? "confetti");
          setEditDeadline(
            data.wishDeadline
              ? new Date(data.wishDeadline).toISOString().slice(0, 16)
              : "",
          );
          setEditTeaser(data.teaserMessage ?? "");

          setEditAllowAnon(data.allowAnonymous ?? true);
          if (data.audioConfig && typeof data.audioConfig === "object") {
            const ac = data.audioConfig as any;
            setEditSelectedTrackId(ac.selectedTrackId ?? "");
            setEditAudioLoop(ac.loop ?? true);
            setEditAudioAutoplay(ac.autoplay ?? true);
          }

          setAuthed(true);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [eventId]);

  // Auto-poll every 15 s once authenticated
  useEffect(() => {
    if (!authed) return;
    const poll = setInterval(async () => {
      const data = await getAdminEvent(eventId);
      if (data) {
        setWishList((prev) => {
          // Merge newly fetched wishes safely at the top without touching hasMore
          const newIds = new Set(data.wishes.map((w: any) => w.id));
          const existingSafe = prev.filter((w) => !newIds.has(w.id));
          return [...data.wishes, ...existingSafe];
        });
        setLastRefreshed(new Date());
      }
    }, 15_000);
    return () => clearInterval(poll);
  }, [authed, eventId]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    const data = await getAdminEvent(eventId);
    if (data) {
      setWishList(data.wishes);
      setHasMore(data.wishes.length === 15);
      setLastRefreshed(new Date());
    }
    setRefreshing(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    const ok = await verifyAdminPassword(eventId, password);
    if (ok) {
      sessionStorage.setItem(SESSION_KEY(eventId), "1");
      const data = await getAdminEvent(eventId);
      setEvent(data);
      setWishList(data?.wishes ?? []);
      setHasMore((data?.wishes?.length ?? 0) === 15);
      setEditName(data?.personName ?? "");
      setEditDate(data?.birthDate ?? "");
      setEditTheme((data?.theme as ThemeId) ?? "confetti");
      setEditDeadline(
        data?.wishDeadline
          ? new Date(data.wishDeadline).toISOString().slice(0, 16)
          : "",
      );
      setEditTeaser(data?.teaserMessage ?? "");

      setEditAllowAnon(data?.allowAnonymous ?? true);
      if (data?.audioConfig && typeof data.audioConfig === "object") {
        const ac = data.audioConfig as any;
        setEditSelectedTrackId(ac.selectedTrackId ?? "");
        setEditAudioLoop(ac.loop ?? true);
        setEditAudioAutoplay(ac.autoplay ?? true);
      }

      setAuthed(true);
    } else {
      setAuthError("Incorrect password. Try again.");
    }
    setAuthLoading(false);
  };

  const handleDelete = async (wishId: string) => {
    if (confirmDeleteId !== wishId) {
      setConfirmDeleteId(wishId);
      setTimeout(
        () => setConfirmDeleteId((prev) => (prev === wishId ? null : prev)),
        4000,
      );
      return;
    }
    setConfirmDeleteId(null);
    setDeleteLoading(wishId);
    await deleteWish(wishId);
    setWishList((prev: NonNullable<EventData>["wishes"]) =>
      prev.filter((w: { id: string }) => w.id !== wishId),
    );
    setDeleteLoading(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let customUrl = undefined;
      let customTitle = undefined;

      // Upload new custom audio if one was selected
      if (editCustomAudioFile) {
        const formData = new FormData();
        formData.append("file", editCustomAudioFile);
        formData.append("type", "audio");
        const deviceId =
          localStorage.getItem("birthday_device_id") || "admin-edit";
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          headers: {
            "X-Device-Id": deviceId,
          },
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to upload audio.");
        }
        const data = await res.json();
        customUrl = data.url;
        customTitle = editCustomAudioFile.name;
        // The actions.ts updateEvent right now doesn't easily create a NEW AudioTrack relation
        // without an expanded backend update, but we will pass it into the audioConfig at least so the player works.
      }

      await updateEvent(eventId, {
        personName: editName,
        birthDate: editDate,
        theme: editTheme,
        wishDeadline: editDeadline || null,
        teaserMessage: editTeaser,
        allowAnonymous: editAllowAnon,
        audioConfig: {
          selectedTrackId: editSelectedTrackId,
          loop: editAudioLoop,
          autoplay: editAudioAutoplay,
          ...(customUrl && {
            customTrackUrl: customUrl,
            customTrackTitle: customTitle,
          }),
        },
      });
      setEvent((prev: EventData) =>
        prev
          ? {
              ...prev,
              personName: editName,
              birthDate: editDate,
              theme: editTheme,
              teaserMessage: editTeaser,
              allowAnonymous: editAllowAnon,
              audioConfig: {
                selectedTrackId: editSelectedTrackId,
                loop: editAudioLoop,
                autoplay: editAudioAutoplay,
                ...(customUrl && {
                  customTrackUrl: customUrl,
                  customTrackTitle: customTitle,
                }),
              },
            }
          : prev,
      );
      setEditMode(false);
      setEditCustomAudioFile(null); // clear file after save
    } catch (e: any) {
      alert(e.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-purple-200 opacity-60 animate-ping" />
          <Logo size="lg" />
        </div>
        <p className="font-adlam text-purple-600 text-lg animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-white shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <Logo size="lg" />
            <h1 className="text-xl font-bold text-gray-800 mt-4">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Enter your admin password to continue.
            </p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              id="admin-password-input"
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <button
              id="admin-login-btn"
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-purple-600 py-3 font-bold text-white shadow-lg hover:bg-purple-700 disabled:opacity-60 transition-all"
            >
              {authLoading ? (
                "Verifying..."
              ) : (
                <>
                  <Unlock size={18} /> Enter Dashboard
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const getDaysInfo = () => {
    // fall back to birthDate if no explicit deadline is set
    const deadline = event?.wishDeadline ?? event?.birthDate;
    if (!deadline) return { count: "—", label: "Days Left" };
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days > 1) {
      return { count: days.toString(), label: "Days Left" };
    } else if (days === 1) {
      return { count: "1", label: "Day Left" };
    } else if (days === 0) {
      return { count: "🎉", label: "It's Today!" };
    } else {
      return { count: "🎈", label: "Event Passed" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-16">
      {/* Sticky Top Navbar */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 md:px-5 py-3 mb-8 flex flex-row items-center justify-between sticky top-0 z-20">
        <Logo size="sm" />
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            title="Edit event settings"
          >
            {editMode ? <X size={18} /> : <Settings2 size={18} />}
          </button>
          <a
            href={`/surprise/${event.surpriseToken}`}
            target="_blank"
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-purple-600 px-3 sm:px-4 text-sm font-bold text-white hover:bg-purple-700 transition-colors"
          >
            <Eye size={16} /> <span className="hidden sm:inline">Preview</span>
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 md:px-8 flex flex-col gap-6">
        {/* Main Dashboard Hero Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-purple-100 via-purple-50/50 to-white p-8 shadow-sm border border-purple-100/50 flex flex-col items-center text-center">
          {/* Subtle background blur blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute top-10 -left-10 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

          <div className="relative z-10 mb-5 inline-flex items-center gap-1.5 rounded-full bg-purple-200/50 px-4 py-1 text-xs font-bold text-purple-700 uppercase tracking-widest">
            Celebration Dashboard
          </div>
          <h1 className="relative z-10 text-5xl font-adlam text-gray-900 mb-3 tracking-tight leading-none">
            {event.personName}
          </h1>
          <p className="relative z-10 text-[15px] font-medium text-gray-500 leading-relaxed max-w-sm mb-8">
            Management hub for {event.personName}&apos;s birthday surprise.
            Track wishes and manage access links effortlessly.
          </p>

          {/* Metric Cards — inline, not floating */}
          <div className="relative z-10 flex gap-4 w-full justify-center border-t border-purple-100/60 pt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm px-8 py-4 flex flex-col items-center justify-center border border-purple-100/50">
              <span className="text-3xl font-black text-purple-600 mb-0.5">
                {event?._count?.wishes ?? wishList.length}
              </span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Wishes
              </span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm px-8 py-4 flex flex-col items-center justify-center border border-purple-100/50">
              <span
                className="text-3xl font-black text-purple-500 mb-0.5"
                title={getDaysInfo().label}
              >
                {getDaysInfo().count}
              </span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {getDaysInfo().label}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Mode Panel */}
        {editMode && (
          <div className="rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 animate-fade-in-up space-y-4">
            <h2 className="font-bold text-gray-800 text-lg mb-2">
              Edit Event Details
            </h2>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                Name
              </label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-2xl border-2 border-gray-100 px-4 py-3 text-sm focus:border-purple-300 focus:bg-purple-50/50 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                Birthday Display
              </label>
              <input
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full rounded-2xl border-2 border-gray-100 px-4 py-3 text-sm focus:border-purple-300 focus:bg-purple-50/50 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                Theme
              </label>
              <div className="flex flex-nowrap overflow-x-auto gap-3 pb-2 custom-scrollbar">
                {Object.values(THEMES).map((t) => {
                  const imgMap: Record<string, string> = {
                    confetti: "/images/theme-confetti-carnival.png",
                    midnight: "/images/theme-midnight-star.png",
                  };
                  const imgSrc = imgMap[t.id];
                  return (
                    <button
                      key={t.id}
                      onClick={() => setEditTheme(t.id)}
                      className={`flex shrink-0 w-[180px] sm:w-[220px] items-center gap-2.5 rounded-2xl border-2 px-3 py-2.5 text-sm font-semibold transition-all text-left ${
                        editTheme === t.id
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-100 text-gray-600 hover:border-purple-200"
                      }`}
                    >
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={t.name}
                          width={56}
                          height={36}
                          className="h-9 w-14 rounded-lg object-cover shrink-0"
                          unoptimized
                        />
                      ) : (
                        <span className="text-xl">{t.emoji}</span>
                      )}
                      <span className="leading-tight">{t.name}</span>
                      {editTheme === t.id && (
                        <Check
                          size={14}
                          className="ml-auto shrink-0 text-purple-600"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                Wish Deadline
              </label>
              <input
                type="datetime-local"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                className="w-full rounded-2xl border-2 border-gray-100 px-4 py-3 text-sm focus:border-purple-300 focus:bg-purple-50/50 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                Teaser Message
              </label>
            </div>

            {/* Audio Settings Block */}
            <div className="pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Background Music
              </label>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {DEFAULT_AUDIO_TRACKS.map((t) => {
                  const isSelected =
                    editSelectedTrackId === t.id && !editCustomAudioFile;
                  const isPreviewing = previewingTrackId === t.id;

                  const handlePreview = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    const audio = previewAudioRef.current;
                    if (isPreviewing) {
                      audio?.pause();
                      setPreviewingTrackId(null);
                    } else {
                      if (audio) {
                        audio.pause();
                        audio.src = t.url;
                        audio.volume = 0.6;
                        audio.play();
                        audio.onended = () => setPreviewingTrackId(null);
                      }
                      setPreviewingTrackId(t.id);
                    }
                  };

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setEditSelectedTrackId(t.id);
                        setEditCustomAudioFile(null);
                      }}
                      className={`w-full flex items-center gap-3 rounded-2xl border-2 px-3 py-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-100 hover:border-purple-200"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br ${t.gradient ?? "from-purple-400 to-pink-500"} flex items-center justify-center shadow-sm`}
                      >
                        <Music2 size={14} className="text-white" />
                      </div>
                      <p className="flex-1 font-semibold text-gray-800 text-xs">
                        {t.title}
                      </p>
                      {isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handlePreview}
                        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                          isPreviewing
                            ? "bg-purple-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-400 hover:bg-purple-100 hover:text-purple-600"
                        }`}
                      >
                        {isPreviewing ? (
                          <Pause size={12} />
                        ) : (
                          <Play size={12} />
                        )}
                      </button>
                    </div>
                  );
                })}

                {/* Custom Upload */}
                <label
                  className={`w-full flex items-center gap-3 rounded-2xl border-2 px-3 py-2 cursor-pointer transition-all ${
                    editCustomAudioFile
                      ? "border-purple-500 bg-purple-50"
                      : "border-dashed border-gray-200 hover:border-purple-200"
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 shrink-0">
                    <Upload size={14} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-xs truncate max-w-[180px]">
                      {editCustomAudioFile?.name ?? "Upload your own..."}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      MP3/WAV, max 10MB
                    </p>
                  </div>
                  {editCustomAudioFile && (
                    <span className="text-purple-600 font-bold mx-2">✓</span>
                  )}
                  <input
                    type="file"
                    accept="audio/mp3,audio/mpeg,audio/wav"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditCustomAudioFile(file);
                        setEditSelectedTrackId("");
                      }
                    }}
                  />
                </label>
              </div>

              {/* Loop / Autoplay subsettings */}
              <div className="mt-3 space-y-3 rounded-2xl bg-gray-50 border border-gray-100 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">
                    Loop playback
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditAudioLoop(!editAudioLoop)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${editAudioLoop ? "bg-purple-500" : "bg-gray-300"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${editAudioLoop ? "translate-x-5" : ""}`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">
                    Autoplay when opened
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditAudioAutoplay(!editAudioAutoplay)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${editAudioAutoplay ? "bg-purple-500" : "bg-gray-300"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${editAudioAutoplay ? "translate-x-5" : ""}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Security Profile
              </label>
              <div className="flex items-center justify-between rounded-2xl border-2 border-gray-100 px-4 py-3">
                <div>
                  <span className="text-sm font-semibold text-gray-700 block">
                    Anonymous Wishes
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Let users post without real names.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditAllowAnon(!editAllowAnon)}
                  className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${editAllowAnon ? "bg-[#0bb385]" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${editAllowAnon ? "translate-x-5" : ""}`}
                  />
                </button>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-6 py-3 font-bold text-white text-sm hover:bg-purple-700 disabled:opacity-60 transition-all"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={15} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Desktop two-column grid: hero+edit on left, links+wishes fill right */}

        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Link2 size={18} className="text-purple-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Access Links
                </h2>
              </div>
              {[
                {
                  label: "Wish Form",
                  desc: "Share with team",
                  token: event.wishToken,
                  key: "wish",
                  path: "wish",
                  iconColor: "text-pink-500",
                },
                {
                  label: "Surprise Page",
                  desc: "Open on birthday",
                  token: event.surpriseToken,
                  key: "surprise",
                  path: "surprise",
                  iconColor: "text-purple-500",
                },
              ].map((l) => (
                <div key={l.key} className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                    {l.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600 font-mono truncate">
                      {`${base}/${l.path}/${l.token}`}
                    </div>
                    <button
                      onClick={() =>
                        copy(`${base}/${l.path}/${l.token}`, l.key)
                      }
                      className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                        copied === l.key
                          ? "bg-emerald-500 text-white"
                          : "bg-purple-600 text-white hover:bg-purple-700"
                      }`}
                    >
                      {copied === l.key ? (
                        <>
                          <Check size={14} /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">{l.desc}</p>
                </div>
              ))}

              {/* Quick Tip Box */}
              <div className="flex items-start gap-3 rounded-2xl bg-purple-50 p-4">
                <div className="mt-0.5 rounded-xl bg-purple-600 p-1.5 text-white shrink-0">
                  <Sparkles size={14} />
                </div>
                <div>
                  <p className="font-bold text-sm text-purple-800 mb-0.5">
                    Quick Tip
                  </p>
                  <p className="text-xs font-medium leading-relaxed text-purple-700/80">
                    Include the Wish Form link in your group chat to get more
                    surprises before the deadline!
                  </p>
                </div>
              </div>
            </div>

            {/* Wishes List Feed */}
            <div className="rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col max-h-[600px] overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5 shrink-0">
                <div className="flex items-center gap-2">
                  <Mailbox size={18} className="text-purple-500" />
                  <h2 className="text-lg font-bold text-gray-800">
                    Submitted Wishes
                  </h2>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                </div>
                <div className="flex flex-1 sm:flex-none items-center justify-end gap-3 min-w-[200px]">
                  {lastRefreshed && (
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                      Last updated:{" "}
                      {lastRefreshed.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  <button
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                  >
                    <RefreshCw
                      size={13}
                      className={refreshing ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="space-y-5 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {wishList.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <MessageCircleHeart
                      size={32}
                      className="mx-auto text-gray-200 mb-3"
                    />
                    <p className="text-sm font-medium">
                      No wishes yet. Share the link!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wishList.map(
                      (
                        w: NonNullable<EventData>["wishes"][number],
                        idx: number,
                      ) => {
                        const isLast = idx === wishList.length - 1;
                        return (
                          <div
                            key={w.id}
                            ref={isLast ? lastWishElementRef : null}
                            className="group border-b border-gray-50 last:border-0 pb-4 last:pb-0"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 text-sm">
                                  {w.wisherName}
                                </p>
                                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed italic">
                                  &ldquo;{w.message}&rdquo;
                                </p>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">
                                  {new Date(w.submittedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </p>
                              </div>
                              {confirmDeleteId === w.id ? (
                                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                                  <button
                                    onClick={() => handleDelete(w.id)}
                                    disabled={deleteLoading === w.id}
                                    className="rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition-colors"
                                  >
                                    {deleteLoading === w.id ? "..." : "Confirm"}
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleDelete(w.id)}
                                  disabled={deleteLoading === w.id}
                                  className="mt-0.5 shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                                  title="Delete wish"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                    {loadingMore && (
                      <div className="py-4 text-center text-xs font-semibold text-gray-400 animate-pulse">
                        Loading more wishes...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* end desktop grid */}
        </div>
      </div>
    </div>
  );
}
