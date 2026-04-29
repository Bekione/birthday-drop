"use client";

import { useState } from "react";
import { submitWish } from "@/app/wish/[token]/actions";
import { Logo } from "@/components/logo";

interface WishFormProps {
  token: string;
  personName: string;
  birthDate: string;
  teaserMessage: string | null;
  allowAnonymous: boolean;
  wishCount: number;
  isExpired: boolean;
}

export function WishForm({
  token,
  personName,
  birthDate,
  teaserMessage,
  allowAnonymous,
  wishCount,
  isExpired,
}: WishFormProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [liveCount, setLiveCount] = useState(wishCount);

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">🎂</div>
          <h1 className="text-3xl font-[var(--font-pacifico)] text-purple-700 mb-3">
            Wishes are closed!
          </h1>
          <p className="text-gray-500">
            The wish collection for <strong>{personName}</strong>&apos;s
            birthday has ended.
            <br />
            The surprise is already being revealed! 🎉
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center animate-slide-up">
          <div className="text-7xl mb-4 animate-bounce">🥳</div>
          <h1 className="text-3xl font-[var(--font-pacifico)] text-purple-700 mb-3">
            Wish submitted!
          </h1>
          <p className="text-gray-500 mb-6">
            Your birthday wish for <strong>{personName}</strong> has been saved.
            They&apos;ll see it on the big day! 🎉
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-5 py-2 text-sm font-semibold text-purple-700">
            🎈 {liveCount} {liveCount === 1 ? "wish" : "wishes"} submitted so
            far!
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please write a birthday message!");
      return;
    }
    if (!allowAnonymous && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await submitWish(
      token,
      name.trim() || "Anonymous",
      message.trim(),
    );
    if (result.success) {
      setSubmitted(true);
      setLiveCount((c) => c + 1);
    } else {
      setError(result.error ?? "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Floating emojis */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {["🎂", "🎈", "🎉", "🥳", "💖", "⭐", "🎁", "🎊"].map((e, i) => (
          <span
            key={i}
            className="absolute text-xl opacity-40 select-none animate-float-star"
            style={
              {
                top: `${5 + ((i * 13) % 85)}%`,
                left: `${5 + ((i * 11) % 90)}%`,
                "--animation-duration": `${5 + (i % 5)}s`,
                animationDelay: `${i * 0.7}s`,
              } as React.CSSProperties
            }
          >
            {e}
          </span>
        ))}
      </div>

      <div className="relative w-full max-w-lg">
        {/* Live counter badge */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-purple-100 px-5 py-2 text-sm font-semibold text-purple-700 shadow-sm">
            🎈 <span id="wish-count">{liveCount}</span>{" "}
            {liveCount === 1 ? "wish" : "wishes"} submitted so far!
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-8 text-white text-center">
            <p className="text-4xl mb-3">🎂</p>
            <h1 className="text-2xl font-[var(--font-pacifico)] mb-1">
              Happy Birthday, {personName}!
            </h1>
            <p className="text-sm text-white/80">{birthDate}</p>
            {teaserMessage && (
              <p className="mt-3 text-sm text-white/90 bg-white/10 rounded-xl px-4 py-2">
                {teaserMessage}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Name{" "}
                {allowAnonymous && (
                  <span className="text-gray-400 font-normal">(optional)</span>
                )}
              </label>
              <input
                id="wisher-name"
                type="text"
                placeholder={allowAnonymous ? "Anonymous" : "Your name here..."}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Birthday Message *
              </label>
              <textarea
                id="wish-message"
                placeholder={`Write something special for ${personName}... 💖`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={300}
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
              />
              <p className="text-right text-xs text-gray-400 mt-1">
                {message.length}/300
              </p>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              id="submit-wish"
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 py-4 font-bold text-white shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 transition-all duration-200 text-lg"
            >
              {loading ? "Sending... ✨" : "🎉 Send Birthday Wish!"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Powered by
          <br />
          <span className="inline-block mt-2">
            <Logo size="sm" />
          </span>
        </p>
      </div>
    </div>
  );
}
