"use client";

import { useState } from "react";
import Image from "next/image";
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
  Sparkles,
} from "lucide-react";

interface WishFormProps {
  token: string;
  personName: string;
  personPhotoUrl?: string | null;
  birthDate: string;
  celebrationType?: string | null;
  customHeading?: string | null;
  teaserMessage: string | null;
  allowAnonymous: boolean;
  wishCount: number;
  isExpired: boolean;
  wishDeadline?: string | null;
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

/** Ambient floating SVG icons with distinct, calm motion profiles */
const WISH_FORM_FLOATING_ICONS = [
  { src: "/icons/birthday-cake.svg", alt: "Cake", top: 6, left: 10, size: 34, anim: "animate-ambient-drift", dur: 13, delay: -4.1, opacity: 0.75 },
  { src: "/icons/party-popper.svg", alt: "Popper", top: 14, left: 45, size: 28, anim: "animate-calm-sway", dur: 14.5, delay: -7.2, opacity: 0.7 },
  { src: "/icons/star.svg", alt: "Star", top: 8, left: 78, size: 24, anim: "animate-soft-float", dur: 11, delay: -2.5, opacity: 0.65 },
  { src: "/icons/gift-box.svg", alt: "Gift", top: 76, left: 7, size: 32, anim: "animate-petal-drift", dur: 15, delay: -8.8, opacity: 0.75 },
  { src: "/icons/sparkles.svg", alt: "Sparkles", top: 70, left: 52, size: 26, anim: "animate-ambient-wander", dur: 12.5, delay: -3.4, opacity: 0.7 },
  { src: "/icons/party-face.svg", alt: "Party", top: 80, left: 85, size: 32, anim: "animate-ambient-drift", dur: 16, delay: -5.9, opacity: 0.75 },
  { src: "/icons/love-letter.svg", alt: "Letter", top: 42, left: 3, size: 28, anim: "animate-soft-float", dur: 13.5, delay: -9.1, opacity: 0.65 },
  { src: "/icons/candle.svg", alt: "Candle", top: 44, left: 95, size: 26, anim: "animate-petal-drift", dur: 14, delay: -1.7, opacity: 0.65 },
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
        className="absolute opacity-60 animate-float-star select-none pointer-events-none"
        style={
          {
            top: `${c.top}%`,
            left: `${c.left}%`,
            transform: `rotate(${c.rot}deg)`,
            "--animation-duration": `${11 + (i % 5)}s`,
            animationDelay: `-${(c.delay + 1) * 2.5}s`,
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
  personPhotoUrl,
  birthDate,
  celebrationType,
  customHeading,
  teaserMessage,
  allowAnonymous,
  wishCount,
  isExpired,
  wishDeadline,
}: WishFormProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [liveCount, setLiveCount] = useState(wishCount);

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-hidden">
        {/* Corner Pennant Banners */}
        <Image
          src="/images/pennant-banner-left.png"
          alt="party pennant banner"
          width={360}
          height={130}
          className="absolute top-0 left-0 object-contain pointer-events-none z-10 opacity-90"
          style={{
            transform: "rotate(-3deg) translateX(-15px) translateY(-8px)",
          }}
          priority
        />
        <Image
          src="/images/pennant-banner-right.png"
          alt="party pennant banner"
          width={360}
          height={130}
          className="absolute top-0 right-0 object-contain pointer-events-none z-10 opacity-90"
          style={{
            transform: "rotate(3deg) translateX(15px) translateY(-8px)",
          }}
          priority
        />

        {/* Floating confetti & icons in background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          {renderConfetti()}
          {WISH_FORM_FLOATING_ICONS.map((item, i) => (
            <div
              key={`closed-icon-${i}`}
              className={`absolute select-none pointer-events-none ${item.anim}`}
              style={
                {
                  top: `${item.top}%`,
                  left: `${item.left}%`,
                  opacity: item.opacity,
                  filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.06))",
                  animationDelay: `${item.delay}s`,
                  "--animation-duration": `${item.dur}s`,
                } as React.CSSProperties
              }
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={item.size}
                height={item.size}
                className="object-contain"
              />
            </div>
          ))}
        </div>

        {/* Top Brand Bar */}
        <header className="relative z-20 w-full max-w-4xl flex items-center justify-between pt-2 pb-6">
          <a href="/" className="transition-transform hover:scale-105">
            <Logo size="sm" />
          </a>
          <a
            href="/setup"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-md px-4 py-2 text-xs font-bold text-purple-700 shadow-sm border border-purple-200 transition-all hover:scale-105"
          >
            <PartyPopper size={14} /> Create a Surprise
          </a>
        </header>

        {/* Main Content Area */}
        <main className="relative z-10 w-full max-w-xl flex flex-col items-center gap-6 my-auto py-6">
          {/* Closed Status Card */}
          <div className="w-full text-center p-8 sm:p-10 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/80 animate-slide-up">
            {/* Avatar or Birthday Cake Centerpiece */}
            {personPhotoUrl ? (
              <div className="relative mx-auto mb-6 h-28 w-28">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 blur-sm animate-pulse" />
                <div className="relative h-28 w-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-purple-50">
                  <Image
                    src={personPhotoUrl}
                    alt={personName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-6">
                <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center shadow-inner border border-purple-200">
                  <Cake size={48} className="text-purple-600 animate-bounce" />
                </div>
              </div>
            )}

            <h1
              className="text-3xl sm:text-4xl font-extrabold text-purple-800 mb-3 flex items-center justify-center gap-2"
              style={{ fontFamily: "var(--font-pacifico)" }}
            >
              <span>Wishes are closed!</span>
              <Image src="/icons/birthday-cake.svg" width={36} height={36} alt="Cake" className="inline align-middle" />
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 max-w-md mx-auto">
              The secret wish collection for <strong>{personName}</strong>&apos;s
              birthday has concluded.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100/80 px-4 py-2 text-xs font-bold text-purple-700 shadow-sm">
              <Sparkles size={14} className="text-purple-600" />
              <span>The surprise is already being revealed!</span>
              <Image src="/icons/sparkles.svg" width={16} height={16} alt="Sparkles" className="inline align-middle" />
            </div>
            {wishCount > 0 && (
              <p className="text-xs font-semibold text-gray-500 mt-3 flex items-center justify-center gap-1.5">
                <Image src="/icons/love-letter.svg" width={16} height={16} alt="Letter" className="inline align-middle" />
                <span>{wishCount} heartfelt {wishCount === 1 ? "wish" : "wishes"} collected from friends & loved ones!</span>
              </p>
            )}
          </div>

          {/* Viral Call-to-Action Card */}
          <div className="w-full text-center p-6 sm:p-8 bg-gradient-to-br from-white/95 to-purple-50/90 backdrop-blur-md rounded-3xl border border-purple-200/80 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-[11px] font-black uppercase tracking-wider mb-3">
              <PartyPopper size={12} /> Host Your Own Celebration
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 flex items-center justify-center gap-2">
              <span>Planning a birthday surprise for someone special?</span>
              <Image src="/icons/gift-box.svg" width={26} height={26} alt="Gift" className="inline align-middle" />
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-6 font-medium leading-relaxed max-w-md mx-auto">
              Create a custom surprise board, collect secret wishes from everyone, and reveal an unforgettable interactive celebration with music, cake blowing & party mode!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/setup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-7 py-3 text-sm font-black text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Image src="/icons/party-popper.svg" width={18} height={18} alt="Party" />
                <span>Create a BirthdayDrop for Free →</span>
              </a>
              <a
                href="/#live-demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-gray-50 px-6 py-3 text-xs font-bold text-gray-700 border border-gray-200 shadow-sm transition-all hover:scale-105"
              >
                👀 See Live Demo
              </a>
            </div>

            {/* Feature Highlights Row */}
            <div className="mt-6 pt-5 border-t border-purple-100/80 flex flex-wrap items-center justify-center gap-4 text-[11px] font-bold text-gray-500">
              <span className="flex items-center gap-1">🔒 100% Secret Link</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">🎵 Custom Music</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Image src="/icons/candle.svg" width={14} height={14} alt="Candle" /> Blowable Candles
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Image src="/icons/party-face.svg" width={14} height={14} alt="Party" /> Epic Party Mode
              </span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-20 py-4 text-center">
          <a
            href="/"
            className="text-xs font-semibold text-gray-400 hover:text-purple-600 transition-colors"
          >
            Powered by BirthdayDrop &bull; Free Birthday Celebrations
          </a>
        </footer>
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
            Your birthday wish for <strong>{personName}</strong>&nbsp; has been saved.
            They&apos;ll see it on the big day!
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-5 py-2 text-sm font-semibold text-purple-700">
            <MessageCircleHeart size={16} /> {liveCount}{" "}
            {liveCount === 1 ? "wish" : "wishes"} submitted so far!
          </div>

          <div className="mt-8 pt-6 border-t border-purple-100 flex flex-col items-center">
            <p className="text-xs text-gray-500 mb-2.5 font-medium">
              Want to organize a surprise like this for someone?
            </p>
            <a
              href="/setup"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all hover:scale-105"
            >
              <PartyPopper size={14} /> Create a free BirthdayDrop
            </a>
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
      {/* SVG Confetti Scatter & Ambient Icons */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {renderConfetti()}
        {WISH_FORM_FLOATING_ICONS.map((item, i) => (
          <div
            key={`form-icon-${i}`}
            className={`absolute select-none pointer-events-none ${item.anim}`}
            style={
              {
                top: `${item.top}%`,
                left: `${item.left}%`,
                opacity: item.opacity,
                filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.06))",
                animationDelay: `${item.delay}s`,
                "--animation-duration": `${item.dur}s`,
              } as React.CSSProperties
            }
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={item.size}
              height={item.size}
              className="object-contain"
            />
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-2xl z-10 flex flex-col md:flex-row gap-6 items-start">
        {/* Main Form Card */}
        <div className="flex-1 rounded-3xl bg-white/90 backdrop-blur-md p-8 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white/50">
          <div className="mb-6 flex flex-col items-center justify-center text-center">
            {personPhotoUrl ? (
              <div className="relative mb-4">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 blur-sm animate-pulse" />
                <div className="relative h-24 w-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-purple-50">
                  <Image
                    src={personPhotoUrl}
                    alt={personName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            ) : (
              <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-600 shadow-lg">
                <span className="absolute -inset-1 animate-spin-slow rounded-full bg-gradient-to-tr from-pink-400/30 to-purple-500/30 blur-md"></span>
                <Cake size={36} className="text-white relative z-10" />
              </div>
            )}
            <h1 className="text-3xl font-adlam text-purple-700">
              {customHeading || (
                celebrationType === "family"
                  ? `Send a Wish to ${personName}! 🏠❤️`
                  : celebrationType === "friends"
                    ? `Send a Wish to ${personName}! 🎉`
                    : celebrationType === "workplace"
                      ? `Leave a Wish for ${personName}! 💼`
                      : `Send a Wish to ${personName}! 🎂`
              )}
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-medium px-4">
              {teaserMessage ||
                `We're secretly collecting birthday wishes and memories for ${personName}'s birthday on ${birthDate}. Everything will be revealed on their special day!`}
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
            <p className="text-xs font-semibold text-purple-700 flex items-center gap-1">
              <span>
                {liveCount} {liveCount === 1 ? "person has" : "people have"} already sent a wish
              </span>
              <Image src="/icons/party-popper.svg" width={14} height={14} alt="Party" className="inline align-middle" />
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
