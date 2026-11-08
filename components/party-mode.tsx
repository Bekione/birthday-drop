"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { Sparkles, X, Music } from "lucide-react";
import { ContinuousConfetti } from "./continuous-confetti";

type PartyModeProps = {
  onStopParty: () => void;
  partyAudioRef?: React.RefObject<HTMLAudioElement | null>;
};

const BALLOON_IMAGES = [
  "/images/ballon-red.png",
  "/images/ballon-blue.png",
  "/images/ballon-golden.png",
  "/images/ballon-pink.png",
  "/images/ballon-purple.png",
  "/images/ballon-cyan.png",
  "/images/ballon-green.png",
  "/images/ballon-orange.png",
];

export function PartyMode({ onStopParty, partyAudioRef }: PartyModeProps) {
  const internalAudioRef = useRef<HTMLAudioElement>(null);
  const audioRef = partyAudioRef ?? internalAudioRef;

  useEffect(() => {
    const el = audioRef.current;
    if (el) {
      el.loop = true;
      el.play().catch((error) => {
        console.error("Error playing party audio:", error);
      });
    }
    return () => {
      if (el) {
        try {
          el.pause();
          el.currentTime = 0;
        } catch (error) {
          console.warn("Error pausing audio during unmount:", error);
        }
      }
    };
  }, [audioRef]);

  const balloons = Array.from({ length: 16 }).map((_, i) => {
    const randomXFactor = Math.random() * 2 - 1;
    const randomRotFactor = Math.random() * 2 - 1;
    const randomBalloonImage =
      BALLOON_IMAGES[i % BALLOON_IMAGES.length];

    return (
      <Image
        key={i}
        src={randomBalloonImage}
        alt="Party balloon"
        width={75 + (i % 3) * 15}
        height={95 + (i % 3) * 20}
        className="absolute animate-balloon-float pointer-events-none drop-shadow-2xl z-30"
        style={
          {
            left: `${(i * 6.5) % 96}%`,
            animationDelay: `${(i * 0.4) % 4}s`,
            animationDuration: `${6 + (i % 4) * 2}s`,
            bottom: "-120px",
            "--random-x-factor": randomXFactor,
            "--random-rot-factor": randomRotFactor,
          } as React.CSSProperties
        }
      />
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden p-6"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(109, 40, 217, 0.95) 0%, rgba(30, 27, 75, 0.98) 70%, rgba(15, 23, 42, 1) 100%)",
      }}
    >
      {/* Fallback audio element */}
      {!partyAudioRef && (
        <audio
          ref={internalAudioRef}
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/happy-birthday-to-you-bossa-nova-style-arrangement-21399-SOn1WYgFsLMiUWvNzhrWRn3ligyGZQ.mp3"
          preload="auto"
          playsInline
        />
      )}

      {/* Floating pennant corner banners */}
      <Image
        src="/images/pennant-banner-left.png"
        alt="pennant"
        width={380}
        height={140}
        className="absolute top-0 left-0 object-contain pointer-events-none z-20 opacity-90"
        style={{ transform: "rotate(-3deg) translateX(-20px) translateY(-10px)" }}
      />
      <Image
        src="/images/pennant-banner-right.png"
        alt="pennant"
        width={380}
        height={140}
        className="absolute top-0 right-0 object-contain pointer-events-none z-20 opacity-90"
        style={{ transform: "rotate(3deg) translateX(20px) translateY(-10px)" }}
      />

      {/* Confetti & balloons */}
      <ContinuousConfetti />
      {balloons}

      {/* Centerpiece */}
      <div className="relative z-40 flex flex-col items-center text-center my-auto">
        <div className="relative mb-6 animate-bounce">
          <Image
            src="/images/cool-cake-lit.png"
            alt="Celebration Cake"
            width={160}
            height={160}
            className="object-contain drop-shadow-[0_20px_50px_rgba(251,191,36,0.6)]"
          />
        </div>

        <h2
          className="text-5xl sm:text-7xl lg:text-8xl font-black text-white drop-shadow-[0_4px_30px_rgba(255,255,255,0.4)] animate-bounce-text flex items-center justify-center gap-3"
          style={{ fontFamily: "var(--font-pacifico)" }}
        >
          <span>PARTY TIME!</span>
          <Image src="/icons/party-face.svg" width={72} height={72} alt="Party" className="inline align-middle drop-shadow-xl" />
        </h2>
        <p className="mt-4 text-lg sm:text-2xl font-bold text-yellow-300 drop-shadow flex items-center justify-center gap-2">
          <span>Music &bull; Confetti &bull; Celebration</span>
          <Image src="/icons/sparkles.svg" width={24} height={24} alt="Sparkles" className="inline align-middle" />
        </p>
      </div>

      {/* Exit Button */}
      <button
        onClick={onStopParty}
        className="relative z-40 mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md px-8 py-3 text-base font-extrabold text-white border-2 border-white/50 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <X size={20} /> Exit Party Mode
      </button>
    </div>
  );
}
