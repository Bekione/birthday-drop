export type ThemeId = "confetti" | "midnight";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  emoji: string;
  preview: {
    bg: string;
    accent: string;
    card: string;
  };
  cssVars: Record<string, string>;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  confetti: {
    id: "confetti",
    name: "Confetti Carnival",
    description:
      "Colorful, playful & fun — perfect for anyone who loves a good party!",
    emoji: "🎊",
    preview: {
      bg: "from-blue-100 to-teal-200",
      accent: "text-purple-700",
      card: "bg-yellow-200",
    },
    cssVars: {
      "--theme-bg-from": "#dbeafe",
      "--theme-bg-to": "#99f6e4",
      "--theme-bg-gradient":
        "linear-gradient(135deg, #dbeafe 0%, #99f6e4 100%)",
      "--theme-loading-bg":
        "linear-gradient(270deg, #8e2de2, #4a00e0, #00c6ff, #0072ff)",
      "--theme-heading": "#7c3aed",
      "--theme-subheading": "#db2777",
      "--theme-text": "#1e293b",
      "--theme-card-front": "#fef08a",
      "--theme-card-back": "#bfdbfe",
      "--theme-card-text": "#1e293b",
      "--theme-btn-from": "#ec4899",
      "--theme-btn-to": "#9333ea",
      "--theme-btn-hover-from": "#db2777",
      "--theme-btn-hover-to": "#7c3aed",
      "--theme-party-btn-from": "#facc15",
      "--theme-party-btn-to": "#f97316",
      "--theme-date-pill": "linear-gradient(135deg, #ec4899, #9333ea)",
      "--theme-wish-section-bg": "rgba(255,255,255,0.4)",
      "--theme-star-color": "#9333ea",
    },
  },
  midnight: {
    id: "midnight",
    name: "Midnight Stars",
    description:
      "Dark, elegant & magical — for a sophisticated surprise under the stars.",
    emoji: "✨",
    preview: {
      bg: "from-indigo-950 to-purple-950",
      accent: "text-amber-400",
      card: "bg-indigo-900",
    },
    cssVars: {
      "--theme-bg-from": "#0f0c29",
      "--theme-bg-to": "#302b63",
      "--theme-bg-gradient":
        "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      "--theme-loading-bg":
        "linear-gradient(270deg, #0f0c29, #302b63, #24243e, #0f0c29)",
      "--theme-heading": "#fbbf24",
      "--theme-subheading": "#f59e0b",
      "--theme-text": "#e2e8f0",
      "--theme-card-front": "rgba(30, 27, 75, 0.9)",
      "--theme-card-back": "rgba(49, 46, 129, 0.9)",
      "--theme-card-text": "#fef3c7",
      "--theme-btn-from": "#b45309",
      "--theme-btn-to": "#d97706",
      "--theme-btn-hover-from": "#92400e",
      "--theme-btn-hover-to": "#b45309",
      "--theme-party-btn-from": "#7c3aed",
      "--theme-party-btn-to": "#4f46e5",
      "--theme-date-pill": "linear-gradient(135deg, #b45309, #d97706)",
      "--theme-wish-section-bg": "rgba(15,12,41,0.6)",
      "--theme-star-color": "#fbbf24",
    },
  },
};

export const DEFAULT_AUDIO_TRACKS = [
  {
    id: "track-1",
    title: "Happy Birthday (Bossa Nova)",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/happy-birthday-to-you-bossa-nova-style-arrangement-21399-SOn1WYgFsLMiUWvNzhrWRn3ligyGZQ.mp3",
    isDefault: true,
    order: 0,
  },
  {
    id: "track-2",
    title: "Upbeat Pop Birthday",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/applause-cheer-236786-cRd3Z8EmJ1B0qHrcUSivSPQHCLwbFU.mp3",
    isDefault: false,
    order: 1,
  },
];
