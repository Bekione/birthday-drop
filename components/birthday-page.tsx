"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Confetti } from "./confetti"; // Custom confetti component
import { CakeInteraction } from "./cake-interaction"; // Custom cake component
import { PartyMode } from "./party-mode"; // Custom party mode component
import { WishCard } from "./wish-card"; // Import statement for WishCard component

// Define the type for a wish card
type WishCardProps = {
  id: number;
  wisher: string;
  wish: string;
  note: string;
};

const WISHES: WishCardProps[] = [
  {
    id: 1,
    wisher: "Elshaday",
    wish: "Happy Personal New Year!",
    note: "May this year bring you good vibes and good money only✨🫶",
  },
  {
    id: 2,
    wisher: "Raniya",
    wish: "Birthday Blessings!",
    note: "Wishing you a year filled with remarkable achievements and joyful moments!",
  },
  {
    id: 3,
    wisher: "Melat",
    wish: "Cheers to You, Boss!",
    note: "Hope your day is as inspiring and extraordinary as your leadership!",
  },
  {
    id: 4,
    wisher: "Bereket L.",
    wish: "To a Great Leader!",
    note: "Thank you for your guidance wishing you another year of success!",
  },
  {
    id: 5,
    wisher: "Etsub",
    wish: "Have a Fantastic Birthday!",
    note: "May your special day be filled with laughter, happiness!",
  },
  {
    id: 6,
    wisher: "Bereket K.",
    wish: "Happy Birthday, Mohammed!",
    note: "Wishing you endless success, health, and blessings in life!",
  },
  {
    id: 7,
    wisher: "Wengel",
    wish: "Wishing You the Best!",
    note: "May every goal you set this year be achieved with grace and excellence!",
  },
  {
    id: 8,
    wisher: "Wisam",
    wish: "Happy Birthday!",
    note: "May your day be filled with joy, and the year ahead with exciting opportunities!",
  },
  {
    id: 9,
    wisher: "Anonymous",
    wish: "To the Coolest Boss!",
    note: "Wishing you a wonderful birthday and a year ahead full of growth and happiness!",
  },
];

const LOADING_MESSAGES = [
  "Unlocking the magic...",
  "Igniting the celebration...",
  "Almost ready for the big reveal...",
  "Get ready for a legendary surprise!",
];

