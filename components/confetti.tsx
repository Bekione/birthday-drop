"use client"

import { useEffect, useState } from "react"

type ConfettiParticle = {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  delay: number
}

export function Confetti() {
  const [particles, setParticles] = useState<ConfettiParticle[]>([])

  useEffect(() => {
    const colors = ["#FFD700", "#FF6347", "#ADFF2F", "#1E90FF", "#FF1493", "#8A2BE2"]
    const newParticles: ConfettiParticle[] = []
    // Increased particle count for a bigger burst
    for (let i = 0; i < 250; i++) {
      // Increased from 100 to 250
      newParticles.push({
        id: i,
        x: Math.random() * 100, // % of screen width
        y: Math.random() * 100, // % of screen height
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 10, // 5px to 15px
        delay: Math.random() * 2, // 0 to 2 seconds
      })
    }
    setParticles(newParticles)

    // Increased duration for confetti to last longer
    const timer = setTimeout(() => {
      setParticles([])
    }, 8000) // Confetti lasts for 8 seconds (increased from 5s)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%", // Make them circular or square
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${3 + Math.random() * 2}s`, // Fall duration
            opacity: 0, // Start invisible
          }}
        />
      ))}
    </div>
  )
}
