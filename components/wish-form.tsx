"use client";

import { useState } from "react";
import { submitWish } from "@/app/wish/[token]/actions";
import { Logo } from "@/components/logo";
import {
  Send,
  Cake,
  PartyPopper,
  MessageCircleHeart,
  Clock,
  Info,
  CalendarHeart,
} from "lucide-react";

interface WishFormProps {
  token: string;
  personName: string;
  birthDate: string;
  teaserMessage: string | null;
  allowAnonymous: boolean;
  wishCount: number;
  isExpired: boolean;
}

/** Small confetti pieces scattered around the background */
const CONFETTI = [
  {
    shape: "rect",
    w: 10,
    h: 4,
    top: 8,
    left: 6,
    rot: 20,
    color: "#f97316",
    delay: 0,
  },
  {
    shape: "circle",
    w: 6,
    h: 6,
    top: 15,
    left: 18,
    rot: 0,
    color: "#a855f7",
    delay: 0.4,
  },
  {
    shape: "rect",
    w: 12,
    h: 5,
    top: 5,
    left: 35,
    rot: -15,
    color: "#ec4899",
    delay: 0.8,
  },
  {
    shape: "star",
    w: 8,
    h: 8,
    top: 10,
    left: 55,
    rot: 30,
    color: "#eab308",
    delay: 1.2,
  },
  {
    shape: "rect",
    w: 8,
    h: 3,
    top: 20,
    left: 72,
    rot: -30,
    color: "#06b6d4",
    delay: 0.3,
  },
  {
    shape: "circle",
    w: 7,
    h: 7,
    top: 7,
    left: 88,
    rot: 0,
    color: "#f43f5e",
    delay: 1.6,
  },
  {
    shape: "rect",
    w: 14,
    h: 5,
    top: 75,
    left: 4,
    rot: 10,
    color: "#8b5cf6",
    delay: 0.6,
  },
  {
    shape: "star",
    w: 9,
    h: 9,
    top: 82,
    left: 22,
    rot: -20,
    color: "#f97316",
    delay: 2,
  },
  {
    shape: "rect",
    w: 8,
    h: 3,
    top: 68,
    left: 62,
    rot: 45,
    color: "#10b981",
    delay: 1,
  },
  {
    shape: "circle",
    w: 5,
    h: 5,
    top: 85,
    left: 80,
    rot: 0,
    color: "#ec4899",
    delay: 1.8,
  },
  {
    shape: "rect",
    w: 10,
    h: 4,
    top: 78,
    left: 92,
    rot: -10,
    color: "#a855f7",
    delay: 0.5,
  },
  {
    shape: "star",
    w: 7,
    h: 7,
    top: 40,
    left: 3,
    rot: 60,
    color: "#eab308",
    delay: 2.4,
  },
  {
    shape: "rect",
    w: 11,
    h: 4,
    top: 50,
    left: 95,
    rot: 25,
    color: "#f43f5e",
    delay: 0.9,
  },
  {
    shape: "circle",
    w: 6,
    h: 6,
    top: 60,
    left: 42,
    rot: 0,
    color: "#06b6d4",
    delay: 1.4,
  },
];

/** Birthday emojis that float gently in the background */
const EMOJIS = [
  { emoji: "🎂", top: 5, left: 12, size: 28, delay: 0.3, duration: 7 },
  { emoji: "🎉", top: 14, left: 42, size: 22, delay: 1.2, duration: 8 },
  { emoji: "🎈", top: 3, left: 70, size: 26, delay: 0.7, duration: 6 },
  { emoji: "⭐", top: 22, left: 88, size: 20, delay: 1.8, duration: 9 },
  { emoji: "🎁", top: 75, left: 8, size: 24, delay: 0.5, duration: 7.5 },
  { emoji: "💜", top: 82, left: 30, size: 18, delay: 2.1, duration: 8 },
  { emoji: "✨", top: 70, left: 55, size: 22, delay: 0.9, duration: 6.5 },
  { emoji: "🥳", top: 80, left: 80, size: 26, delay: 1.5, duration: 9 },
  { emoji: "🎊", top: 40, left: 2, size: 20, delay: 2.5, duration: 7 },
  { emoji: "💫", top: 45, left: 97, size: 18, delay: 1.1, duration: 8.5 },
];

