import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col items-center justify-center px-6 text-center">
      {/* Floating emoji bg */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {["🎂", "🎈", "🎉", "🥳", "💖", "⭐", "🎁"].map((e, i) => (
          <span
            key={i}
            className="absolute text-2xl opacity-20 select-none animate-float-star"
            style={{
              top: `${[12, 75, 30, 85, 20, 60, 45][i]}%`,
              left: `${[8, 18, 80, 60, 50, 88, 28][i]}%`,
              ["--animation-duration" as string]: `${6 + i}s`,
              animationDelay: `${i * 0.6}s`,
            }}
          >
            {e}
          </span>
        ))}
      </div>

      <div className="relative">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="BirthdayDrop"
            width={72}
            height={72}
            className="drop-shadow-lg"
          />
        </div>

        <div className="text-8xl font-adlam font-bold text-purple-200 select-none mb-2">
          404
        </div>
        <h1 className="text-2xl font-adlam font-bold text-purple-700 mb-3">
          Page not found 🎈
        </h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          Looks like this page wandered off to its own birthday party and never
          came back.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-3 font-bold text-white shadow-lg hover:bg-purple-700 hover:scale-105 transition-all duration-200"
        >
          ← Back Home
        </Link>
      </div>
    </div>
  );
}
