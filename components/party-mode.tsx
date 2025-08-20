"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ContinuousConfetti } from "./continuous-confetti"

type PartyModeProps = {
  onStopParty: () => void
  partyAudioRef?: React.RefObject<HTMLAudioElement | null>
}

const BALLOON_IMAGES = [
  "/images/balloon-group.png",
  "/images/balloon-blue.png",
  "/images/balloon-red.png",
  "/images/balloon-yellow.png",
]

export function PartyMode({ onStopParty, partyAudioRef }: PartyModeProps) {
  const internalAudioRef = useRef<HTMLAudioElement>(null)
  const audioRef = partyAudioRef ?? internalAudioRef

  const startPlayback = () => {
    if (!audioRef.current) return
    audioRef.current.loop = true
    audioRef.current
      .play()
      .catch((error) => {
        console.error("Error playing party audio:", error)
      })
  }

  useEffect(() => {
    // Start playback when mounted (audio should be user-primed already)
    startPlayback()
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        } catch (error) {
          console.warn("Error pausing audio during unmount (likely benign AbortError):", error)
        }
      }
    }
  }, [])

  const balloons = Array.from({ length: 15 }).map((_, i) => {
    const randomXFactor = Math.random() * 2 - 1
    const randomRotFactor = Math.random() * 2 - 1
    const randomBalloonImage = BALLOON_IMAGES[Math.floor(Math.random() * BALLOON_IMAGES.length)]

    return (
      <Image
        key={i}
        src={randomBalloonImage}
        alt="Party balloon"
        width={Math.random() > 0.5 ? 60 : 80} // Randomize size slightly
        height={Math.random() > 0.5 ? 80 : 100} // Randomize size slightly
        className="absolute animate-balloon-float z-52"
        style={
          {
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
            bottom: `-100px`,
            "--random-x-factor": randomXFactor,
            "--random-rot-factor": randomRotFactor,
          } as React.CSSProperties
        }
      />
    )
  })

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black/90">
      {/* Render an internal audio element only if an external ref was not provided */}
      {!partyAudioRef && (
        <audio
          ref={internalAudioRef}
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/happy-birthday-to-you-bossa-nova-style-arrangement-21399-SOn1WYgFsLMiUWvNzhrWRn3ligyGZQ.mp3"
          preload="auto"
          playsInline
        />
      )}
      {balloons}
      <ContinuousConfetti />
      <div className="absolute inset-0 flex items-center justify-center text-center text-white">
        <h2 className="text-6xl font-extrabold animate-pulse">PARTY TIME!</h2>
      </div>
      <Button
        onClick={onStopParty}
        className="relative z-50 mt-auto mb-8 rounded-full bg-red-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-red-600"
      >
        Stop Party
      </Button>
    </div>
  )
}
