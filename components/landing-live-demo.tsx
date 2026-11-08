"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, PartyPopper, Cake, Heart, Gift, Volume2, VolumeX } from "lucide-react";
import { Confetti } from "./confetti";

interface DemoWish {
  id: string;
  name: string;
  msg: string;
  bg: string;
  text: string;
  reactions: Record<string, number>;
}

const DEMO_WISHES: DemoWish[] = [
  {
    id: "w1",
    name: "Sarah (Sister)",
    msg: "Happy Birthday Mom! Thank you for always being our rock and the warmest heart in the family. Love you so much! ❤️",
    bg: "#FACC15",
    text: "#1a1a1a",
    reactions: { "❤️": 8, "🥰": 5 },
  },
  {
    id: "w2",
    name: "David & Kids",
    msg: "Best grandma ever! Can't wait for cake this weekend! 🎉🎂",
    bg: "#4ADE80",
    text: "#1a1a1a",
    reactions: { "🥳": 6, "🎉": 4 },
  },
  {
    id: "w3",
    name: "Alex",
    msg: "Happy 50th! You inspire everyone around you every single day. Wishing you endless health and joy!",
    bg: "#38BDF8",
    text: "#1a1a1a",
    reactions: { "🌟": 7, "❤️": 3 },
  },
  {
    id: "w4",
    name: "Uncle Mike",
    msg: "Cheers to another fantastic trip around the sun! Keep shining bright! 🥂✨",
    bg: "#F472B6",
    text: "#1a1a1a",
    reactions: { "🫶": 4, "🎉": 5 },
  },
  {
    id: "w5",
    name: "Cousin Maya",
    msg: "So grateful for all the sweet memories and laughter! Have the most wonderful birthday! 🎈",
    bg: "#FB923C",
    text: "#1a1a1a",
    reactions: { "❤️": 5, "🥳": 3 },
  },
  {
    id: "w6",
    name: "Work Family",
    msg: "Happy Birthday from all of us! Thank you for bringing so much warmth and energy every day! 💼🎉",
    bg: "#A78BFA",
    text: "#1a1a1a",
    reactions: { "🌟": 4, "❤️": 6 },
  },
];

