"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Confetti } from "./confetti";
import { CakeInteraction } from "./cake-interaction";
import { PartyMode } from "./party-mode";
import { addReaction } from "@/app/wish/[token]/actions";
import { PartyPopper, Sparkles, Cake } from "lucide-react";
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

function WishCard({
  wish,
  onReact,
}: {
  wish: Wish;
  onReact: (id: string, emoji: string) => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="group relative min-h-[10rem] w-full cursor-pointer perspective-1000"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`absolute h-full w-full rounded-xl shadow-md transition-transform duration-700 preserve-3d ${flipped ? "rotate-y-180" : ""}`}
      >
        {/* Front */}
        <div
          className="absolute flex h-full w-full flex-col items-center justify-center rounded-xl p-4 text-center backface-hidden theme-card-front"
          style={{ background: "var(--theme-card-front)" }}
        >
          <p
            className="text-lg font-bold mb-1 theme-card-text"
            style={{
              color: "var(--theme-card-text)",
              fontFamily: "var(--font-pacifico)",
            }}
          >
            {wish.wisherName}
          </p>
          <span
            className="absolute bottom-2 right-2 text-xs opacity-50"
            style={{ color: "var(--theme-card-text)" }}
          >
            Tap to flip
          </span>
        </div>
        {/* Back */}
        <div
          className="absolute flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl p-3 text-center rotate-y-180 backface-hidden"
          style={{
            background: "var(--theme-card-back)",
            color: "var(--theme-card-text)",
          }}
        >
          <p className="text-sm leading-relaxed">{wish.message}</p>
          {/* Reactions */}
          <div
            className="flex gap-1 mt-1 flex-wrap justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact(wish.id, emoji)}
                className="flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs hover:bg-white/40 transition-colors"
              >
                {emoji}
                {(wish.reactions[emoji] ?? 0) > 0 && (
                  <span className="font-semibold">{wish.reactions[emoji]}</span>
                )}
              </button>
            ))}
          </div>
        </div>
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
  const [wishReactions, setWishReactions] = useState<
    Record<string, Record<string, number>>
  >(Object.fromEntries(wishes.map((w) => [w.id, w.reactions])));

  // Audio
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
    } catch (_) {
      /* autoplay blocked */
    }
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

      {/* Loading screen */}
      {isLoading && (
        <div className="flex min-h-screen flex-col items-center justify-center loading-gradient-bg p-4 text-center text-white">
          <div className="relative mb-8 h-24 w-24 animate-bounce">
            <Image
              src="/images/cake-lit.png"
              alt="Bouncing cake"
              width={96}
              height={96}
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
          <h1
            className="text-3xl font-bold md:text-5xl mb-4"
            style={{ fontFamily: "var(--font-pacifico)" }}
          >
            {LOADING_MESSAGES[msgIdx]}
          </h1>
          <p className="mt-4 text-lg opacity-80">
            {msgIdx === LOADING_MESSAGES.length - 1
              ? "Prepare for an unforgettable moment!"
              : "Just a moment, the magic is brewing..."}
          </p>

          {/* Preload avatar photo silently so it's ready when the page reveals */}
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

      {/* Celebrate button */}
      {!isLoading && showCelebrate && (
        <div className="flex min-h-screen flex-col items-center justify-center loading-gradient-bg p-4 text-center text-white">
          <h1
            className="text-5xl font-extrabold drop-shadow-lg animate-fade-in-up md:text-6xl lg:text-7xl mb-8"
            style={{ fontFamily: "var(--font-pacifico)" }}
          >
            The Surprise Awaits! ✨
          </h1>
          <button
            id="celebrate-btn"
            onClick={handleCelebrate}
            className="relative overflow-hidden rounded-full px-10 py-5 text-2xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
            style={{
              background:
                "linear-gradient(135deg, var(--theme-btn-from), var(--theme-btn-to))",
            }}
          >
            <PartyPopper size={28} /> Celebrate!
            <span className="absolute -right-2 -top-2 h-10 w-10 animate-ping-slow rounded-full bg-white opacity-20" />
          </button>
        </div>
      )}

      {/* Main birthday page */}
      {showMain && (
        <div
          className="relative min-h-screen overflow-hidden p-4 pt-8 theme-text"
          style={{ background: "var(--theme-bg-gradient)" }}
        >
          {showConfetti && <Confetti />}
          {isPartyMode && (
            <PartyMode
              onStopParty={() => setIsPartyMode(false)}
              partyAudioRef={partyRef}
            />
          )}

          <div className="flex min-h-screen flex-col items-center justify-center">
            {/* Header */}
            <header className="mb-8 pt-4 text-center relative w-full max-w-4xl">
              <div className="absolute -top-2 right-4 md:right-8 transform rotate-12">
                <div
                  className="px-4 py-2 rounded-full shadow-lg border-2 border-white text-white text-sm"
                  style={{
                    background: "var(--theme-date-pill)",
                    fontFamily: "var(--font-pacifico)",
                  }}
                >
                  {birthDate}
                </div>
              </div>
              <h1
                className="text-5xl font-extrabold drop-shadow-lg animate-fade-in-up md:text-6xl lg:text-7xl"
                style={{
                  fontFamily: "var(--font-pacifico)",
                  color: "var(--theme-heading)",
                }}
              >
                <span className="block animate-bounce-text">
                  🎉 Happy Birthday 🎉
                </span>
                <span
                  className="block animate-bounce-text-delay mt-2"
                  style={{ color: "var(--theme-subheading)" }}
                >
                  {personName}!
                </span>
              </h1>
            </header>

            {/* Avatar */}
            <div className="relative mb-8 h-48 w-48 animate-pop-in rounded-full border-4 border-white shadow-xl md:h-64 md:w-64">
              {personPhotoUrl ? (
                <Image
                  src={personPhotoUrl}
                  alt={`Photo of ${personName}`}
                  fill
                  className="object-cover rounded-full"
                />
              ) : (
                <div
                  className="h-full w-full rounded-full flex items-center justify-center text-7xl"
                  style={{ background: "var(--theme-card-front)" }}
                >
                  <Cake size={80} style={{ color: "var(--theme-card-text)" }} />
                </div>
              )}
            </div>

            {/* Wishes */}
            <section className="mb-12 w-full max-w-4xl px-4 text-center">
              <h2
                className="mb-6 text-3xl font-bold animate-fade-in-up-delay"
                style={{
                  fontFamily: "var(--font-pacifico)",
                  color: "var(--theme-heading)",
                }}
              >
                {wishes.length > 0
                  ? `Wishes from the Team! (${wishes.length})`
                  : "Be the first to wish! 🎈"}
              </h2>
              {wishes.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {wishes.map((wish) => (
                    <WishCard
                      key={wish.id}
                      wish={{
                        ...wish,
                        reactions: wishReactions[wish.id] ?? wish.reactions,
                      }}
                      onReact={handleReact}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-white/30 py-12 text-center opacity-60">
                  <p className="text-xl">No wishes yet 🥺</p>
                  <p className="text-sm mt-2">
                    Share the wish form link with your team first!
                  </p>
                </div>
              )}
            </section>

            {/* Cake Interaction */}
            <section className="mb-12 flex flex-col items-center">
              <h2
                className="mb-6 text-3xl font-bold animate-fade-in-up-delay"
                style={{
                  fontFamily: "var(--font-pacifico)",
                  color: "var(--theme-heading)",
                }}
              >
                Make a Wish! 🕯️
              </h2>
              <CakeInteraction
                onWishMade={() => console.log("Wish made!")}
                blowAudioRef={blowRef}
              />
            </section>

            {/* Party Mode */}
            <section className="mb-16 flex flex-col items-center">
              <h2
                className="mb-6 text-3xl font-bold animate-fade-in-up-delay"
                style={{
                  fontFamily: "var(--font-pacifico)",
                  color: "var(--theme-heading)",
                }}
              >
                Ready to Party? 🥳
              </h2>
              <button
                id="party-mode-btn"
                onClick={() => setIsPartyMode(true)}
                className="relative overflow-hidden rounded-full px-8 py-4 text-xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                style={{
                  background: `linear-gradient(135deg, var(--theme-party-btn-from), var(--theme-party-btn-to))`,
                }}
              >
                <Sparkles size={20} /> Party Mode!
                <span className="absolute -right-2 -top-2 h-8 w-8 animate-ping-slow rounded-full bg-white opacity-20" />
              </button>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
