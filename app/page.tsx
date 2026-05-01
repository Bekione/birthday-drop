import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { HashScroller } from "@/components/hash-scroller";
import {
  Palette,
  Link2,
  Music2,
  MessageCircleHeart,
  CalendarClock,
  UserRound,
  Cake,
  PartyPopper,
  Smartphone,
  Settings2,
  Mail,
  Gift,
} from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Beautiful Themes",
    desc: "Choose from Confetti Carnival or Midnight Stars — more coming soon.",
    color: "text-purple-500",
    glow: "rgba(168,85,247,0.55)",
  },
  {
    icon: Link2,
    title: "Secret Links",
    desc: "Unguessable UUID links for the wish form — total secrecy until the big reveal.",
    color: "text-blue-500",
    glow: "rgba(59,130,246,0.55)",
  },
  {
    icon: Music2,
    title: "Birthday Music",
    desc: "Pick from curated songs or upload your own track. Control loop & volume.",
    color: "text-pink-500",
    glow: "rgba(236,72,153,0.55)",
  },
  {
    icon: MessageCircleHeart,
    title: "Real Wishes",
    desc: "Every wish submitted by your team shows up live on the surprise page.",
    color: "text-rose-500",
    glow: "rgba(244,63,94,0.55)",
  },
  {
    icon: CalendarClock,
    title: "Wish Deadline",
    desc: "Set a cut-off date — the form closes automatically before the birthday.",
    color: "text-orange-500",
    glow: "rgba(249,115,22,0.55)",
  },
  {
    icon: UserRound,
    title: "Custom Avatar",
    desc: "Upload a photo of the birthday person for the ultimate personal touch.",
    color: "text-teal-500",
    glow: "rgba(20,184,166,0.55)",
  },
  {
    icon: Cake,
    title: "Cake Interaction",
    desc: "Interactive animated cake — visitors blow out candles and make a wish!",
    color: "text-yellow-500",
    glow: "rgba(234,179,8,0.55)",
  },
  {
    icon: PartyPopper,
    title: "Party Mode",
    desc: "One button to launch full-screen confetti, balloons, and party music.",
    color: "text-fuchsia-500",
    glow: "rgba(217,70,239,0.55)",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    desc: "Looks great on phones — share the surprise link anywhere.",
    color: "text-indigo-500",
    glow: "rgba(99,102,241,0.55)",
  },
];

const howItWorks = [
  {
    step: "1",
    icon: Settings2,
    gradient: "from-pink-400 to-purple-500",
    title: "Set it up",
    desc: "Enter the birthday person's name, pick a theme & songs, set a wish deadline, and create your surprise in under 2 minutes.",
  },
  {
    step: "2",
    icon: Mail,
    gradient: "from-purple-400 to-indigo-500",
    title: "Collect wishes",
    desc: "Share the secret wish-form link with colleagues or friends. They submit their name and birthday message — no account needed!",
  },
  {
    step: "3",
    icon: Gift,
    gradient: "from-pink-400 to-rose-500",
    title: "Reveal the surprise",
    desc: "On the birthday, open the surprise link. Watch the animated reveal with all their real wishes, confetti & music.",
  },
];

