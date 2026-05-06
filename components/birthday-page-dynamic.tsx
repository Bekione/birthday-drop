"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Confetti } from "./confetti";
import { CakeInteraction } from "./cake-interaction";
import { PartyMode } from "./party-mode";
import { addReaction } from "@/app/wish/[token]/actions";
import { PartyPopper, Sparkles, Zap } from "lucide-react";
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

/** Single flat wish card — no flip, content determines height */
function WishCard({
  wish,
  bg,
  textColor,
  onReact,
}: {
  wish: Wish;
  bg: string;
  textColor: string;
  onReact: (id: string, emoji: string) => void;
}) {
  const totalReactions = Object.values(wish.reactions).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <div
      className="w-full rounded-2xl shadow-md p-4 flex flex-col gap-2"
      style={{ backgroundColor: bg, color: textColor }}
    >
      <p className="text-sm font-medium leading-snug">{wish.message}</p>
      <p className="text-xs font-bold opacity-75 mt-1">
        — {wish.wisherName} 🎉
      </p>

      {/* Inline compact reaction bar */}
      <div className="flex flex-wrap gap-1 mt-1">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onReact(wish.id, emoji)}
            className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold transition-transform hover:scale-110 active:scale-95"
            style={{ background: "rgba(0,0,0,0.12)" }}
          >
            {emoji}
            {(wish.reactions[emoji] ?? 0) > 0 && (
              <span className="text-[10px]">{wish.reactions[emoji]}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Pure CSS masonry — columns flow content naturally, no height clipping */
function MasonryWishGrid({
  wishes,
  wishReactions,
  onReact,
}: {
  wishes: Wish[];
  wishReactions: Record<string, Record<string, number>>;
  onReact: (id: string, emoji: string) => void;
}) {
  return (
    <div
      className="w-full"
      style={{
        columnCount: 2,
        columnGap: "12px",
      }}
      // Responsive handled with inline media query via a wrapper
    >
      <style>{`
        @media (min-width: 640px)  { .masonry-grid { column-count: 3 !important; } }
        @media (min-width: 1024px) { .masonry-grid { column-count: 4 !important; } }
        @media (min-width: 1280px) { .masonry-grid { column-count: 5 !important; } }
      `}</style>
      {/* Wrap the actual grid inside a span so the media queries apply */}
      <div
        className="masonry-grid"
        style={{ columnCount: 2, columnGap: "12px" }}
      >
        {wishes.map((wish, idx) => {
          const color = CARD_COLORS[idx % CARD_COLORS.length];
          return (
            <div
              key={wish.id}
              style={{ breakInside: "avoid", marginBottom: "12px" }}
            >
              <WishCard
                wish={{
                  ...wish,
                  reactions: wishReactions[wish.id] ?? wish.reactions,
                }}
                bg={color.bg}
                textColor={color.text}
                onReact={onReact}
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
  const [wishReactions, setWishReactions] = useState<
    Record<string, Record<string, number>>
  >(Object.fromEntries(wishes.map((w) => [w.id, w.reactions])));

  const activeTrack = audioTracks.find((t) => t.isDefault) ?? audioTracks[0];
  const applauseRef = useRef<HTMLAudioElement>(null);
  const partyRef = useRef<HTMLAudioElement>(null);
  const blowRef = useRef<HTMLAudioElement>(null);

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
    try {
      if (applauseRef.current) {
        applauseRef.current.volume = audioConfig.volume;
        applauseRef.current.currentTime = 0;
        await applauseRef.current.play();
      }
    } catch (_) {}
    setShowConfetti(true);
    setShowMain(true);
    setShowCelebrate(false);
  };

  const handleReact = async (wishId: string, emoji: string) => {
    setWishReactions((prev) => ({
      ...prev,
      [wishId]: { ...prev[wishId], [emoji]: (prev[wishId]?.[emoji] ?? 0) + 1 },
    }));
    await addReaction(wishId, emoji);
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
        <div className="flex min-h-screen flex-col items-center justify-center loading-gradient-bg p-4 text-center text-white">
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
        <div className="flex min-h-screen flex-col items-center justify-center loading-gradient-bg p-4 text-center text-white relative overflow-hidden">
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
            className="text-5xl font-extrabold drop-shadow-2xl animate-fade-in-up md:text-7xl mb-10 mt-20 z-10"
            style={{ fontFamily: "var(--font-pacifico)" }}
          >
            The Surprise Awaits! ✨
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
          className="relative min-h-screen overflow-x-hidden theme-text"
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

            {/* Title */}
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold drop-shadow-lg animate-bounce-text text-center px-6 mt-24 mb-8 z-10"
              style={{
                fontFamily: "var(--font-pacifico)",
                color: "var(--theme-heading)",
                textShadow: "0 4px 20px rgba(0,0,0,0.12)",
              }}
            >
              Happy Birthday, {personName}!
            </h1>

            {/* Avatar in glowing ring */}
            <div className="relative flex items-center justify-center mb-4 z-10">
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
                className="relative h-40 w-40 md:h-52 md:w-52 rounded-full shadow-2xl overflow-hidden z-10"
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
                  <div className="h-full w-full flex items-center justify-center text-7xl">
                    🎂
                  </div>
                )}
              </div>
            </div>

            {/* Date pill */}
            <div
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-white font-bold text-sm shadow-lg mb-2 z-10"
              style={{
                background: "var(--theme-date-pill)",
                fontFamily: "var(--font-pacifico)",
              }}
            >
              🎂 {birthDate}
            </div>
          </section>

          {/* ── WISHES MASONRY SECTION ── */}
          <section className="pb-16 px-4 md:px-10 max-w-7xl mx-auto w-full">
            <h2
              className="text-2xl md:text-4xl font-extrabold text-center mb-10 animate-fade-in-up-delay"
              style={{
                fontFamily: "var(--font-pacifico)",
                color: "var(--theme-heading)",
              }}
            >
              {wishes.length > 0
                ? `💌 Wishes from the Team! (${wishes.length})`
                : "Be the first to wish! 🎈"}
            </h2>

            {wishes.length > 0 ? (
              <>
                <MasonryWishGrid
                  wishes={visibleWishes}
                  wishReactions={wishReactions}
                  onReact={handleReact}
                />
                {wishes.length > 15 && !showAllWishes && (
                  <div className="mt-10 flex justify-center">
                    <button
                      onClick={() => setShowAllWishes(true)}
                      className="rounded-full bg-white/20 px-10 py-4 text-base font-black shadow-xl backdrop-blur-md transition-all hover:bg-white/30 hover:scale-105 border-2 border-white/40 flex items-center gap-2"
                      style={{ color: "var(--theme-heading)" }}
                    >
                      View {wishes.length - 15} more wishes
                    </button>
                  </div>
                )}
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
          <section className="py-16 flex flex-col items-center px-4 relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <h2
              className="relative z-10 text-2xl md:text-4xl font-extrabold text-center mb-10"
              style={{
                fontFamily: "var(--font-pacifico)",
                color: "var(--theme-heading)",
              }}
            >
              Make a Wish! 🕯️
            </h2>
            <div className="relative z-10">
              <CakeInteraction onWishMade={() => {}} blowAudioRef={blowRef} />
            </div>
          </section>

          {/* ── PARTY MODE CTA ── */}
          <section className="py-16 flex flex-col items-center px-4">
            <h2
              className="text-2xl md:text-4xl font-extrabold text-center mb-4"
              style={{
                fontFamily: "var(--font-pacifico)",
                color: "var(--theme-heading)",
              }}
            >
              Ready to Party? 🥳
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
              <Sparkles size={24} /> Enter Party Mode! 🎉
              <span className="absolute -right-2 -top-2 h-10 w-10 animate-ping-slow rounded-full bg-white opacity-20" />
            </button>
          </section>

          {/* ── POWERED BY FOOTER ── */}
          <footer className="w-full flex justify-center py-6">
            <a
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: "var(--theme-heading)" }}
            >
              <Zap size={12} />
              Powered by BirthdayDrop
            </a>
          </footer>
        </div>
      )}
    </>
  );
}
