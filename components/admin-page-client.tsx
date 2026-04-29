"use client";

import { useState, useEffect } from "react";
import {
  verifyAdminPassword,
  getAdminEvent,
  deleteWish,
  updateEvent,
} from "@/app/actions";
import { THEMES, ThemeId } from "@/lib/themes";
import { Logo } from "@/components/logo";

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
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTheme, setEditTheme] = useState<ThemeId>("confetti");
  const [editDeadline, setEditDeadline] = useState("");
  const [editTeaser, setEditTeaser] = useState("");
  const [wishList, setWishList] = useState<NonNullable<EventData>["wishes"]>(
    [],
  );

  const base = typeof window !== "undefined" ? window.location.origin : "";

  // Restore auth from sessionStorage on mount
  useEffect(() => {
    const wasAuthed = sessionStorage.getItem(SESSION_KEY(eventId));
    if (wasAuthed === "1") {
      getAdminEvent(eventId).then((data) => {
        if (data) {
          setEvent(data);
          setWishList(data.wishes);
          setEditName(data.personName);
          setEditDate(data.birthDate);
          setEditTheme((data.theme as ThemeId) ?? "confetti");
          setEditDeadline(
            data.wishDeadline
              ? new Date(data.wishDeadline).toISOString().slice(0, 16)
              : "",
          );
          setEditTeaser(data.teaserMessage ?? "");
          setAuthed(true);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [eventId]);

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
      setEditName(data?.personName ?? "");
      setEditDate(data?.birthDate ?? "");
      setEditTheme((data?.theme as ThemeId) ?? "confetti");
      setEditDeadline(
        data?.wishDeadline
          ? new Date(data.wishDeadline).toISOString().slice(0, 16)
          : "",
      );
      setEditTeaser(data?.teaserMessage ?? "");
      setAuthed(true);
    } else {
      setAuthError("Incorrect password. Try again.");
    }
    setAuthLoading(false);
  };

  const handleDelete = async (wishId: string) => {
    setDeleteLoading(wishId);
    await deleteWish(wishId);
    setWishList((prev: NonNullable<EventData>["wishes"]) =>
      prev.filter((w: { id: string }) => w.id !== wishId),
    );
    setDeleteLoading(null);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateEvent(eventId, {
      personName: editName,
      birthDate: editDate,
      theme: editTheme,
      wishDeadline: editDeadline || null,
      teaserMessage: editTeaser,
    });
    setEvent((prev: EventData) =>
      prev
        ? {
            ...prev,
            personName: editName,
            birthDate: editDate,
            theme: editTheme,
            teaserMessage: editTeaser,
          }
        : prev,
    );
    setEditMode(false);
    setSaving(false);
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-2xl animate-pulse">✨</div>
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
              className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 py-3 font-bold text-white shadow-lg hover:scale-105 disabled:opacity-60 disabled:scale-100 transition-all"
            >
              {authLoading ? "Verifying..." : "🔓 Enter Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Logo size="sm" />
            <h1 className="text-2xl font-bold text-gray-800 mt-1">
              Admin Dashboard
            </h1>
          </div>
          <a
            href={`/surprise/${event.surpriseToken}`}
            target="_blank"
            className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:scale-105 transition-all"
          >
            👁️ Preview Surprise
          </a>
        </div>

        {/* Event Info Card */}
        <div className="rounded-3xl bg-white shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                🎂 {event.personName}&apos;s Birthday
              </h2>
              <p className="text-sm text-gray-400">
                {event.birthDate} · Theme:{" "}
                {THEMES[event.theme as ThemeId]?.name ?? event.theme}
              </p>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {editMode ? "Cancel" : "✏️ Edit"}
            </button>
          </div>

          {editMode && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Name
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Birthday Display
                </label>
                <input
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(THEMES).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setEditTheme(t.id)}
                      className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all ${editTheme === t.id ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-100 text-gray-600 hover:border-purple-200"}`}
                    >
                      {t.emoji} {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Wish Deadline
                </label>
                <input
                  type="datetime-local"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Teaser Message
                </label>
                <input
                  value={editTeaser}
                  onChange={(e) => setEditTeaser(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 outline-none"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 py-2.5 font-bold text-white text-sm hover:scale-105 disabled:opacity-60 disabled:scale-100 transition-all"
              >
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Links Card */}
        <div className="rounded-3xl bg-white shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-800">🔗 Your Links</h2>
          {[
            {
              label: "💌 Wish Form",
              desc: "Share with team",
              token: event.wishToken,
              key: "wish",
              path: "wish",
            },
            {
              label: "🎉 Surprise Page",
              desc: "Open on birthday",
              token: event.surpriseToken,
              key: "surprise",
              path: "surprise",
            },
          ].map((l) => (
            <div
              key={l.key}
              className="rounded-2xl bg-gray-50 border border-gray-100 p-4"
            >
              <p className="text-xs font-bold text-gray-500 mb-0.5">
                {l.label}{" "}
                <span className="font-normal text-gray-400">· {l.desc}</span>
              </p>
              <div className="flex items-center gap-2 mt-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
                <code className="flex-1 text-xs text-gray-600 break-all">
                  {base}/{l.path}/{l.token}
                </code>
                <button
                  id={`copy-${l.key}`}
                  onClick={() => copy(`${base}/${l.path}/${l.token}`, l.key)}
                  className="rounded-lg bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600 hover:bg-purple-100 transition-colors whitespace-nowrap"
                >
                  {copied === l.key ? "✓ Copied!" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Wishes */}
        <div className="rounded-3xl bg-white shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">💌 Submitted Wishes</h2>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
              {wishList.length} {wishList.length === 1 ? "wish" : "wishes"}
            </span>
          </div>

          {wishList.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-sm">
                No wishes yet. Share the wish form link!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {wishList.map((wish) => (
                <div
                  key={wish.id}
                  className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">
                      {wish.wisherName}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                      {wish.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(wish.submittedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(wish.id)}
                    disabled={deleteLoading === wish.id}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    {deleteLoading === wish.id ? "..." : "🗑️ Delete"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
