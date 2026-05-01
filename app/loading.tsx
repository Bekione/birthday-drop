import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col items-center justify-center gap-5">
      <div className="relative">
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-purple-200 opacity-60 animate-ping" />
        <Image
          src="/logo.png"
          alt="BirthdayDrop"
          width={72}
          height={72}
          className="relative drop-shadow-lg"
          priority
        />
      </div>
      <p className="font-adlam text-purple-600 text-lg animate-pulse">
        BirthdayDrop
      </p>
      {/* Bouncing dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-purple-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
