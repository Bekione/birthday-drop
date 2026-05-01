import Link from "next/link";
import { Logo } from "@/components/logo";
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
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Link2,
    title: "Secret Links",
    desc: "Unguessable UUID links for the wish form — total secrecy until the big reveal.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Music2,
    title: "Birthday Music",
    desc: "Pick from curated songs or upload your own track. Control loop & volume.",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: MessageCircleHeart,
    title: "Real Wishes",
    desc: "Every wish submitted by your team shows up live on the surprise page.",
    color: "bg-rose-100 text-rose-600",
  },
  {
    icon: CalendarClock,
    title: "Wish Deadline",
    desc: "Set a cut-off date — the form closes automatically before the birthday.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: UserRound,
    title: "Custom Avatar",
    desc: "Upload a photo of the birthday person for the ultimate personal touch.",
    color: "bg-teal-100 text-teal-600",
  },
  {
    icon: Cake,
    title: "Cake Interaction",
    desc: "Interactive animated cake — visitors blow out candles and make a wish!",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    icon: PartyPopper,
    title: "Party Mode",
    desc: "One button to launch full-screen confetti, balloons, and party music.",
    color: "bg-fuchsia-100 text-fuchsia-600",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    desc: "Looks great on phones — share the surprise link anywhere.",
    color: "bg-indigo-100 text-indigo-600",
  },
];

const howItWorks = [
  {
    step: "1",
    icon: Settings2,
    color: "bg-gradient-to-br from-pink-400 to-purple-600",
    title: "Set it up",
    desc: "Enter the birthday person's name, pick a theme & songs, set a wish deadline, and create your surprise in under 2 minutes.",
  },
  {
    step: "2",
    icon: Mail,
    color: "bg-gradient-to-br from-purple-400 to-pink-600",
    title: "Collect wishes",
    desc: "Share the secret wish-form link with colleagues or friends. They submit their name and birthday message — no account needed!",
  },
  {
    step: "3",
    icon: Gift,
    color: "bg-gradient-to-br from-pink-500 to-rose-500",
    title: "Reveal the surprise",
    desc: "On the birthday, open the surprise link. Watch the animated reveal with all their real wishes, confetti & music.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-montserrat">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between">
        <Logo size="md" />
        <Link
          href="/setup"
          className="hidden md:block rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-4 sm:px-6 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 whitespace-nowrap"
        >
          Create Surprise →
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-4 sm:px-6 md:py-28 flex flex-col items-center text-center min-h-[calc(100svh-52px)] sm:min-h-0 justify-center">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-200 opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-pink-200 opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200 opacity-20 blur-3xl" />

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
              <Cake size={20} className="relative z-10 text-white/90" />
              <span className="relative z-10"> Create a Surprise</span>
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

        {/* Floating emojis (desktop only) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden hidden sm:block">
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
              key={i}
              className="absolute text-2xl opacity-60 select-none animate-float-star"
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
      </section>

      {/* ── How it works ── */}
      <section id="how" className="px-6 py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="mb-4 text-3xl sm:text-4xl font-adlam text-purple-700">
            How it works
          </h2>
          <p className="mb-12 text-gray-500 text-base sm:text-lg">
            Three simple steps. Zero hassle.
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            {howItWorks.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="group relative rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-purple-50 p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${s.color} shadow-md transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon size={30} className="text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white shadow">
                    {s.step}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800">
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
      <section className="px-4 sm:px-6 py-16 sm:py-20 bg-gradient-to-br from-purple-50 to-pink-50">
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
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.color} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon size={20} />
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

      {/* ── Themes Preview ── */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl sm:text-4xl font-adlam text-purple-700">
            Choose your vibe
          </h2>
          <p className="mb-10 text-gray-500 text-base sm:text-lg">
            Two stunning themes to match every personality.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="group rounded-3xl overflow-hidden shadow-lg border border-gray-100 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="h-40 bg-gradient-to-br from-blue-100 to-teal-200 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center gap-3 text-4xl opacity-40">
                  🎊🎈🎉🎁
                </div>
                <p className="relative text-6xl">🎊</p>
              </div>
              <div className="p-6 text-left">
                <h3 className="text-xl font-bold text-purple-700 mb-1">
                  Confetti Carnival
                </h3>
                <p className="text-sm text-gray-500">
                  Colorful, playful & fun — perfect for anyone who loves a good
                  party!
                </p>
              </div>
            </div>
            <div className="group rounded-3xl overflow-hidden shadow-lg border border-gray-100 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="h-40 bg-gradient-to-br from-indigo-950 to-purple-950 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center gap-3 text-3xl opacity-20">
                  ⭐✨🌟💫
                </div>
                <p className="relative text-6xl">✨</p>
              </div>
              <div className="p-6 text-left">
                <h3 className="text-xl font-bold text-amber-600 mb-1">
                  Midnight Stars
                </h3>
                <p className="text-sm text-gray-500">
                  Dark, elegant & magical — for a sophisticated surprise under
                  the stars.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-r from-purple-600 to-pink-600 text-center text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-10 text-6xl flex flex-wrap gap-8 items-center justify-center select-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i}>🎂</span>
          ))}
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
            <Cake size={20} /> Start for Free
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
