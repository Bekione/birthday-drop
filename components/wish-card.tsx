"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type WishCardProps = {
  wisher: string
  wish: string
  note: string
}

export function WishCard({ wisher, wish, note }: WishCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="group relative min-h-[10rem] w-full cursor-pointer perspective-1000" // Changed h-40 to min-h-[10rem]
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <Card
        className={cn(
          "absolute h-full w-full rounded-lg shadow-md transition-transform duration-700 preserve-3d",
          isFlipped ? "rotate-y-180" : "",
        )}
      >
        {/* Front of the card */}
        <div className="absolute flex h-full w-full flex-col items-center justify-center rounded-lg bg-yellow-200 p-4 text-center text-lg font-pacifico text-gray-800 backface-hidden">
          <p className="text-xl font-bold mb-2">{wisher}k</p>
          <p>{wish}</p>
          <span className="absolute bottom-2 right-2 text-xs font-montserrat text-gray-500">Tap to flip</span>
        </div>

        {/* Back of the card */}
        <div className="absolute flex h-full w-full items-center justify-center rounded-lg bg-blue-200 p-4 text-center text-base font-montserrat text-gray-800 rotate-y-180 backface-hidden">
          <p>{note}</p>
        </div>
      </Card>
    </div>
  )
}
