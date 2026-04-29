import Link from "next/link";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-[var(--font-montserrat)]">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Logo size="md" />
        <Link
          href="/setup"
          className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          Create Surprise →
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-6 py-24 text-center">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-200 opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-pink-200 opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200 opacity-20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 border border-purple-100 px-4 py-1.5 text-sm font-medium text-purple-600 shadow-sm backdrop-blur">
            <span className="animate-pulse text-base">✨</span>
            The easiest birthday surprise tool for teams
          </div>
          <h1 className="mb-6 text-5xl font-[var(--font-pacifico)] font-bold leading-tight text-purple-700 md:text-6xl lg:text-7xl">
            Surprise the people
            <br />
            <span className="text-pink-600">you love 🎉</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 leading-relaxed">
            Set up a birthday surprise in minutes. Share a secret link with your
            team to collect heartfelt wishes, then reveal the full surprise page
            on the big day. No accounts needed. Pure magic. 🎈
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/setup"
              id="hero-cta"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-10 py-4 text-xl font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <span className="relative z-10">🎂 Create a Surprise</span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute -right-2 -top-2 h-10 w-10 animate-ping-slow rounded-full bg-white opacity-20" />
            </Link>
            <a
              href="#how"
              className="rounded-full border border-purple-200 bg-white px-8 py-4 text-lg font-semibold text-purple-700 transition-all duration-200 hover:border-purple-400 hover:shadow-md"
            >
              How it works ↓
            </a>
          </div>
        </div>

        {/* Floating emojis — positions are intentionally spread to look random */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
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
      <section id="how" className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="mb-4 text-4xl font-[var(--font-pacifico)] text-purple-700">
            How it works
          </h2>
          <p className="mb-14 text-gray-500 text-lg">
            Three simple steps. Zero hassle.
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                emoji: "⚙️",
                title: "Set it up",
                desc: "Enter the birthday person's name, pick a theme & songs, set a wish deadline, and create your surprise in under 2 minutes.",
              },
              {
                step: "2",
                emoji: "💌",
                title: "Collect wishes",
                desc: "Share the secret wish-form link with colleagues or friends. They submit their name and birthday message — no account needed!",
              },
              {
                step: "3",
                emoji: "🎉",
                title: "Reveal the surprise",
                desc: "On the birthday, open the surprise link. Watch the animated reveal with all their real wishes, confetti & music.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="group relative rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-purple-50 p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-600 text-3xl shadow-md">
                  {s.emoji}
                </div>
                <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white shadow">
                  {s.step}
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">
                  {s.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="mb-4 text-4xl font-[var(--font-pacifico)] text-purple-700">
              Everything you need
            </h2>
            <p className="text-gray-500 text-lg">
              Packed with features to make the surprise unforgettable.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "🎨",
                title: "Beautiful Themes",
                desc: "Choose from Confetti Carnival or Midnight Stars — more coming soon.",
              },
              {
                icon: "🔒",
                title: "Secret Links",
                desc: "Unguessable UUID links for the wish form — total secrecy until the big reveal.",
              },
              {
                icon: "🎵",
                title: "Birthday Music",
                desc: "Pick from curated songs or upload your own track. Control loop & volume.",
              },
              {
                icon: "💌",
                title: "Real Wishes",
                desc: "Every wish submitted by your team shows up live on the surprise page.",
              },
              {
                icon: "⏰",
                title: "Wish Deadline",
                desc: "Set a cut-off date — the form closes automatically before the birthday.",
              },
              {
                icon: "🖼️",
                title: "Custom Avatar",
                desc: "Upload a photo of the birthday person or let them be surprised seeing themselves.",
              },
              {
                icon: "🎂",
                title: "Cake Interaction",
                desc: "Interactive animated cake — visitors blow out candles and make a wish!",
              },
              {
                icon: "🥳",
                title: "Party Mode",
                desc: "One button to launch full-screen confetti, balloons, and party music.",
              },
              {
                icon: "📱",
                title: "Mobile Friendly",
                desc: "Looks great on phones — share the surprise link anywhere.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md"
              >
                <span className="mt-0.5 text-3xl">{f.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Themes Preview ── */}
      <section className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-4xl font-[var(--font-pacifico)] text-purple-700">
            Choose your vibe
          </h2>
          <p className="mb-12 text-gray-500 text-lg">
            Two stunning themes to match every personality.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="group rounded-3xl overflow-hidden shadow-lg border border-gray-100 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="h-40 bg-gradient-to-br from-blue-100 to-teal-200 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center gap-3 text-4xl opacity-40">
                  🎊🎈🎉🎁
                </div>
                <div className="relative text-center">
                  <p className="text-6xl">🎊</p>
                </div>
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
                <div className="relative text-center">
                  <p className="text-6xl">✨</p>
                </div>
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
      <section className="px-6 py-24 bg-gradient-to-r from-purple-600 to-pink-600 text-center text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-10 text-6xl flex flex-wrap gap-8 items-center justify-center select-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i}>🎂</span>
          ))}
        </div>
        <div className="relative mx-auto max-w-2xl">
          <h2 className="mb-4 text-4xl font-[var(--font-pacifico)] md:text-5xl">
            Ready to make someone's day? 🎉
          </h2>
          <p className="mb-10 text-lg text-white/80">
            It only takes 2 minutes to set up. Your team will love it.
          </p>
          <Link
            href="/setup"
            id="bottom-cta"
            className="inline-block rounded-full bg-white px-12 py-4 text-xl font-bold text-purple-700 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            🎂 Start for Free
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-8 bg-gray-50 text-center text-sm text-gray-400 border-t border-gray-100">
        <p>
          Made with ❤️ for teams everywhere ·{" "}
          <span className="font-[var(--font-pacifico)] text-purple-500">
            BirthdayDrop
          </span>
        </p>
      </footer>
    </main>
  );
}
