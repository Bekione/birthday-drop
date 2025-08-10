"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

type ContinuousConfettiParticle = {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  direction: "left" | "right"
}

export function ContinuousConfetti() {
  const [particles, setParticles] = useState<ContinuousConfettiParticle[]>([])
  const particleIdRef = useRef(0)

  useEffect(() => {
    const colors = ["#FFD700", "#FF6347", "#ADFF2F", "#1E90FF", "#FF1493", "#8A2BE2"]

    const addParticle = () => {
      const direction = Math.random() > 0.5 ? "left" : "right"
      const newParticle: ContinuousConfettiParticle = {
        id: particleIdRef.current++,
        x: direction === "left" ? -5 : 105, // Start slightly off-screen
        y: 30 + Math.random() * 40, // Wider range for vertical position (30-70vh)
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 10 + Math.random() * 15, // Increased size (10px to 25px)
        direction: direction,
      }
      setParticles((prev) => [...prev, newParticle])

      // Remove particle after its animation duration
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id))
      }, 6000) // Matches max animation duration
    }

    const interval = setInterval(addParticle, 100) // Add a new particle every 100ms (increased frequency)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-51 overflow-hidden">
      {" "}
      {/* Increased z-index to 51 */}
      {particles.map((p) => (
        <div
          key={p.id}
          className={cn(
            "absolute animate-continuous-confetti",
            p.direction === "right" ? "animate-continuous-confetti-right" : "animate-continuous-confetti-left",
          )}
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            transform: `rotate(${p.rotation}deg)`,
            animationDuration: `${4 + Math.random() * 2}s`, // 4-6 seconds to cross
            animationDelay: `${Math.random() * 0.5}s`, // Slight delay for variety
          }}
        />
      ))}
    </div>
  )
}