export function LandingLiveDemo() {
  const [candleLit, setCandleLit] = useState(true);
  const [wishMade, setWishMade] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wishes, setWishes] = useState(DEMO_WISHES);

  const handleCakeClick = () => {
    if (candleLit) {
      setCandleLit(false);
      setWishMade(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      setCandleLit(true);
      setWishMade(false);
    }
  };

  const handleReact = (wishId: string, emoji: string) => {
    setWishes((prev) =>
      prev.map((w) => {
        if (w.id !== wishId) return w;
        return {
          ...w,
          reactions: {
            ...w.reactions,
            [emoji]: (w.reactions[emoji as keyof typeof w.reactions] || 0) + 1,
          },
        };
      }),
    );
  };

  const triggerCelebrate = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <section id="demo" className="relative py-20 px-4 md:px-8 bg-gradient-to-b from-purple-50/50 via-pink-50/40 to-white overflow-hidden">
      {showConfetti && <Confetti />}

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* <div className="inline-flex items-center gap-2 rounded-full bg-pink-100/80 px-4 py-1.5 text-xs font-bold text-pink-700 mb-3 border border-pink-200">
            <Sparkles size={14} /> Interactive Live Demo
          </div> */}
          <h2 className="text-3xl sm:text-5xl font-adlam text-purple-700 mb-4 flex items-center justify-center gap-2">
            <span>See the Magic in Action</span>
            <Image src="/icons/sparkles.svg" width={32} height={32} alt="Sparkles" className="inline align-middle" />
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-base">
            This is what the birthday person experiences when they open their secret surprise link. Try blowing the candles and reacting to wishes!
          </p>
        </div>

        {/* Demo Device Sandbox Frame */}
        <div className="relative rounded-3xl border-4 border-purple-200/80 bg-gradient-to-br from-[#dbeafe] to-[#99f6e4] shadow-2xl p-6 sm:p-10 overflow-hidden">
          {/* Corner pennant banners */}
          <Image
            src="/images/pennant-banner-left.png"
            alt="pennant"
            width={240}
            height={90}
            className="absolute top-0 left-0 object-contain pointer-events-none z-10 opacity-90"
            style={{ transform: "rotate(-3deg) translateX(-12px) translateY(-6px)" }}
          />
          <Image
            src="/images/pennant-banner-right.png"
            alt="pennant"
            width={240}
            height={90}
            className="absolute top-0 right-0 object-contain pointer-events-none z-10 opacity-90"
            style={{ transform: "rotate(3deg) translateX(12px) translateY(-6px)" }}
          />

          {/* Sandbox Header / Birthday Person */}
          <div className="flex flex-col items-center text-center mt-6 mb-8 relative z-10">
            {/* Spotlight avatar */}
            <div className="relative flex items-center justify-center mb-3">
              <div
                className="absolute rounded-full animate-pulse-glow"
                style={{
                  background: "conic-gradient(from 0deg, #ff6b9d, #ffd700, #7c3aed, #06b6d4, #ff6b9d)",
                  inset: "-6px",
                  borderRadius: "9999px",
                }}
              />
              <div className="absolute rounded-full bg-white" style={{ inset: "-3px", borderRadius: "9999px" }} />
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden shadow-xl bg-purple-100 flex items-center justify-center text-5xl">
                👩‍👧‍👦
              </div>
            </div>

            <h3
              className="text-3xl sm:text-5xl font-extrabold drop-shadow text-purple-800"
              style={{ fontFamily: "var(--font-pacifico)" }}
            >
              Happy Birthday, Mom!
            </h3>
            <div
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-white font-bold text-xs shadow"
              style={{ background: "#7c3aed", fontFamily: "var(--font-pacifico)" }}
            >
              <Image src="/icons/birthday-cake.svg" width={14} height={14} alt="Cake" className="inline" />
              <span>Aug 24</span>
            </div>

            {/* Celebrate Trigger Button */}
            <div className="mt-5">
              <button
                onClick={triggerCelebrate}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-black text-gray-900 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/70"
                style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)" }}
              >
                <PartyPopper size={18} />
                <span>Launch Confetti Cannon!</span>
                <Image src="/icons/party-popper.svg" width={18} height={18} alt="Party" className="inline" />
              </button>
            </div>
          </div>

          {/* Masonry Wish Cards Demo */}
          <div className="mb-12 relative z-10">
            <h4
              className="text-xl sm:text-2xl font-bold text-center mb-6 text-purple-900 flex items-center justify-center gap-2"
              style={{ fontFamily: "var(--font-pacifico)" }}
            >
              <Image src="/icons/love-letter.svg" width={26} height={26} alt="Letter" className="inline align-middle" />
              <span>Wishes from Family & Friends! ({wishes.length})</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {wishes.map((w) => (
                <div
                  key={w.id}
                  className="rounded-2xl shadow-md p-4 flex flex-col justify-between transition-transform hover:-translate-y-1"
                  style={{ backgroundColor: w.bg, color: w.text }}
                >
                  <p className="text-sm font-medium leading-snug mb-2">{w.msg}</p>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/10">
                    <span className="text-xs font-bold opacity-80">— {w.name}</span>
                    <div className="flex gap-1">
                      {["❤️", "🎉", "🥳"].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReact(w.id, emoji)}
                          className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold hover:scale-110 active:scale-90 transition-transform"
                          style={{ background: "rgba(0,0,0,0.12)" }}
                        >
                          {emoji}
                          {(w.reactions[emoji as keyof typeof w.reactions] || 0) > 0 && (
                            <span className="text-[10px]">
                              {w.reactions[emoji as keyof typeof w.reactions]}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive 3D Cake Section */}
          <div className="rounded-3xl bg-white/20 backdrop-blur-md border border-white/40 p-6 flex flex-col items-center text-center relative z-10 max-w-lg mx-auto">
            <h4
              className="text-xl sm:text-2xl font-bold mb-3 text-purple-900 flex items-center justify-center gap-2"
              style={{ fontFamily: "var(--font-pacifico)" }}
            >
              <span>Make a Wish!</span>
              <Image src="/icons/candle.svg" width={24} height={24} alt="Candle" className="inline align-middle" />
            </h4>
            <div
              className="cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
              onClick={handleCakeClick}
            >
              <Image
                src={candleLit ? "/images/cool-cake-lit.png" : "/images/cool-cake.png"}
                alt="Birthday cake"
                width={180}
                height={180}
                className="object-contain drop-shadow-xl"
              />
            </div>
            <p className="mt-3 text-sm font-bold text-purple-900">
              {candleLit
                ? "👉 Click the cake to blow out candles!"
                : "✨ Wish made! Click to re-light candles."}
            </p>
          </div>

          {/* Floating Sandbox Banner */}
          <div className="mt-8 text-center pt-6 border-t border-purple-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="text-left">
              <p className="text-xs uppercase tracking-wider font-bold text-purple-800">Ready to surprise someone?</p>
              <p className="text-sm font-semibold text-gray-700">Create your free surprise in under 2 minutes.</p>
            </div>
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 hover:bg-purple-700 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 shrink-0"
            >
              <Gift size={16} /> Create Your Surprise Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