/** Small confetti pieces scattered around the hero */
const CONFETTI = [
  {
    shape: "rect",
    w: 10,
    h: 4,
    top: 8,
    left: 6,
    rot: 20,
    color: "#f97316",
    delay: 0,
  },
  {
    shape: "circle",
    w: 6,
    h: 6,
    top: 15,
    left: 18,
    rot: 0,
    color: "#a855f7",
    delay: 0.4,
  },
  {
    shape: "rect",
    w: 12,
    h: 5,
    top: 5,
    left: 35,
    rot: -15,
    color: "#ec4899",
    delay: 0.8,
  },
  {
    shape: "star",
    w: 8,
    h: 8,
    top: 10,
    left: 55,
    rot: 30,
    color: "#eab308",
    delay: 1.2,
  },
  {
    shape: "rect",
    w: 8,
    h: 3,
    top: 20,
    left: 72,
    rot: -30,
    color: "#06b6d4",
    delay: 0.3,
  },
  {
    shape: "circle",
    w: 7,
    h: 7,
    top: 7,
    left: 88,
    rot: 0,
    color: "#f43f5e",
    delay: 1.6,
  },
  {
    shape: "rect",
    w: 14,
    h: 5,
    top: 75,
    left: 4,
    rot: 10,
    color: "#8b5cf6",
    delay: 0.6,
  },
  {
    shape: "star",
    w: 9,
    h: 9,
    top: 82,
    left: 22,
    rot: -20,
    color: "#f97316",
    delay: 2,
  },
  {
    shape: "rect",
    w: 8,
    h: 3,
    top: 68,
    left: 62,
    rot: 45,
    color: "#10b981",
    delay: 1,
  },
  {
    shape: "circle",
    w: 5,
    h: 5,
    top: 85,
    left: 80,
    rot: 0,
    color: "#ec4899",
    delay: 1.8,
  },
  {
    shape: "rect",
    w: 10,
    h: 4,
    top: 78,
    left: 92,
    rot: -10,
    color: "#a855f7",
    delay: 0.5,
  },
  {
    shape: "star",
    w: 7,
    h: 7,
    top: 40,
    left: 3,
    rot: 60,
    color: "#eab308",
    delay: 2.4,
  },
  {
    shape: "rect",
    w: 11,
    h: 4,
    top: 50,
    left: 95,
    rot: 25,
    color: "#f43f5e",
    delay: 0.9,
  },
  {
    shape: "circle",
    w: 6,
    h: 6,
    top: 60,
    left: 42,
    rot: 0,
    color: "#06b6d4",
    delay: 1.4,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-montserrat">
      <HashScroller />
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between">
        <Logo size="md" />
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#how"
            className="text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors"
          >
            How it works
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors"
          >
            Features
          </a>
          <a
            href="#themes"
            className="text-sm font-medium text-gray-500 hover:text-purple-600 mr-4 transition-colors"
          >
            Themes
          </a>
          <Link
            href="/setup"
            className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 whitespace-nowrap"
          >
            Create a Surprise
          </Link>
        </div>
        <Link
          href="/setup"
          className="md:hidden rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm"
        >
          Create Surprise
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-4 sm:px-6 md:py-28 flex flex-col items-center text-center min-h-[calc(100svh-52px)] sm:min-h-0 justify-center pb-20">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-200 opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-pink-200 opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200 opacity-20 blur-3xl" />

        {/* Confetti scatter */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="absolute animate-float-star"
              style={
                {
                  top: `${c.top}%`,
                  left: `${c.left}%`,
                  transform: `rotate(${c.rot}deg)`,
                  animationDelay: `${c.delay}s`,
                  "--animation-duration": `${6 + (i % 4)}s`,
                } as React.CSSProperties
              }
            >
              {c.shape === "rect" && (
                <span
                  style={{
                    display: "block",
                    width: c.w,
                    height: c.h,
                    backgroundColor: c.color,
                    borderRadius: 2,
                    opacity: 0.75,
                  }}
                />
              )}
              {c.shape === "circle" && (
                <span
                  style={{
                    display: "block",
                    width: c.w,
                    height: c.h,
                    backgroundColor: c.color,
                    borderRadius: "50%",
                    opacity: 0.75,
                  }}
                />
              )}
              {c.shape === "star" && (
                <svg
                  width={c.w}
                  height={c.h}
                  viewBox="0 0 10 10"
                  style={{ opacity: 0.8 }}
                >
                  <polygon
                    points="5,0 6.5,3.5 10,3.5 7,5.5 8.5,9 5,7 1.5,9 3,5.5 0,3.5 3.5,3.5"
                    fill={c.color}
                  />
                </svg>
              )}
            </span>
          ))}

          {/* Floating birthday emojis */}
          {(
            [
              { e: "🎈", top: 12, left: 8, dur: 7, delay: 0 },
              { e: "🎁", top: 70, left: 15, dur: 9, delay: 1.2 },
              { e: "🎊", top: 30, left: 78, dur: 6, delay: 0.4 },
              { e: "⭐", top: 80, left: 55, dur: 8, delay: 2 },
              { e: "🥳", top: 18, left: 45, dur: 7, delay: 0.8 },
              { e: "🎂", top: 55, left: 85, dur: 6, delay: 1.5 },
              { e: "💖", top: 40, left: 25, dur: 9, delay: 0.2 },
              { e: "🎶", top: 88, left: 72, dur: 7, delay: 3 },
            ] as {
              e: string;
              top: number;
              left: number;
              dur: number;
              delay: number;
            }[]
          ).map(({ e, top, left, dur, delay }, i) => (
            <span
              key={`emoji-${i}`}
              className="absolute text-2xl opacity-60 select-none hidden sm:block animate-float-star"
              style={
                {
                  top: `${top}%`,
                  left: `${left}%`,
                  "--animation-duration": `${dur}s`,
                  animationDelay: `${delay}s`,
                } as React.CSSProperties
              }
            >
              {e}
            </span>
          ))}
        </div>

        <div className="relative mx-auto max-w-4xl w-full">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/70 border border-purple-100 px-4 py-1.5 text-xs sm:text-sm font-medium text-purple-600 shadow-sm backdrop-blur">
            <span className="animate-pulse">✨</span>
            The easiest birthday surprise tool for teams
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-5xl lg:text-7xl font-adlam font-bold leading-tight text-purple-700">
            Surprise the people
            <br />
            <span className="text-pink-600">you love 🎉</span>
          </h1>

          {/* Sub */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 leading-relaxed px-2">
            Set up a birthday surprise in minutes. Share a secret link, collect
            heartfelt wishes, and reveal them all on the big day. No accounts
            needed. Pure magic. 🎈
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/setup"
              id="hero-cta"
              className="group relative overflow-hidden rounded-full flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-lg sm:text-xl font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full sm:w-auto"
            >
              <Gift size={20} className="relative z-10 text-white/90" />
              <span className="relative z-10">Create a Surprise</span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
            <a
              href="#how"
              className="hidden sm:block rounded-full border border-purple-200 bg-white px-8 py-4 text-lg font-semibold text-purple-700 transition-all duration-200 hover:border-purple-400 hover:shadow-md"
            >
              How it works ↓
            </a>
            <a
              href="#how"
              className="sm:hidden text-sm font-medium text-purple-500 hover:underline"
            >
              How it works ↓
            </a>
          </div>
        </div>

        {/* Curved bottom wave */}
        <div className="absolute -bottom-1 left-0 right-0 overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 64"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-12 sm:h-16"
          >
            <path
              d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="px-6 py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="mb-4 text-3xl sm:text-4xl font-adlam text-purple-700">
            How it works
          </h2>
          <p className="mb-14 text-gray-500 text-base sm:text-lg">
            Three simple steps. Zero hassle.
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            {howItWorks.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="group relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl text-center"
                >
                  {/* Icon circle with step badge */}
                  <div className="relative mx-auto mb-6 w-20 h-20">
                    <div
                      className={`w-full h-full rounded-full bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon size={34} className="text-white" />
                    </div>
                    <div className="absolute -top-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-purple-400 text-xs font-extrabold text-purple-600 shadow-sm">
                      {s.step}
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-800">
                    {s.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      {/* Top wave */}
      <div className="overflow-hidden leading-none bg-white">
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-10 sm:h-14"
        >
          <path
            d="M0,0 C360,60 1080,0 1440,60 L1440,60 L0,60 Z"
            fill="#f5f3ff"
          />
        </svg>
      </div>

      <section
        id="features"
        className="px-4 sm:px-6 py-12 sm:py-16 bg-gradient-to-br from-purple-50 to-pink-50"
      >
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl sm:text-4xl font-adlam text-purple-700">
              Everything you need
            </h2>
            <p className="text-gray-500 text-base sm:text-lg">
              Packed with features to make the surprise unforgettable.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md group"
                >
                  <div
                    className={`mt-0.5 shrink-0 ${f.color} transition-all duration-300`}
                    style={{ filter: `drop-shadow(0 0 7px ${f.glow})` }}
                  >
                    <Icon
                      size={26}
                      className="transition-all duration-300 group-hover:scale-110"
                      style={{ filter: `drop-shadow(0 0 5px ${f.glow})` }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom wave */}
      <div className="overflow-hidden leading-none bg-white">
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-10 sm:h-14"
        >
          <path d="M0,60 C360,0 1080,60 1440,0 L1440,0 L0,0 Z" fill="#f5f3ff" />
        </svg>
      </div>

      {/* ── Themes Preview ── */}
      <section id="themes" className="px-4 sm:px-6 py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl sm:text-4xl font-adlam text-purple-700">
            Choose your vibe
          </h2>
          <p className="mb-10 text-gray-500 text-base sm:text-lg">
            Two stunning themes to match every personality.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Confetti Carnival */}
            <div className="group rounded-3xl overflow-hidden shadow-lg border border-gray-100 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-teal-200 overflow-hidden">
                <Image
                  src="/images/theme-confetti-carnival.png"
                  alt="Confetti Carnival theme preview"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 text-left">
                <h3 className="text-xl font-bold text-purple-700 mb-1">
                  Confetti Carnival
                </h3>
                <p className="text-sm text-gray-500">
                  Colorful, playful &amp; fun — perfect for anyone who loves a
                  good party!
                </p>
              </div>
            </div>

            {/* Midnight Stars */}
            <div className="group rounded-3xl overflow-hidden shadow-lg border border-gray-100 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="relative h-48 bg-gradient-to-br from-indigo-950 to-purple-950 overflow-hidden">
                <Image
                  src="/images/theme-midnight-star.png"
                  alt="Midnight Stars theme preview"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 text-left">
                <h3 className="text-xl font-bold text-amber-600 mb-1">
                  Midnight Stars
                </h3>
                <p className="text-sm text-gray-500">
                  Dark, elegant &amp; magical — for a sophisticated surprise
                  under the stars.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative px-4 sm:px-6 py-20 sm:py-28 bg-gradient-to-r from-purple-600 to-pink-600 text-center text-white overflow-hidden">
        {/* Left decorative balloons */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-40 sm:w-56 overflow-hidden">
          <svg
            viewBox="0 0 200 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -left-6 top-4 h-full opacity-20"
          >
            <ellipse cx="60" cy="60" rx="40" ry="50" fill="white" />
            <line
              x1="60"
              y1="110"
              x2="70"
              y2="200"
              stroke="white"
              strokeWidth="1.5"
            />
            <ellipse cx="120" cy="130" rx="30" ry="38" fill="white" />
            <line
              x1="120"
              y1="168"
              x2="115"
              y2="260"
              stroke="white"
              strokeWidth="1.5"
            />
            <ellipse cx="30" cy="230" rx="25" ry="32" fill="white" />
            <line
              x1="30"
              y1="262"
              x2="40"
              y2="340"
              stroke="white"
              strokeWidth="1.5"
            />
            {[20, 90, 150, 60, 180].map((y, i) => (
              <rect
                key={i}
                x={80 + ((i * 17) % 50)}
                y={y}
                width={8 + ((i * 3) % 8)}
                height={4}
                rx="2"
                fill="white"
                transform={`rotate(${i * 25})`}
              />
            ))}
          </svg>
        </div>

        {/* Right decorative balloons */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-40 sm:w-56 overflow-hidden">
          <svg
            viewBox="0 0 200 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -right-6 top-8 h-full opacity-20"
            style={{ transform: "scaleX(-1)" }}
          >
            <ellipse cx="60" cy="60" rx="40" ry="50" fill="white" />
            <line
              x1="60"
              y1="110"
              x2="70"
              y2="200"
              stroke="white"
              strokeWidth="1.5"
            />
            <ellipse cx="130" cy="150" rx="30" ry="38" fill="white" />
            <line
              x1="130"
              y1="188"
              x2="125"
              y2="280"
              stroke="white"
              strokeWidth="1.5"
            />
            <ellipse cx="40" cy="260" rx="25" ry="32" fill="white" />
            <line
              x1="40"
              y1="292"
              x2="50"
              y2="370"
              stroke="white"
              strokeWidth="1.5"
            />
            {[30, 100, 170, 80, 200].map((y, i) => (
              <rect
                key={i}
                x={90 + ((i * 13) % 40)}
                y={y}
                width={8 + ((i * 3) % 8)}
                height={4}
                rx="2"
                fill="white"
                transform={`rotate(${i * -20})`}
              />
            ))}
          </svg>
        </div>

        <div className="relative mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl sm:text-4xl font-adlam md:text-5xl">
            Ready to make someone&apos;s day? 🎉
          </h2>
          <p className="mb-8 sm:mb-10 text-base sm:text-lg text-white/80">
            It only takes 2 minutes to set up. Your team will love it.
          </p>
          <Link
            href="/setup"
            id="bottom-cta"
            className="flex items-center justify-center gap-2 rounded-full bg-white px-10 sm:px-12 py-3.5 sm:py-4 text-lg sm:text-xl font-bold text-purple-700 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <Gift size={22} /> Start for Free
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-8 bg-gray-50 text-center text-sm text-gray-400 border-t border-gray-100 flex flex-col items-center gap-3">
        <Logo size="sm" />
        <p>Made with ❤️ for teams everywhere</p>
      </footer>
    </main>
  );
}
