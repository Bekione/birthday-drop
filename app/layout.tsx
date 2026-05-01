import type { Metadata } from "next";
import {
  Pacifico,
  Montserrat,
  Playfair_Display,
  ADLaM_Display,
} from "next/font/google";
import "./globals.css";

const pacifico = Pacifico({
  variable: "--font-pacifico",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const adlam = ADLaM_Display({
  variable: "--font-adlam",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BirthdayDrop — Surprise the people you love 🎉",
  description:
    "Create a beautiful birthday surprise page, collect heartfelt wishes from colleagues or friends via a secret link, and reveal them all on the big day.",
  keywords: [
    "birthday surprise",
    "birthday wishes",
    "team surprise",
    "birthday celebration",
  ],
  openGraph: {
    title: "BirthdayDrop — Surprise the people you love 🎉",
    description:
      "Create a beautiful birthday surprise page and collect wishes from everyone!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${pacifico.variable} ${montserrat.variable} ${playfair.variable} ${adlam.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
