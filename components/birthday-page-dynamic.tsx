"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Confetti } from "./confetti";
import { CakeInteraction } from "./cake-interaction";
import { PartyMode } from "./party-mode";
import { toggleReaction } from "@/app/wish/[token]/actions";
import {
  PartyPopper,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  RotateCw,
  Printer,
} from "lucide-react";
import { SOUND_EFFECTS } from "@/lib/themes";

interface Wish {
  id: string;
  wisherName: string;
  message: string;
  reactions: Record<string, number>;
}

interface AudioTrack {
  id: string;
  title: string;
  url: string;
  isDefault: boolean;
  order: number;
}

interface Props {
  personName: string;
  personPhotoUrl?: string | null;
  birthDate: string;
  theme: string;
  celebrationType?: string | null;
  customHeading?: string | null;
  flipCards?: boolean;
  audioConfig: { loop: boolean; volume: number; autoplay: boolean };
  audioTracks: AudioTrack[];
  wishes: Wish[];
}

const LOADING_MESSAGES = [
  "Unlocking the magic...",
  "Igniting the celebration...",
  "Almost ready for the big reveal...",
  "Get ready for a legendary surprise!",
];

const REACTION_EMOJIS = ["❤️", "🎉", "🥳", "🌟", "🫶"];

const CARD_COLORS = [
  { bg: "#FACC15", text: "#1a1a1a" },
  { bg: "#4ADE80", text: "#1a1a1a" },
  { bg: "#38BDF8", text: "#1a1a1a" },
  { bg: "#F472B6", text: "#1a1a1a" },
  { bg: "#FB923C", text: "#1a1a1a" },
  { bg: "#A78BFA", text: "#1a1a1a" },
  { bg: "#2DD4BF", text: "#1a1a1a" },
  { bg: "#F87171", text: "#1a1a1a" },
];