export function BirthdayPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentLoadingMessageIndex, setCurrentLoadingMessageIndex] =
    useState(0);
  const [showCelebrateButton, setShowCelebrateButton] = useState(false); // New state for the button
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const [isPartyModeActive, setIsPartyModeActive] = useState(false);
  const applauseAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let messageTimer: NodeJS.Timeout;
    let loadingCompleteTimer: NodeJS.Timeout;

    if (isLoading) {
      messageTimer = setInterval(() => {
        setCurrentLoadingMessageIndex((prevIndex) => {
          if (prevIndex < LOADING_MESSAGES.length - 1) {
            return prevIndex + 1;
          } else {
            clearInterval(messageTimer);
            return prevIndex;
          }
        });
      }, 2000);

      loadingCompleteTimer = setTimeout(() => {
        setIsLoading(false); // Stop showing loading messages
        setShowCelebrateButton(true); // Show the celebrate button
      }, LOADING_MESSAGES.length * 2000 + 1000);
    }

    return () => {
      clearInterval(messageTimer);
      clearTimeout(loadingCompleteTimer);
    };
  }, [isLoading]);

  const handleCelebrateClick = () => {
    setShowCelebrateButton(false); // Hide the button
    setShowConfetti(true); // Trigger confetti
    if (applauseAudioRef.current) {
      applauseAudioRef.current
        .play()
        .catch((e) => console.error("Error playing applause:", e));
    }
    setTimeout(() => setShowMainContent(true), 500); // Show main content after a slight delay
  };

  const handleWishMade = () => {
    console.log("Wish made!");
  };

  const handlePartyModeToggle = (active: boolean) => {
    setIsPartyModeActive(active);
  };

  return (
    <>
      {/* Applause audio element is always in the DOM */}
      <audio
        ref={applauseAudioRef}
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/applause-cheer-236786-cRd3Z8EmJ1B0qHrcUSivSPQHCLwbFU.mp3"
        preload="auto"
      />

      {isLoading && (
        <>
          <div className="hidden">
            <Image
              src="/images/boss-cartoon.png"
              alt=""
              width={250}
              height={250}
              priority
            />
          </div>
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
            <h1 className="text-3xl font-pacifico font-bold md:text-4xl lg:text-5xl mb-4">
              {LOADING_MESSAGES[currentLoadingMessageIndex]}
            </h1>
            <p className="mt-4 text-lg font-montserrat opacity-80">
              {currentLoadingMessageIndex === LOADING_MESSAGES.length - 1
                ? "Prepare for an unforgettable moment!"
                : "Just a moment, the magic is brewing..."}
            </p>
          </div>
        </>
      )}

      {!isLoading && showCelebrateButton && (
        <div className="flex min-h-screen flex-col items-center justify-center loading-gradient-bg p-4 text-center text-white">
          <h1 className="text-5xl font-pacifico font-extrabold text-white drop-shadow-lg animate-fade-in-up md:text-6xl lg:text-7xl mb-8">
            The Surprise Awaits!
          </h1>
          <Button
            onClick={handleCelebrateClick}
            className=" mt-8 relative overflow-hidden rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-10 py-5 text-2xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-pink-600 hover:to-purple-700"
          >
            Celebrate!
            <span className="absolute -right-2 -top-2 h-10 w-10 animate-ping-slow rounded-full bg-white opacity-20"></span>
          </Button>
        </div>
      )}

      {!isLoading && !showCelebrateButton && showMainContent && (
        <div
          className={cn(
            "relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-100 to-teal-200 p-4 pt-8 text-gray-800 font-montserrat",
            showMainContent ? "opacity-100" : "opacity-0"
          )}
        >
          {showConfetti && <Confetti />}
          {isPartyModeActive && (
            <PartyMode onStopParty={() => setIsPartyModeActive(false)} />
          )}

          <div className="flex min-h-screen flex-col items-center justify-center">
            <header className="mb-8 pt-4 text-center relative">
              <div className="absolute -top-2 right-4 md:right-8 lg:right-12 transform rotate-12">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg border-2 border-white">
                  <div className="text-sm font-pacifico">Aug 10, 2025</div>
                </div>
              </div>
              <h1 className="text-5xl font-pacifico font-extrabold text-purple-700 drop-shadow-lg animate-fade-in-up md:text-6xl lg:text-7xl">
                <span className="block animate-bounce-text">
                  🎉 Happy Birthday 🎉
                </span>
                <span className="block animate-bounce-text-delay mt-2 text-pink-600">
                  Mohammed!
                </span>
              </h1>
            </header>

            <div className="relative mb-8 h-48 w-48 animate-pop-in rounded-full border-4 border-white shadow-xl md:h-64 md:w-64">
              <Image
                src="/images/boss-cartoon.png"
                alt="Cartoon avatar of Mohammed wearing a party hat"
                width={250}
                height={250}
                className="object-cover rounded-full"
              />
            </div>

            <section className="mb-12 w-full max-w-4xl px-4 text-center">
              <h2 className="mb-6 text-3xl font-pacifico font-bold text-purple-600 animate-fade-in-up-delay">
                Wishes from the Team!
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {WISHES.map((card) => (
                  <WishCard
                    key={card.id}
                    wisher={card.wisher}
                    wish={card.wish}
                    note={card.note}
                  />
                ))}
              </div>
            </section>

            <section className="mb-12 flex flex-col items-center">
              <h2 className="mb-6 text-3xl font-pacifico font-bold text-purple-600 animate-fade-in-up-delay">
                Make a Wish!
              </h2>
              <CakeInteraction onWishMade={handleWishMade} />
            </section>

            <section className="mb-12 flex flex-col items-center">
              <h2 className="mb-6 text-3xl font-pacifico font-bold text-purple-600 animate-fade-in-up-delay">
                Ready to Party?
              </h2>
              <Button
                onClick={() => handlePartyModeToggle(true)} // Only starts party mode
                className="relative overflow-hidden rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-yellow-500 hover:to-orange-600"
              >
                Party Mode!
                <span className="absolute -right-2 -top-2 h-8 w-8 animate-ping-slow rounded-full bg-white opacity-20"></span>
              </Button>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