function renderConfetti() {
  return CONFETTI.map((c, i) => {
    let shapePath;
    if (c.shape === "rect") {
      shapePath = <rect width={c.w} height={c.h} rx={2} fill={c.color} />;
    } else if (c.shape === "circle") {
      shapePath = (
        <circle cx={c.w / 2} cy={c.h / 2} r={c.w / 2} fill={c.color} />
      );
    } else {
      shapePath = (
        <path
          d="M4 0l1.22 2.48 2.78.4-2.02 1.96.48 2.76L4 6.32 1.54 7.6l.48-2.76-2.02-1.96 2.78-.4z"
          fill={c.color}
          transform={`scale(${c.w / 8})`}
        />
      );
    }

    return (
      <svg
        key={i}
        width={c.w}
        height={c.h}
        viewBox={`0 0 ${c.w} ${c.h}`}
        className="absolute opacity-60 animate-float-star select-none"
        style={
          {
            top: `${c.top}%`,
            left: `${c.left}%`,
            transform: `rotate(${c.rot}deg)`,
            "--animation-duration": `${6 + (i % 4)}s`,
            animationDelay: `${c.delay}s`,
          } as React.CSSProperties
        }
      >
        {shapePath}
      </svg>
    );
  });
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
        <div className="max-w-md text-center p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
          <div className="flex justify-center mb-6">
            <Clock size={64} className="text-purple-600 animate-pulse" />
          </div>
          <h1 className="text-3xl font-[var(--font-pacifico)] text-purple-700 mb-3">
            Wishes are closed!
          </h1>
          <p className="text-gray-500">
            The wish collection for <strong>{personName}</strong>&apos;s
            birthday has ended.
            <br />
            The surprise is already being revealed!
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md animate-slide-up bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex justify-center mb-6">
            <PartyPopper size={80} className="text-pink-500 animate-bounce" />
          </div>
          <h1 className="text-3xl font-[var(--font-pacifico)] text-purple-700 mb-3">
            Wish submitted!
          </h1>
          <p className="text-gray-500 mb-6">
            Your birthday wish for <strong>{personName}</strong> has been saved.
            They&apos;ll see it on the big day!
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-5 py-2 text-sm font-semibold text-purple-700">
            <MessageCircleHeart size={16} /> {liveCount}{" "}
            {liveCount === 1 ? "wish" : "wishes"} submitted so far!
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
      {/* SVG Confetti Scatter */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {renderConfetti()}
        {/* Emoji floaters mixed with confetti */}
        {EMOJIS.map((e, i) => (
          <span
            key={`emoji-${i}`}
            className="absolute select-none animate-float-star"
            style={
              {
                top: `${e.top}%`,
                left: `${e.left}%`,
                fontSize: `${e.size}px`,
                opacity: 0.55,
                animationDelay: `${e.delay}s`,
                "--animation-duration": `${e.duration}s`,
              } as React.CSSProperties
            }
          >
            {e.emoji}
          </span>
        ))}
      </div>

      <div className="relative w-full max-w-2xl z-10 flex flex-col md:flex-row gap-6 items-start">
        {/* Main Form Card */}
        <div className="flex-1 rounded-3xl bg-white/90 backdrop-blur-md p-8 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white/50">
          <div className="mb-6 flex flex-col items-center justify-center text-center">
            <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-600 shadow-lg">
              <span className="absolute -inset-1 animate-spin-slow rounded-full bg-gradient-to-tr from-pink-400/30 to-purple-500/30 blur-md"></span>
              <Cake size={36} className="text-white relative z-10" />
            </div>
            <h1 className="text-3xl font-adlam text-purple-700">
              {personName}&apos;s Surprise!
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-medium px-4">
              {teaserMessage ||
                "Leave a warm birthday message to be included in the grand reveal."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label
                htmlFor="name"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-purple-400 transition-colors group-focus-within:text-purple-600"
              >
                Your Name {allowAnonymous && "(Optional)"}
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Jane Doe"
                className="w-full rounded-2xl border-2 border-purple-50 bg-white px-5 py-3.5 text-gray-800 outline-none transition-all focus:border-purple-300 focus:bg-purple-50/30 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.1)]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
              />
            </div>

            <div className="group">
              <label
                htmlFor="message"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-purple-400 transition-colors group-focus-within:text-purple-600"
              >
                Birthday Wish
              </label>
              <textarea
                id="message"
                rows={4}
                placeholder="Write something nice..."
                className="w-full resize-none rounded-2xl border-2 border-purple-50 bg-white px-5 py-3.5 text-gray-800 outline-none transition-all focus:border-purple-300 focus:bg-purple-50/30 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.1)]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
              />
              <div className="mt-1.5 flex justify-end">
                <span className="text-[11px] font-medium text-gray-400">
                  {message.length} / 500
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm animate-fade-in-up">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-purple-600 px-6 py-4 font-bold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl disabled:pointer-events-none disabled:opacity-70"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
              {loading ? (
                "Sending..."
              ) : (
                <>
                  Send Wish
                  <Send
                    size={18}
                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </>
              )}
            </button>
          </form>
        </div>

        {/* What Happens Next? Info Panel */}
        <div className="w-full md:w-64 shrink-0 rounded-3xl bg-white/85 backdrop-blur-md p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white/50 space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Info size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                What Happens Next?
              </h3>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            All wishes are being collected for the grand reveal on{" "}
            <strong className="text-purple-700">{birthDate}</strong>.{" "}
            <strong>{personName}</strong> will see your beautiful message as
            part of a curated surprise feed!
          </p>
          <div className="flex items-center gap-2 rounded-2xl bg-purple-50 px-4 py-3">
            <CalendarHeart size={16} className="text-purple-500 shrink-0" />
            <p className="text-xs font-semibold text-purple-700">
              {liveCount} {liveCount === 1 ? "person has" : "people have"}{" "}
              already sent a wish 🎉
            </p>
          </div>
        </div>
      </div>

      {/* Powered by footer */}
      <p className="relative z-10 mt-8 text-center text-xs text-gray-400">
        Powered by{" "}
        <a
          href="/"
          className="font-semibold text-purple-500 hover:text-purple-700 transition-colors"
        >
          BirthdayDrop
        </a>
      </p>
    </div>
  );
}
