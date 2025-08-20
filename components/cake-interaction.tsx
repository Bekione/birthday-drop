"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"

type CakeInteractionProps = {
  onWishMade: () => void
  blowAudioRef?: React.RefObject<HTMLAudioElement | null>
}

export function CakeInteraction({ onWishMade, blowAudioRef }: CakeInteractionProps) {
  const [candleLit, setCandleLit] = useState(false)
  const [wishMade, setWishMade] = useState(false)
  const internalAudioRef = useRef<HTMLAudioElement>(null)
  const audioRef = blowAudioRef ?? internalAudioRef

  // Preload the lit cake image
  useEffect(() => {
    const litCakeImage = new window.Image()
    litCakeImage.src = "/images/cake-lit.png"
  }, [])

  const handleCakeClick = () => {
    if (!candleLit) {
      // Light the candle
      setCandleLit(true)
      setWishMade(false) // Reset wish made state if re-lighting
    } else if (candleLit && !wishMade) {
      // "Blow out" the candle
      if (audioRef.current) {
        audioRef.current.play()
      }
      // Add a tiny delay to sync with the woosh sound
      setTimeout(() => {
        setCandleLit(false)
        setWishMade(true)
        // Notify parent that the wish has been made
        try {
          onWishMade()
        } catch {
          // no-op if not provided
        }
      }, 300) // A little delay to sync with sound
    }
  }

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative h-48 w-48 cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={handleCakeClick}
      >
        <Image
          src={candleLit ? "/images/cake-lit.png" : "/images/cake.png"}
          alt={candleLit ? "Birthday cake with lit candles" : "Birthday cake with unlit candles"}
          width={192}
          height={192}
          className="object-contain drop-shadow-lg transition-opacity duration-300" // Smooth opacity transition
        />
      </div>
      <p className="mt-4 text-xl font-semibold text-purple-700">
        {!candleLit && !wishMade && "Click the cake to light the candle!"}
        {candleLit && "Make a wish! Then click to blow out."}
        {wishMade && "Wish made! Happy Birthday!"}
      </p>
      {/* Only render an internal audio element if an external ref wasn't provided */}
      {!blowAudioRef && (
        <audio
          ref={internalAudioRef}
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blowing-out-candlewav-14441_g6nn5QhH-vzGojipQh8sF7g1jY6DEuJXS3m7s7x.mp3"
          preload="auto"
          playsInline
        />
      )}
    </div>
  )
}
