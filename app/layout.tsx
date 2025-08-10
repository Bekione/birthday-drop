import type { Metadata } from "next"
import { Pacifico, Montserrat } from 'next/font/google'
import "./globals.css"

// Define the fonts
const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pacifico", // Custom CSS variable for Pacifico
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat", // Custom CSS variable for Montserrat
})

export const metadata: Metadata = {
  title: "Happy Birthday, Boss!",
  description: "A special surprise page for Mohammed's birthday!",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${pacifico.variable} ${montserrat.variable}`}>
        {children}
      </body>
    </html>
  )
}