/** Interactive wish card — either 3D flip card or flat masonry */
function WishCard({
  wish,
  bg,
  textColor,
  flipCards,
  myReactions,
  onToggleReaction,
}: {
  wish: Wish;
  bg: string;
  textColor: string;
  flipCards?: boolean;
  myReactions: Set<string>;
  onToggleReaction: (id: string, emoji: string) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (flipCards) {
    return (
      <div
        className="w-full min-h-[190px] cursor-pointer perspective-1000 select-none group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full min-h-[190px] rounded-2xl shadow-md transition-transform duration-500 preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front: Festive gift card cover */}
          <div
            className="gift-cover absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col items-center justify-center text-center backface-hidden border border-black/5"
            style={{ backgroundColor: bg, color: textColor }}
          >
            <div className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center mb-2.5 shadow-inner group-hover:scale-110 transition-transform">
              <Image src="/icons/gift-box.svg" width={28} height={28} alt="Gift" />
            </div>
            <p className="text-[11px] uppercase tracking-wider font-extrabold opacity-70 mb-0.5">
              Wish from
            </p>
            <p
              className="text-base font-black leading-tight mb-3 line-clamp-1"
              style={{ fontFamily: "var(--font-pacifico)" }}
            >
              {wish.wisherName}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 text-xs font-bold shadow-sm">
              <span>Tap to reveal</span>
              <Sparkles size={12} />
            </div>
          </div>

          {/* Back: Personal message, signature & reactions */}
          <div
            className="gift-message absolute inset-0 w-full h-full rounded-2xl p-4 flex flex-col justify-between rotate-y-180 backface-hidden border border-black/5 overflow-y-auto"
            style={{ backgroundColor: bg, color: textColor }}
          >
            <div>
              <div className="max-h-24 overflow-y-auto pr-1">
                <p className="text-sm font-medium leading-snug">
                  {wish.message}
                </p>
              </div>
              <p className="text-xs font-extrabold opacity-80 mt-2 flex items-center gap-1">
                <span>— {wish.wisherName}</span>
                <Image src="/icons/party-popper.svg" width={14} height={14} alt="Party" className="inline align-middle" />
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-black/10 flex flex-col gap-1.5">
              <div
                className="flex flex-wrap gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {REACTION_EMOJIS.map((emoji) => {
                  const hasReacted = myReactions.has(`${wish.id}:${emoji}`);
                  const count = wish.reactions[emoji] ?? 0;
                  return (
                    <button
                      key={emoji}
                      onClick={() => onToggleReaction(wish.id, emoji)}
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold transition-all hover:scale-110 active:scale-95 ${
                        hasReacted
                          ? "bg-white text-gray-900 shadow-md ring-2 ring-purple-600 scale-105"
                          : "bg-black/10 text-inherit hover:bg-black/20"
                      }`}
                    >
                      <span>{emoji}</span>
                      {count > 0 && (
                        <span className="text-[10px]">{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end">
                <span className="text-[10px] opacity-50 flex items-center gap-1">
                  <RotateCw size={10} /> Tap to flip back
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Flat card mode (content determines height naturally with max-height safety)
  return (
    <div
      className="w-full rounded-2xl shadow-md p-4 flex flex-col gap-2 border border-black/5"
      style={{ backgroundColor: bg, color: textColor }}
    >
      <div className="max-h-56 overflow-y-auto pr-1">
        <p className="text-sm font-medium leading-snug">{wish.message}</p>
      </div>
      <p className="text-xs font-bold opacity-75 mt-1 flex items-center gap-1">
        <span>— {wish.wisherName}</span>
        <Image src="/icons/party-popper.svg" width={14} height={14} alt="Party" className="inline align-middle" />
      </p>

      {/* Inline compact reaction bar */}
      <div className="flex flex-wrap gap-1 mt-1">
        {REACTION_EMOJIS.map((emoji) => {
          const hasReacted = myReactions.has(`${wish.id}:${emoji}`);
          const count = wish.reactions[emoji] ?? 0;
          return (
            <button
              key={emoji}
              onClick={() => onToggleReaction(wish.id, emoji)}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-all hover:scale-110 active:scale-95 ${
                hasReacted
                  ? "bg-white text-gray-900 shadow-md ring-2 ring-purple-600 scale-105"
                  : "bg-black/10 text-inherit hover:bg-black/20"
              }`}
            >
              <span>{emoji}</span>
              {count > 0 && <span className="text-[10px]">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Pure CSS masonry — columns flow content naturally, no height clipping */
function MasonryWishGrid({
  wishes,
  wishReactions,
  flipCards,
  myReactions,
  onToggleReaction,
}: {
  wishes: Wish[];
  wishReactions: Record<string, Record<string, number>>;
  flipCards?: boolean;
  myReactions: Set<string>;
  onToggleReaction: (id: string, emoji: string) => void;
}) {
  return (
    <div className="w-full">
      <style>{`
        @media (min-width: 640px)  { .masonry-grid { column-count: 3 !important; } }
        @media (min-width: 1024px) { .masonry-grid { column-count: 4 !important; } }
        @media (min-width: 1280px) { .masonry-grid { column-count: 5 !important; } }
      `}</style>
      <div
        className="masonry-grid"
        style={{ columnCount: 2, columnGap: "14px" }}
      >
        {wishes.map((wish, idx) => {
          const color = CARD_COLORS[idx % CARD_COLORS.length];
          return (
            <div
              key={wish.id}
              style={{ breakInside: "avoid", marginBottom: "14px" }}
            >
              <WishCard
                wish={{
                  ...wish,
                  reactions: wishReactions[wish.id] ?? wish.reactions,
                }}
                bg={color.bg}
                textColor={color.text}
                flipCards={flipCards}
                myReactions={myReactions}
                onToggleReaction={onToggleReaction}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BirthdayPageDynamic({
  personName,
  personPhotoUrl,
  birthDate,
  celebrationType,
  customHeading,
  flipCards,
  audioConfig,
  audioTracks,
  wishes,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [msgIdx, setMsgIdx] = useState(0);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const [isPartyMode, setIsPartyMode] = useState(false);
  const [showAllWishes, setShowAllWishes] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set());
  const [wishReactions, setWishReactions] = useState<
    Record<string, Record<string, number>>
  >(Object.fromEntries(wishes.map((w) => [w.id, w.reactions])));

  const activeTrack = audioTracks.find((t) => t.isDefault) ?? audioTracks[0];
  const applauseRef = useRef<HTMLAudioElement>(null);
  const partyRef = useRef<HTMLAudioElement>(null);
  const blowRef = useRef<HTMLAudioElement>(null);

  // Load user's already-reacted emojis from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bd_my_reactions");
      if (stored) {
        setMyReactions(new Set(JSON.parse(stored)));
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIdx((i) => {
        if (i < LOADING_MESSAGES.length - 1) return i + 1;
        clearInterval(msgTimer);
        return i;
      });
    }, 2000);
    const doneTimer = setTimeout(
      () => {
        setIsLoading(false);
        setShowCelebrate(true);
      },
      LOADING_MESSAGES.length * 2000 + 1000,
    );
    return () => {
      clearInterval(msgTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  const handleCelebrate = async () => {
    // 1. Play celebratory applause audio immediately on user click gesture
    try {
      const cheer = new Audio(SOUND_EFFECTS.applause);
      cheer.volume = audioConfig.volume || 0.85;
      cheer.play().catch(() => {});
      if (applauseRef.current) {
        applauseRef.current.volume = audioConfig.volume || 0.85;
        applauseRef.current.currentTime = 0;
        applauseRef.current.play().catch(() => {});
      }
    } catch (_) {}

    // 2. Start background celebratory party music track ONLY if explicitly enabled in audioConfig
    if (audioConfig.autoplay) {
      try {
        if (partyRef.current) {
          partyRef.current.volume = Math.max(0.1, (audioConfig.volume || 0.8) * 0.7);
          partyRef.current.currentTime = 0;
          await partyRef.current.play();
          setIsPlayingMusic(true);
        }
      } catch (_) {}
    }

    setShowConfetti(true);
    setShowMain(true);
    setShowCelebrate(false);
  };

  const toggleMusic = () => {
    if (!partyRef.current) return;
    if (isPlayingMusic) {
      partyRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      partyRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => {});
    }
  };

  const handleToggleReaction = async (wishId: string, emoji: string) => {
    const key = `${wishId}:${emoji}`;
    const alreadyReacted = myReactions.has(key);

    // Optimistically toggle active state in localStorage
    setMyReactions((prev) => {
      const next = new Set(prev);
      if (alreadyReacted) {
        next.delete(key);
      } else {
        next.add(key);
      }
      try {
        localStorage.setItem(
          "bd_my_reactions",
          JSON.stringify(Array.from(next)),
        );
      } catch (_) {}
      return next;
    });

    // Optimistically update count (+1 or -1)
    setWishReactions((prev) => {
      const current = prev[wishId]?.[emoji] ?? 0;
      const nextCount = alreadyReacted ? Math.max(0, current - 1) : current + 1;
      return {
        ...prev,
        [wishId]: {
          ...prev[wishId],
          [emoji]: nextCount,
        },
      };
    });

    // Call server action to toggle count in DB
    try {
      await toggleReaction(wishId, emoji, !alreadyReacted);
    } catch (e) {
      console.error("Failed to toggle reaction:", e);
    }
  };

  const visibleWishes = showAllWishes ? wishes : wishes.slice(0, 15);

  return (
    <>
      {/* Audio elements */}
      {activeTrack && (
        <audio
          ref={partyRef}
          src={activeTrack.url}
          loop={audioConfig.loop}
          preload="auto"
          playsInline
        />
      )}
      <audio
        ref={applauseRef}
        src={SOUND_EFFECTS.applause}
        preload="auto"
        playsInline
      />
      <audio
        ref={blowRef}
        src={SOUND_EFFECTS.candleBlow}
        preload="auto"
        playsInline
      />

      {/* ── LOADING SCREEN — clean, no decorations ── */}
      {isLoading && (
        <div className="flex min-h-screen flex-col items-center justify-center loading-gradient-bg p-4 text-center text-white print:hidden">
          <div className="relative mb-8 h-24 w-24 animate-bounce">
            <Image
              src="/images/cool-cake-lit.png"
              alt="Bouncing cake"
              width={96}
              height={96}
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
          <h1
            className="text-3xl font-bold md:text-5xl mb-4 drop-shadow-lg"
            style={{ fontFamily: "var(--font-pacifico)" }}
          >
            {LOADING_MESSAGES[msgIdx]}
          </h1>
          <p className="mt-4 text-lg opacity-80">
            {msgIdx === LOADING_MESSAGES.length - 1
              ? "Prepare for an unforgettable moment!"
              : "Just a moment, the magic is brewing..."}
          </p>
          {personPhotoUrl && (
            <Image
              src={personPhotoUrl}
              alt="preload"
              width={1}
              height={1}
              className="hidden"
              priority
              unoptimized
            />
          )}
        </div>
      )}

      {/* ── CELEBRATE SCREEN — pennant banners at top corners ── */}
      {!isLoading && showCelebrate && (
        <div className="flex min-h-screen flex-col items-center justify-center loading-gradient-bg p-4 text-center text-white relative overflow-hidden print:hidden">
          {/* Pennant banner - top left corner */}
          <Image
            src="/images/pennant-banner-left.png"
            alt="party banner"
            width={420}
            height={160}
            className="absolute top-0 left-0 object-contain pointer-events-none"
            style={{
              transform: "rotate(-3deg) translateX(-20px) translateY(-10px)",
            }}
            priority
          />
          {/* Pennant banner - top right corner */}
          <Image
            src="/images/pennant-banner-right.png"
            alt="party banner"
            width={420}
            height={160}
            className="absolute top-0 right-0 object-contain pointer-events-none"
            style={{
              transform: "rotate(3deg) translateX(20px) translateY(-10px)",
            }}
            priority
          />

          <h1
            className="text-5xl font-extrabold drop-shadow-2xl animate-fade-in-up md:text-7xl mb-10 mt-20 z-10 flex items-center justify-center gap-3"
            style={{ fontFamily: "var(--font-pacifico)" }}
          >
            <span>The Surprise Awaits!</span>
            <Image src="/icons/sparkles.svg" width={48} height={48} alt="Sparkles" className="inline align-middle" />
          </h1>
          <button
            id="celebrate-btn"
            onClick={handleCelebrate}
            className="relative z-10 overflow-hidden rounded-full px-12 py-6 text-2xl font-black text-gray-900 shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 border-4 border-white/60"
            style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)" }}
          >
            <PartyPopper size={30} /> Celebrate!
            <span className="absolute -right-2 -top-2 h-12 w-12 animate-ping-slow rounded-full bg-white opacity-20" />
          </button>
        </div>
      )}

      {/* ── MAIN REVEAL PAGE ── */}
      {showMain && (
        <div
          className="relative min-h-screen overflow-x-hidden theme-text print:hidden"
          style={{ background: "var(--theme-bg-gradient)" }}
        >
          {showConfetti && <Confetti />}
          {isPartyMode && (
            <PartyMode
              onStopParty={() => setIsPartyMode(false)}
              partyAudioRef={partyRef}
            />
          )}

          {/* ── HERO — pennants at corners, title, avatar ── */}
          <section className="relative pt-0 pb-10 flex flex-col items-center overflow-hidden">
            {/* Pennant banner top-left */}
            <Image
              src="/images/pennant-banner-left.png"
              alt="pennant banner"
              width={480}
              height={180}
              className="absolute top-0 left-0 object-contain pointer-events-none z-10"
              style={{
                transform: "rotate(-2deg) translateX(-24px) translateY(-12px)",
              }}
              priority
            />
            {/* Pennant banner top-right */}
            <Image
              src="/images/pennant-banner-right.png"
              alt="pennant banner"
              width={480}
              height={180}
              className="absolute top-0 right-0 object-contain pointer-events-none z-10"
              style={{
                transform: "rotate(2deg) translateX(24px) translateY(-12px)",
              }}
              priority
            />

            {/* Curved Celebratory Title Banner */}
            <div className="w-full max-w-3xl px-4 mt-20 mb-2 z-10 flex flex-col items-center select-none">
              <svg
                viewBox="0 0 1000 200"
                className="w-full h-auto overflow-visible drop-shadow-[0_4px_16px_rgba(0,0,0,0.15)] animate-bounce-text"
              >
                <defs>
                  <path
                    id="hero-arc"
                    d="M 30,170 Q 500,25 970,170"
                    fill="transparent"
                  />
                </defs>
                <text
                  style={{
                    fontFamily: "var(--font-pacifico)",
                    fontSize:
                      personName.length > 20
                        ? "44px"
                        : personName.length > 14
                          ? "54px"
                          : "66px",
                    letterSpacing: "0.5px",
                  }}
                >
                  <textPath
                    href="#hero-arc"
                    startOffset="50%"
                    textAnchor="middle"
                    fill="var(--theme-heading)"
                  >
                    Happy Birthday, {personName}!
                  </textPath>
                </text>
              </svg>
              <h1 className="sr-only">Happy Birthday, {personName}!</h1>
            </div>

            {/* Avatar & Festive Celebration Ribbon Badge */}
            <div className="relative flex flex-col items-center justify-center mb-6 z-10">
              <div className="relative flex items-center justify-center">
                {/* Spinning rainbow ring */}
                <div
                  className="absolute rounded-full animate-pulse-glow"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #ff6b9d, #ffd700, #7c3aed, #06b6d4, #ff6b9d)",
                    inset: "-8px",
                    borderRadius: "9999px",
                    zIndex: 0,
                  }}
                />
                {/* White gap ring */}
                <div
                  className="absolute rounded-full bg-white"
                  style={{
                    inset: "-4px",
                    borderRadius: "9999px",
                    zIndex: 1,
                  }}
                />
                <div
                  className="relative h-44 w-44 md:h-56 md:w-56 rounded-full shadow-2xl overflow-hidden z-10"
                  style={{ background: "var(--theme-card-front)" }}
                >
                  {personPhotoUrl ? (
                    <Image
                      src={personPhotoUrl}
                      alt={`Photo of ${personName}`}
                      fill
                      className="object-cover rounded-full"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Image src="/icons/birthday-cake.svg" width={80} height={80} alt="Birthday Cake" />
                    </div>
                  )}
                </div>
              </div>

              {/* Celebration Ribbon Badge — Overlapping bottom rim of avatar */}
              <div
                className="relative -mt-6 z-20 flex items-center gap-2 px-6 py-2 rounded-full text-white font-extrabold text-sm md:text-base shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/90"
                style={{
                  background: "var(--theme-date-pill)",
                  fontFamily: "var(--font-pacifico)",
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 0 15px rgba(255, 215, 0, 0.35)",
                  transform: "rotate(-2deg)",
                }}
              >
                <Image src="/icons/birthday-cake.svg" width={18} height={18} alt="Cake" />
                <span>{birthDate}</span>
                <Image src="/icons/sparkles.svg" width={18} height={18} alt="Sparkles" />
              </div>
            </div>
          </section>

          {/* ── WISHES MASONRY SECTION ── */}
          <section className="pb-16 px-4 md:px-10 max-w-7xl mx-auto w-full">
            <h2
              className="text-2xl md:text-4xl font-extrabold text-center mb-10 animate-fade-in-up-delay flex items-center justify-center gap-2"
              style={{
                fontFamily: "var(--font-pacifico)",
                color: "var(--theme-heading)",
              }}
            >
              {wishes.length > 0 ? (
                <>
                  <Image src="/icons/love-letter.svg" width={34} height={34} alt="Letter" className="inline align-middle" />
                  <span>
                    {customHeading
                      ? customHeading
                      : celebrationType === "family"
                        ? "Wishes from Family & Loved Ones!"
                        : celebrationType === "friends"
                          ? "Wishes from Friends!"
                          : celebrationType === "workplace"
                            ? "Wishes from the Team!"
                            : `Wishes for ${personName}!`} ({wishes.length})
                  </span>
                </>
              ) : (
                <span>Be the first to wish! 🎈</span>
              )}
            </h2>

            {wishes.length > 0 ? (
              <>
                <MasonryWishGrid
                  wishes={visibleWishes}
                  wishReactions={wishReactions}
                  flipCards={flipCards}
                  myReactions={myReactions}
                  onToggleReaction={handleToggleReaction}
                />
                {wishes.length > 15 && !showAllWishes && (
                  <div className="mt-10 flex justify-center no-print">
                    <button
                      onClick={() => setShowAllWishes(true)}
                      className="rounded-full bg-white/20 px-10 py-4 text-base font-black shadow-xl backdrop-blur-md transition-all hover:bg-white/30 hover:scale-105 border-2 border-white/40 flex items-center gap-2"
                      style={{ color: "var(--theme-heading)" }}
                    >
                      View {wishes.length - 15} more wishes
                    </button>
                  </div>
                )}

                {/* ── Keepsake Memory Book Export / Print Action ── */}
                <div className="mt-8 flex justify-center no-print">
                  <button
                    onClick={() => {
                      setShowAllWishes(true);
                      setTimeout(() => window.print(), 150);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md px-6 py-2.5 text-xs font-bold shadow-md border border-white/50 transition-all hover:scale-105 active:scale-95"
                    style={{ color: "var(--theme-heading)" }}
                    title="Print or save this collective birthday card as a PDF keepsake"
                  >
                    <Printer size={15} /> Save as Keepsake / Print PDF 📄
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-white/30 py-16 text-center opacity-60">
                <p className="text-2xl">No wishes yet 🥺</p>
                <p className="text-sm mt-2">
                  Share the wish form link with your team first!
                </p>
              </div>
            )}
          </section>

          {/* ── MAKE A WISH — CakeInteraction uses cool-cake images ── */}
          <section className="py-16 flex flex-col items-center px-4 relative no-print">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <h2
              className="relative z-10 text-2xl md:text-4xl font-extrabold text-center mb-10 flex items-center justify-center gap-2"
              style={{
                fontFamily: "var(--font-pacifico)",
                color: "var(--theme-heading)",
              }}
            >
              <span>Make a Wish!</span>
              <Image src="/icons/candle.svg" width={32} height={32} alt="Candle" className="inline align-middle" />
            </h2>
            <div className="relative z-10">
              <CakeInteraction onWishMade={() => {}} blowAudioRef={blowRef} />
            </div>
          </section>

          {/* ── PARTY MODE CTA ── */}
          <section className="py-16 flex flex-col items-center px-4 no-print">
            <h2
              className="text-2xl md:text-4xl font-extrabold text-center mb-4 flex items-center justify-center gap-2"
              style={{
                fontFamily: "var(--font-pacifico)",
                color: "var(--theme-heading)",
              }}
            >
              <span>Ready to Party?</span>
              <Image src="/icons/party-face.svg" width={36} height={36} alt="Party" className="inline align-middle" />
            </h2>
            <p
              className="text-base font-medium text-center mb-10 opacity-70 max-w-sm"
              style={{ color: "var(--theme-heading)" }}
            >
              Turn on party mode for an epic celebration experience!
            </p>
            <button
              id="party-mode-btn"
              onClick={() => setIsPartyMode(true)}
              className="relative overflow-hidden rounded-full px-12 py-5 text-xl font-black text-gray-900 shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3 border-4 border-white/50"
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
              }}
            >
              <Image src="/icons/sparkles.svg" width={24} height={24} alt="Sparkles" />
              <span>Enter Party Mode!</span>
              <Image src="/icons/party-popper.svg" width={24} height={24} alt="Party" />
              <span className="absolute -right-2 -top-2 h-10 w-10 animate-ping-slow rounded-full bg-white opacity-20" />
            </button>
          </section>

          {/* ── VIRAL FLYWHEEL CTA ── */}
          <div className="w-full flex justify-center pb-8 px-4 no-print">
            <div className="max-w-md w-full bg-white/20 backdrop-blur-md border border-white/40 rounded-3xl p-5 text-center shadow-xl">
              <p className="text-sm font-bold mb-3 flex items-center justify-center gap-1.5" style={{ color: "var(--theme-heading)" }}>
                <span>Planning a birthday surprise for someone special?</span>
                <Image src="/icons/birthday-cake.svg" width={20} height={20} alt="Cake" className="inline" />
              </p>
              <a
                href="/setup"
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-black shadow-lg transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  color: "#1a1a1a",
                }}
              >
                <Image src="/icons/party-popper.svg" width={16} height={16} alt="Party" />
                <span>Create a free BirthdayDrop in 2 mins</span>
              </a>
            </div>
          </div>

          {/* ── POWERED BY FOOTER ── */}
          <footer className="w-full flex justify-center py-6 no-print">
            <a
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: "var(--theme-heading)" }}
            >
              <Zap size={12} />
              Powered by BirthdayDrop
            </a>
          </footer>

          {/* ── FLOATING MUSIC CONTROLLER ── */}
          {activeTrack && (
            <button
              onClick={toggleMusic}
              aria-label={isPlayingMusic ? "Mute music" : "Play music"}
              className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-md px-4 py-2.5 text-xs font-bold text-gray-800 shadow-2xl border border-white/50 hover:scale-105 active:scale-95 transition-all no-print"
            >
              {isPlayingMusic ? (
                <>
                  <Volume2 size={16} className="text-purple-600 animate-pulse" />
                  <span className="hidden sm:inline">Music: Playing</span>
                </>
              ) : (
                <>
                  <VolumeX size={16} className="text-gray-500" />
                  <span className="hidden sm:inline">Music: Muted</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── PRINT-ONLY: Dedicated Keepsake Memory Book Layout (No 3D, No Mirroring, Clean Typography) ── */}
      <div className="hidden print:block w-full max-w-4xl mx-auto p-8 bg-white text-gray-900">
        <div className="text-center pb-8 border-b-2 border-purple-200 mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Image src="/icons/birthday-cake.svg" width={32} height={32} alt="Cake" />
            <span className="text-xs uppercase tracking-widest font-black text-purple-700">Birthday Keepsake Memory Album</span>
            <Image src="/icons/sparkles.svg" width={22} height={22} alt="Sparkles" />
          </div>
          <h1 className="text-4xl font-extrabold text-purple-950 mb-3" style={{ fontFamily: "var(--font-pacifico)" }}>
            Happy Birthday, {personName}!
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 font-semibold mb-6">
            <span className="flex items-center gap-1.5">
              <Image src="/icons/birthday-cake.svg" width={16} height={16} alt="Date" />
              {birthDate}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Image src="/icons/love-letter.svg" width={16} height={16} alt="Wishes" />
              {wishes.length} Heartfelt Wishes
            </span>
          </div>
          {personPhotoUrl && (
            <div className="relative mx-auto h-32 w-32 rounded-full overflow-hidden border-4 border-purple-300 shadow-sm">
              <Image src={personPhotoUrl} alt={personName} fill className="object-cover" unoptimized />
            </div>
          )}
        </div>

        {/* 2-Column Clean Keepsake Wishes Grid */}
        <div className="grid grid-cols-2 gap-5">
          {wishes.map((w) => (
            <div
              key={`print-${w.id}`}
              className="rounded-2xl border border-gray-300 p-5 bg-white shadow-none flex flex-col justify-between"
              style={{ breakInside: "avoid" }}
            >
              <div>
                <span className="text-3xl text-purple-400 font-serif leading-none block mb-1">“</span>
                <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{w.message}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-xs font-bold text-purple-950">— {w.wisherName}</p>
                <span className="text-[10px] text-gray-400">BirthdayDrop Keepsake</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <Image src="/icons/birthday-cake.svg" width={14} height={14} alt="Cake" />
          <span>Collected with love on BirthdayDrop &bull; {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>
    </>
  );
}
