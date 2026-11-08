"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type CakeInteractionProps = {
  onWishMade: () => void;
  blowAudioRef?: React.RefObject<HTMLAudioElement | null>;
};

export function CakeInteraction({
  onWishMade,
  blowAudioRef,
}: CakeInteractionProps) {
  // Start with cake lit by default so users can immediately blow it out!
  const [candleLit, setCandleLit] = useState(true);
  const [wishMade, setWishMade] = useState(false);
  const internalAudioRef = useRef<HTMLAudioElement>(null);

  // Preload cake images
  useEffect(() => {
    const lit = new window.Image();
    lit.src = "/images/cool-cake-lit.png";
    const blown = new window.Image();
    blown.src = "/images/cool-cake.png";
  }, []);

  const handleCakeClick = () => {
    if (candleLit) {
      // Play blow sound immediately on user click gesture
      try {
        const sound = new Audio(
          "/audios/blowing-out-candlewav-14441_g6nn5QhH.mp3",
        );
        sound.volume = 1.0;
        sound.play().catch(() => {});

        if (blowAudioRef?.current) {
          blowAudioRef.current.volume = 1.0;
          blowAudioRef.current.currentTime = 0;
          blowAudioRef.current.play().catch(() => {});
        }
      } catch (_) {}

      setTimeout(() => {
        setCandleLit(false);
        setWishMade(true);
        try {
          onWishMade();
        } catch {
          // no-op
        }
      }, 250);
    } else {
      // Re-light the candle
      setCandleLit(true);
      setWishMade(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      <div
        className="relative h-56 w-56 cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
        onClick={handleCakeClick}
      >
        <Image
          src={
            candleLit ? "/images/cool-cake-lit.png" : "/images/cool-cake.png"
          }
          alt={
            candleLit
              ? "Birthday cake with lit candles"
              : "Birthday cake with unlit candles"
          }
          width={240}
          height={240}
          className="object-contain drop-shadow-2xl transition-all duration-300"
          priority
        />
      </div>

      <div
        className="mt-4 text-lg md:text-xl font-bold text-center transition-all px-4 flex items-center justify-center gap-2"
        style={{
          fontFamily: "var(--font-pacifico)",
          color: "var(--theme-heading)",
        }}
      >
        {candleLit && (
          <span className="inline-flex items-center gap-2 justify-center">
            Make a wish! Click the cake to blow out candles!
            <Image src="/icons/candle.svg" width={24} height={24} alt="Candle" className="inline align-middle" />
          </span>
        )}
        {!candleLit && wishMade && (
          <span className="inline-flex items-center gap-2 justify-center">
            Wish made! May all your dreams come true!
            <Image src="/icons/sparkles.svg" width={20} height={20} alt="Sparkles" className="inline align-middle" />
            <Image src="/icons/party-popper.svg" width={20} height={20} alt="Party" className="inline align-middle" />
            <span className="text-xs font-sans opacity-70 ml-1">(Click to relight)</span>
          </span>
        )}
        {!candleLit && !wishMade && (
          <span className="inline-flex items-center gap-2 justify-center">
            Click to light the candles!
            <Image src="/icons/candle.svg" width={24} height={24} alt="Candle" className="inline align-middle" />
          </span>
        )}
      </div>

      {/* Internal fallback audio */}
      {!blowAudioRef && (
        <audio
          ref={internalAudioRef}
          src="/audios/blowing-out-candlewav-14441_g6nn5QhH.mp3"
          preload="auto"
          playsInline
        />
      )}
    </div>
  );
}
